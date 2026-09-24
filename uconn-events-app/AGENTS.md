This is an Expo/React Native mobile application — UConn Events, an app for students to find local events. Prioritize mobile-first patterns, performance, and cross-platform compatibility (iOS, Android, web). The screens in `src/app/` are still create-expo-app starter placeholders — event features aren't built yet. The root `README.md` is stock boilerplate and partly wrong (says `app/`; routes actually live in `src/app/`) — trust config and code over it.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

This is an npm project (`package-lock.json`) — use `npx`, not `bunx`/`yarn`/`pnpm`.

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # dev server (also: npm run android|ios|web)
npx expo lint [path]        # lint; pass a file/dir for a focused run
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Verification gate: run lint and typecheck before declaring any task done. There is no test suite (no test script or runner) — lint + typecheck are the whole verification.

- Fresh clone: `npx tsc --noEmit` fails with ~200 misleading module/JSX errors until the generated, gitignored `expo-env.d.ts` exists. Run `npx expo start` once, or create the file containing `/// <reference types="expo/types" />`.
- Fresh clone: the first `npx expo lint` run bootstraps ESLint — installs `eslint` + `eslint-config-expo` and writes `eslint.config.js`.
- Lint baseline: `npx expo lint` exits 1 on one pre-existing starter-template error in `src/hooks/use-color-scheme.web.ts` (`react-hooks/set-state-in-effect`). Not your regression unless you touched that file.
- Environment quirk on this machine: files have read-as-empty while keeping their stat size, and `git status` has hung/exited 138 or missed dirt. If tsc or git behave absurdly (hundreds of unexpected errors, `cat tsconfig.json` prints nothing though `ls -l` shows bytes): restore content with `git show HEAD:<file> > <file>` and check dirt with `git diff HEAD`. A `npx tsc` run that prints "This is not the tsc command you are looking for" means `node_modules` is broken — run `npm install`.

## Navigation & structure

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md
- Path aliases (tsconfig): `@/*` → `src/*`, `@/assets/*` → `assets/*` — use them instead of deep relative imports.
- Bottom tabs are implemented **twice**: `src/components/app-tabs.tsx` uses `NativeTabs` from `expo-router/unstable-native-tabs` (native), `app-tabs.web.tsx` uses headless `Tabs` from `expo-router/ui` (web). Platform splits use `.web.tsx` suffixes — update both when changing tab navigation or routes.
- Theme values live in `src/constants/theme.ts` (`useTheme()`, `ThemedText`/`ThemedView`); it side-effect-imports `global.css` (web CSS variables) — don't remove that import.
- `app.json` enables the `typedRoutes` and `reactCompiler` experiments — rely on the compiler; skip manual `useMemo`/`React.memo`.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `npx eas-cli@latest <command>`; substitute that for bare `eas` in docs examples. There's no `eas.json` yet — `eas build` will prompt to configure it.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- `npm run reset-project` is destructive — it moves or deletes `src/` and `scripts/`. Never run it unless explicitly asked.
- Prefer recommended Expo modules over third-party libraries. Docs: https://docs.expo.dev/versions/latest/index.md
