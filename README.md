# react-native-otp-auth-link

A lightweight React Native module that helps you route `otpauth://` links to
third-party password managers such as 1Password, Bitwarden, Authy, LastPass,
Dashlane, Microsoft Authenticator, or fall back to Apple Passwords on iOS.

# Installation

```bash
yarn add react-native-otp-auth-link
```

## Post-install steps

### iOS

iOS restricts which custom URL schemes can be queried via `Linking.canOpenURL`.
If you don’t whitelist them, your app cannot detect or open password managers.


Add the following block to your `ios/<AppName>/Info.plist`:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>onepassword</string>
  <string>bitwarden</string>
  <string>authy</string>
  <string>lastpass</string>
  <string>dashlane</string>
  <string>msauthv2</string>
</array>
```
👉 No changes are required for Apple Passwords (iOS handles otpauth:// natively).

### Android

Since Android 11 (API 30), apps must declare which external packages they can query.
If you don’t, your app cannot detect or open password managers.

Add the following block to your `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest ...>
  <queries>
    <package android:name="com.agilebits.onepassword" />
    <package android:name="com.x8bit.bitwarden" />
    <package android:name="com.authy.authy" />
    <package android:name="com.lastpass.lpandroid" />
    <package android:name="com.dashlane" />
    <package android:name="com.azure.authenticator" />
  </queries>

  <application ...>
    ...
  </application>
</manifest>
```

## Expo

If you use Expo, add them in `app.config.js`:

```js
export default {
  ios: {
    infoPlist: {
      LSApplicationQueriesSchemes: [
        "onepassword",
        "bitwarden",
        "authy",
        "lastpass",
        "dashlane",
        "msauthv2",
      ],
    },
    ...
  },
  android: {
    query: [
      { scheme: "msauthenticator" },
      { scheme: "onepassword" },
      { scheme: "lastpass" },
      { scheme: "dashlane" },
      { scheme: "authy" },
    ],
    ...
  },
};
```

# Usage

```tsx
import { openOtpManager } from "react-native-otp-auth-link";

const url =
"otpauth://totp/Example:alice@example.com?secret=ABC123&issuer=Example";

await openOtpManager(url);
```

- On iOS: if multiple managers are available, an ActionSheet is shown.
- On Android: the system chooser handles the `otpauth://` link.


