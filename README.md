# react-native-otp-auth-link

A React Native module that helps you route `otpauth://` links to apps like
1Password, Bitwarden, Authy, etc.

# Installation

```bash
yarn add react-native-otp-auth-link
```

## Post-install steps

### iOS

iOS restricts which custom URL schemes your app is allowed to query with `Linking.canOpenURL`.
If you don’t whitelist them, your app will not be able to detect or open password managers like 1Password, Bitwarden, or Authy.

To fix this, add the following block to your `ios/<AppName>/Info.plist`:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>onepassword</string>
    <string>bitwarden</string>
    <string>authy</string>
</array>
```

### Android

Starting with Android 11 (API level 30), apps must declare which external apps
they can query.
If you don’t whitelist them, your app will not be able to detect or open password managers like 1Password, Bitwarden, or Authy.

To fix this, add the following block to your `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest ...>
  <queries>
    <package android:name="com.onepassword" />
    <package android:name="com.bitwarden" />
    <package android:name="com.authy.authy" />
  </queries>

  <application ...>
    ...
  </application>
</manifest>
```
