# react-native-otp-auth-link

> **_NOTE:_**  This library is still in early development. Please open an issue
if you encounter any problems or have suggestions.

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
    <intent>
      <action android:name="android.intent.action.VIEW" />
      <data android:scheme="onepassword" />
    </intent>
    <intent>
      <action android:name="android.intent.action.VIEW" />
      <data android:scheme="bitwarden" />
    </intent>
    <intent>
      <action android:name="android.intent.action.VIEW" />
      <data android:scheme="authy" />
    </intent>
    <intent>
      <action android:name="android.intent.action.VIEW" />
      <data android:scheme="lastpass" />
    </intent>
    <intent>
      <action android:name="android.intent.action.VIEW" />
      <data android:scheme="dashlane" />
    </intent>
    <intent>
      <action android:name="android.intent.action.VIEW" />
      <data android:scheme="msauthv2" />
    </intent>
    <intent>
      <action android:name="android.intent.action.VIEW" />
      <data android:scheme="otpauth" />
    </intent>
  </queries>

  <application ...>
    ...
  </application>
</manifest>
```

## Expo

If you use Expo, you'll first need to crate a custom config plugin to modify the AndroidManifest.xml.

```js
// plugins/withAndroidPlugin.ts
import { withAndroidManifest, ConfigPlugin } from "expo/config-plugins";

const withAndroidPlugin: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const schemes = [
      "msauthenticator",
      "onepassword",
      "lastpass",
      "dashlane",
      "authy",
      "otpauth",
    ];

    config.modResults.manifest.queries = [
      {
        intent: schemes.map((scheme) => ({
          action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
          data: [{ $: { "android:scheme": scheme } }],
        })),
      },
    ];

    return config;
  });
};

export default withAndroidPlugin;
```

Then, in your `app.config.js`, include the plugin with the rest of your config
and the iOS `Info.plist` changes:

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
  plugins: ["./plugins/withAndroidPlugin", ...],
};
```

# Usage

> **_NOTE:_** React Native does not allow you to open modals from outside the
render tree. To properly support the manager picker on Android, use the
`useOtpManager` hook.

```
import { useOtpManager } from "react-native-otp-auth-link";

const { openManager, pickerData, hidePicker } = useOtpManager();

return (
  <View>
    <Button onPress={() => openManager('otpauth://...')} />
    {pickerData && (
      <ManagerPicker
        url={pickerData.url}
        managers={pickerData.managers}
        visible={true}
        onClose={hidePicker}
      />
    )}
  </View>
);
```

Otherwise, you can use the `openOtpManager` function directly.

```tsx
import { openOtpManager } from "react-native-otp-auth-link";

const url =
"otpauth://totp/Example:alice@example.com?secret=ABC123&issuer=Example";

await openOtpManager(url);
```

# Contributing
Contributions are welcome! Please open an issue or submit a pull request.

# License
MIT © [Dylan Duunk](https://github.com/DDuunk)
