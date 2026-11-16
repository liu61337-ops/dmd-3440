import { useCallback, useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MAJOR_ARCANA, type TarotCard } from '@/constants/tarot';
import { SHAKES_NEEDED, useShakeShuffle, type ShufflePhase } from '@/hooks/use-shake-shuffle';

const C = {
  bg: '#140F24',
  surface: '#221A3A',
  border: '#3A2F5C',
  gold: '#E8C872',
  text: '#F4EEFF',
  muted: '#B8AEDB',
  warn: '#FFB4A2',
};

type Reading = { card: TarotCard; reversed: boolean };

function drawCard(): Reading {
  const card = MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)];
  return { card, reversed: Math.random() < 0.3 };
}

function statusText(phase: ShufflePhase, shakes: number, pauseReason: string | null, error: string | null) {
  switch (phase) {
    case 'checking':
      return 'Checking for a motion sensor…';
    case 'unavailable':
      return 'No accelerometer found on this device. Shake-to-shuffle needs a physical phone (simulators don’t have one).';
    case 'denied':
      return 'Motion access was denied, so the deck can’t feel your shake. You can allow Motion & Fitness for this app in Settings, then come back.';
    case 'error':
      return `Something went wrong reading the sensor${error ? `: ${error}` : ''}. Try again.`;
    case 'idle':
      return 'Hold a question in your mind, then tap “Start shuffling”.';
    case 'shuffling':
      return shakes === 0
        ? 'Listening… shake your phone firmly to shuffle the deck.'
        : `Shuffling… ${shakes} of ${SHAKES_NEEDED} shakes. Keep going!`;
    case 'paused':
      if (pauseReason === 'inactive')
        return `Paused — no shaking for 15 seconds, so the sensor was turned off to save battery. Progress kept at ${shakes}/${SHAKES_NEEDED}.`;
      if (pauseReason === 'background')
        return `Paused because the app left the screen. Sensor turned off. Progress kept at ${shakes}/${SHAKES_NEEDED}.`;
      return `Paused. Sensor turned off. Progress kept at ${shakes}/${SHAKES_NEEDED}.`;
    case 'done':
      return 'The deck is shuffled. Your card has been drawn.';
  }
}

export default function ShuffleScreen() {
  const [reading, setReading] = useState<Reading | null>(null);
  const onShuffled = useCallback(() => setReading(drawCard()), []);
  const s = useShakeShuffle(onShuffled);

  const [wiggle] = useState(() => new Animated.Value(0));
  const [reveal] = useState(() => new Animated.Value(0));

  // Wiggle the deck on each counted shake (visual only; text says the same thing).
  useEffect(() => {
    if (!s.lastShakeAt) return;
    wiggle.setValue(0);
    Animated.sequence([
      Animated.timing(wiggle, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(wiggle, { toValue: -1, duration: 90, useNativeDriver: true }),
      Animated.timing(wiggle, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();
  }, [s.lastShakeAt, wiggle]);

  useEffect(() => {
    if (!reading) {
      reveal.setValue(0);
      return;
    }
    Animated.spring(reveal, { toValue: 1, friction: 6, useNativeDriver: true }).start();
  }, [reading, reveal]);

  const again = () => {
    setReading(null);
    s.reset();
  };

  const progress = Math.min(s.shakes / SHAKES_NEEDED, 1);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>MOTION SENSOR DEMO</Text>
          <Text style={styles.title} accessibilityRole="header">
            Shake to Shuffle
          </Text>
          <Text style={styles.subtitle}>Shake your phone to shuffle a tarot deck and draw one card.</Text>

          {/* Card area */}
          <View style={styles.cardArea}>
            {reading ? (
              <Animated.View
                accessible
                accessibilityLabel={`${reading.card.name}, ${reading.reversed ? 'reversed' : 'upright'}. ${
                  reading.reversed ? reading.card.reversed : reading.card.upright
                }`}
                style={[
                  styles.card,
                  styles.cardFace,
                  {
                    opacity: reveal,
                    transform: [
                      { scale: reveal.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                      { rotateY: reveal.interpolate({ inputRange: [0, 1], outputRange: ['90deg', '0deg'] }) },
                    ],
                  },
                ]}>
                <Text style={styles.cardNumber}>{reading.card.number}</Text>
                <Text style={[styles.cardSymbol, reading.reversed && styles.flipped]}>{reading.card.symbol}</Text>
                <Text style={styles.cardName}>{reading.card.name}</Text>
                <Text style={styles.orientation}>{reading.reversed ? '↓ Reversed' : '↑ Upright'}</Text>
              </Animated.View>
            ) : (
              <Animated.View
                importantForAccessibility="no-hide-descendants"
                style={[
                  styles.card,
                  styles.cardBack,
                  {
                    transform: [
                      { rotate: wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-8deg', '8deg'] }) },
                      { translateX: wiggle.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] }) },
                    ],
                  },
                ]}>
                <Text style={styles.backSymbol}>☾ ✦ ☽</Text>
              </Animated.View>
            )}
          </View>

          {reading && (
            <Text style={styles.meaning}>{reading.reversed ? reading.card.reversed : reading.card.upright}</Text>
          )}

          {/* Status: always visible text, announced to screen readers */}
          <View style={styles.statusBox}>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: s.sensorOn ? C.gold : C.border }]} />
              <Text style={styles.sensorLabel}>Sensor: {s.sensorOn ? 'ON (listening)' : 'OFF'}</Text>
              {s.sensorOn && <Text style={styles.force}>{s.force.toFixed(2)} g</Text>}
            </View>
            <Text
              style={[styles.status, (s.phase === 'denied' || s.phase === 'error' || s.phase === 'unavailable') && styles.warn]}
              accessibilityLiveRegion="polite"
              accessibilityRole="text">
              {statusText(s.phase, s.shakes, s.pauseReason, s.errorMessage)}
            </Text>

            {(s.phase === 'shuffling' || s.phase === 'paused') && (
              <View
                style={styles.track}
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel="Shuffle progress"
                accessibilityValue={{ min: 0, max: SHAKES_NEEDED, now: s.shakes }}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
            )}
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {(s.phase === 'idle' || s.phase === 'error') && <Button label="Start shuffling" onPress={s.start} />}
            {s.phase === 'shuffling' && <Button label="Pause" onPress={s.pause} secondary />}
            {s.phase === 'paused' && (
              <>
                <Button label="Resume shuffling" onPress={s.resume} />
                <Button label="Start over" onPress={again} secondary />
              </>
            )}
            {s.phase === 'done' && <Button label="Shuffle again" onPress={again} />}
            {s.phase === 'denied' && <Button label="Try again" onPress={s.start} secondary />}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Button({ label, onPress, secondary }: { label: string; onPress: () => void; secondary?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.buttonSecondary, pressed && { opacity: 0.7 }]}>
      <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

const CARD_W = 180;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  safe: { flex: 1 },
  content: { padding: 24, gap: 16, alignItems: 'stretch', maxWidth: 520, width: '100%', alignSelf: 'center' },
  eyebrow: { color: C.gold, letterSpacing: 2, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  title: { color: C.text, fontSize: 34, fontWeight: '700', textAlign: 'center', fontFamily: 'Georgia' },
  subtitle: { color: C.muted, fontSize: 16, textAlign: 'center', lineHeight: 22 },
  cardArea: { height: CARD_W * 1.65 + 20, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: CARD_W,
    height: CARD_W * 1.65,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBack: { backgroundColor: '#2E2150' },
  backSymbol: { color: C.gold, fontSize: 28, letterSpacing: 4 },
  cardFace: { backgroundColor: '#FBF5E6', justifyContent: 'space-between', paddingVertical: 18 },
  cardNumber: { color: '#5B4A1E', fontSize: 18, fontFamily: 'Georgia', fontWeight: '700' },
  cardSymbol: { color: '#3B2A6B', fontSize: 72 },
  flipped: { transform: [{ rotate: '180deg' }] },
  cardName: { color: '#2A1E4A', fontSize: 18, fontFamily: 'Georgia', fontWeight: '700', textAlign: 'center' },
  orientation: { color: '#5B4A1E', fontSize: 14, fontWeight: '600' },
  meaning: { color: C.text, fontSize: 18, lineHeight: 26, textAlign: 'center', fontFamily: 'Georgia' },
  statusBox: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, gap: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  sensorLabel: { color: C.text, fontWeight: '600', fontSize: 14, flex: 1 },
  force: { color: C.muted, fontVariant: ['tabular-nums'], fontSize: 14 },
  status: { color: C.text, fontSize: 16, lineHeight: 22 },
  warn: { color: C.warn },
  track: { height: 10, borderRadius: 5, backgroundColor: C.border, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: C.gold },
  controls: { gap: 10 },
  button: { backgroundColor: C.gold, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.gold },
  buttonText: { color: C.bg, fontSize: 17, fontWeight: '700' },
  buttonTextSecondary: { color: C.gold },
});
