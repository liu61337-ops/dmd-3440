# Bank of America — Redesigned Dispute Flow (React Native / Expo)

This implements the **Improved Flow** from the "Disputing a Charge" user-flow
assignment: disputing a transaction end-to-end, in-app, with visible status
tracking — instead of the original flow's dead-end into a phone call.

## What's implemented

| # | Screen | File |
|---|---|---|
| 1 | Transaction Detail (entry point) | `src/screens/TransactionDetailScreen.js` |
| 2 | Confirm Dispute | `src/screens/ConfirmDisputeScreen.js` |
| 3 | Select Reason | `src/screens/SelectReasonScreen.js` |
| 4 | Additional Details (optional) | `src/screens/AdditionalDetailsScreen.js` |
| 5 | Review Before Submitting | `src/screens/ReviewScreen.js` |
| 6 | Submission Confirmation | `src/screens/ConfirmationScreen.js` |
| 7 | Disputes list (status tracker) | `src/screens/DisputesListScreen.js` |
| 8 | Dispute Detail / Resolution | `src/screens/DisputeDetailScreen.js` |

Everything is one stack navigator (`App.js`) — screens are pushed in
sequence and the user can navigate back at any point. A single React
Context (`src/AppContext.js`) holds the in-progress form fields (reason,
notes) and the list of submitted disputes, so any screen can read or
update that shared state.

**Note on the "resolved" notification:** a real bank app would resolve
disputes on its own backend timeline and push a notification when done.
Wiring that up for real (server + push tokens) is out of scope here, so
the Dispute Detail screen has a **"Simulate: mark as resolved"** button —
press it on camera to demonstrate that the status updates immediately and
lives in the app, instead of the original flow's "call again or wait for
a letter."

## Running it

You'll need [Node.js](https://nodejs.org) and the Expo Go app on your phone
(or an iOS/Android simulator).

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press
`i` / `a` in the terminal to open a simulator.

## Recording the demo video (≤ 1 minute)

Suggested path through the app, matching the improved flow end to end:

1. Tap **"Dispute this charge"** on the transaction detail screen.
2. Tap **"Yes, continue"** on the confirmation card.
3. Pick a reason (e.g. "I don't recognize this charge") → **Continue**.
4. Skip or add a note on Additional Details → **Continue**.
5. Review the summary (point out the **Edit** links) → **Submit dispute**.
6. Confirmation screen: show the **reference number** and 10-business-day
   estimate → tap **"View dispute status"**.
7. On the Disputes list, tap into the new dispute and show its status.
8. Tap **"Simulate: mark as resolved"** to show the status update happening
   in-app, with no phone call.

While walking through it, call out two or three specific improvements
over the original flow:
- The dispute entry point is a single, clearly labeled button on the
  transaction itself — not a buried, ambiguously-named menu item.
- The form is pre-filled with the transaction data the app already has —
  the user never re-explains the merchant, amount, or date.
- The flow never hands off to a phone call; everything from triggering the
  dispute to seeing its resolution happens in-app.
- A dedicated status screen means the user can check progress anytime,
  instead of the original's "call again or wait for a letter."

## Design notes

Palette and type choices are in `src/theme.js` — kept deliberately calm
(warm paper background, one muted teal for progress/trust, one muted rust
reserved only for the dispute-trigger button) rather than loud or
alarm-red, since disputing a charge is already a moment of mild stress for
the user. The numbered step indicator (`src/components/StepProgress.js`)
is used only on the three screens that are a genuine sequence
(Reason → Details → Review), not decoratively elsewhere.
