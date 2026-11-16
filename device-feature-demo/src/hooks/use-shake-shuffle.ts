import { Accelerometer } from 'expo-sensors';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export type ShufflePhase =
  | 'checking' // checking whether the device has an accelerometer
  | 'unavailable' // no accelerometer (e.g. iOS Simulator)
  | 'denied' // motion permission refused
  | 'error' // sensor threw an unexpected error
  | 'idle' // ready, sensor OFF
  | 'shuffling' // sensor ON, counting shakes
  | 'paused' // stopped early (by user, inactivity, or app backgrounded), sensor OFF
  | 'done'; // enough shakes, sensor OFF, card drawn

export type PauseReason = 'user' | 'inactive' | 'background';

/** How far (in g) total acceleration must move away from resting 1 g to count as a shake. */
const SHAKE_THRESHOLD_G = 0.8;
/** Ignore readings this soon after a counted shake, so one jolt is not counted many times. */
const SHAKE_DEBOUNCE_MS = 300;
/** Shakes needed to finish shuffling. */
export const SHAKES_NEEDED = 6;
/** Turn the sensor off if nothing happens for this long. */
const INACTIVITY_MS = 15000;
const UPDATE_INTERVAL_MS = 100;

export function useShakeShuffle(onShuffled: () => void) {
  const [phase, setPhase] = useState<ShufflePhase>('checking');
  const [shakes, setShakes] = useState(0);
  const [force, setForce] = useState(0);
  const [pauseReason, setPauseReason] = useState<PauseReason | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastShakeAt, setLastShakeAt] = useState(0);

  const subscription = useRef<{ remove: () => void } | null>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastShake = useRef(0);
  const shakeCount = useRef(0);
  const askedPermission = useRef(false);
  const onShuffledRef = useRef(onShuffled);

  useEffect(() => {
    onShuffledRef.current = onShuffled;
  }, [onShuffled]);

  const stopSensor = useCallback(() => {
    subscription.current?.remove();
    subscription.current = null;
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = null;
    setForce(0);
  }, []);

  const pause = useCallback(
    (reason: PauseReason) => {
      if (!subscription.current) return;
      stopSensor();
      setPauseReason(reason);
      setPhase('paused');
    },
    [stopSensor],
  );

  const armInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => pause('inactive'), INACTIVITY_MS);
  }, [pause]);

  // Check for hardware once on mount.
  useEffect(() => {
    let cancelled = false;
    // On web, isAvailableAsync waits for a motion event that may never come — give up after 3s.
    const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3000));
    Promise.race([Accelerometer.isAvailableAsync(), timeout])
      .then((available) => {
        if (!cancelled) setPhase(available ? 'idle' : 'unavailable');
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setErrorMessage(e instanceof Error ? e.message : String(e));
        setPhase('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Never leave the sensor running in the background or after the screen unmounts.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') pause('background');
    });
    return () => {
      sub.remove();
      stopSensor();
    };
  }, [pause, stopSensor]);

  const start = useCallback(
    async ({ resetCount }: { resetCount: boolean }) => {
      if (subscription.current) return; // already listening, never subscribe twice
      try {
        let perm = await Accelerometer.getPermissionsAsync();
        // Ask at most once per session, and only if the OS still allows asking.
        if (!perm.granted && perm.canAskAgain && !askedPermission.current) {
          askedPermission.current = true;
          perm = await Accelerometer.requestPermissionsAsync();
        }
        if (!perm.granted) {
          setPhase('denied');
          return;
        }

        if (resetCount) {
          shakeCount.current = 0;
          setShakes(0);
        }
        setPauseReason(null);
        lastShake.current = 0;

        Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
        subscription.current = Accelerometer.addListener(({ x, y, z }) => {
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          const delta = Math.abs(magnitude - 1); // remove gravity
          setForce(delta);

          const now = Date.now();
          if (delta < SHAKE_THRESHOLD_G || now - lastShake.current < SHAKE_DEBOUNCE_MS) return;

          lastShake.current = now;
          shakeCount.current += 1;
          setShakes(shakeCount.current);
          setLastShakeAt(now);
          armInactivityTimer();

          if (shakeCount.current >= SHAKES_NEEDED) {
            stopSensor();
            setPhase('done');
            onShuffledRef.current();
          }
        });
        armInactivityTimer();
        setPhase('shuffling');
      } catch (e) {
        stopSensor();
        setErrorMessage(e instanceof Error ? e.message : String(e));
        setPhase('error');
      }
    },
    [armInactivityTimer, stopSensor],
  );

  const reset = useCallback(() => {
    stopSensor();
    shakeCount.current = 0;
    setShakes(0);
    setPauseReason(null);
    setPhase('idle');
  }, [stopSensor]);

  return {
    phase,
    shakes,
    force,
    pauseReason,
    errorMessage,
    lastShakeAt,
    sensorOn: phase === 'shuffling',
    start: () => start({ resetCount: true }),
    resume: () => start({ resetCount: false }),
    pause: () => pause('user'),
    reset,
  };
}
