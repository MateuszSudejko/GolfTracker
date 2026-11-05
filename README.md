# GolfTracker

A practice and round tracker for golfers, in the spirit of gym trackers like Strong. Log every ball at the driving range with a quick tap (club, distance, did it land close to your target), track putting drills, and record 9 or 18 hole rounds. Over time the app shows how each club and your scoring improve.

Free, open source, no accounts, no ads. All data stays on your phone.

## Status

Phase 1 of 6: app skeleton, local database, and settings (club bag, meters or yards, shot tags). Range, putting, and course modes come next.

## Requirements

- An iPhone with [Expo Go](https://apps.apple.com/app/expo-go/id982107779) installed (SDK 58)
- A free [Expo account](https://expo.dev/signup)
- A computer with [Node.js](https://nodejs.org) LTS and Git

The app runs inside Expo Go, so no Apple developer account is needed. On a physical iPhone, Expo Go only opens projects when Expo Go and the Expo CLI on your computer are signed in to the same Expo account.

## Run it

```bash
git clone <this repo url>
cd GolfTracker
npm install
npx expo login
npx expo start
```

Sign in to the same Expo account inside Expo Go, then scan the QR code shown in the terminal with the iPhone Camera app. Phone and computer must be on the same Wi-Fi.

## Use it without a laptop

Publish with EAS Update so Expo Go can open the app without your computer running:

```bash
npx eas-cli@latest init
npx eas-cli@latest update:configure
npx eas-cli@latest update --branch main --message "update" --platform ios
```

Open the update link it prints, scan the QR code with the iPhone Camera, and the project stays in Expo Go's recent list.

The phone needs an internet connection to open the app this way. With no signal (airplane mode) Expo Go does not open it.

If you fork this repo, `eas init` links it to your own Expo project. Remove the `extra.eas.projectId`, `owner`, and `updates.url` values from `app.json` first.

## Your data

Data is stored in a SQLite database inside Expo Go on your phone. Reinstalling or deleting Expo Go deletes it. Export and automatic backups are planned for a later phase.

## Development

```bash
npm run verify
```

Runs the type check, the tests, and a style check. Project rules: no comments and no emojis in code.

## License

MIT, see [LICENSE](LICENSE).
