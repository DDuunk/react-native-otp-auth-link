import React from "react";
import { ActionSheetIOS, Linking, Platform } from "react-native";
import { getAvailableManagers, Options, OtpManager } from "./managers";
import { ManagerPicker } from "./ManagerPicker";

/**
 * Opens an OTP (one-time password) manager app with the provided `otpauth://` URL.
 *
 * Behavior:
 * - On **iOS**:
 *   - If no managers are available → falls back to opening the `otpauth://` URL
 *     directly (Apple Passwords) unless `opts.fallbackToSystem` is set to `false`.
 *   - If exactly one manager is available → opens it directly.
 *   - If multiple managers are available → shows an `ActionSheetIOS` to let
 *     the user choose.
 *
 * - On **Android**:
 *   - If no managers are available → redirects user to the Google Authenticator Play Store page.
 *   - If exactly one manager is available → opens it directly.
 *   - If multiple managers are available → shows a modal (`ManagerPicker` by default),
 *     which can be overridden via `opts.renderAndroidPicker`.
 *
 * @param url The `otpauth://` URL (or compatible TOTP URI) to open in a password manager.
 * @param opts Optional configuration:
 *   - `managers`: Override the known list of OTP managers.
 *   - `fallbackToSystem`: On iOS, if no managers are available, whether to fallback
 *      to Apple Passwords (`true` by default).
 *   - `renderAndroidPicker`: Custom React component to render instead of the default modal picker.
 *
 * @returns A promise that resolves once the manager is opened (or canceled).
 */
export async function openOtpManager(url: string, opts?: Options) {
  const available: OtpManager[] = await getAvailableManagers(opts);

  if (Platform.OS === "android") {
    if (available.length === 0) {
      // Google Authenticator Play Store URL
      await Linking.openURL(
        "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
      );
      return;
    }

    if (available.length === 1) {
      // Only one available, open it directly
      await Linking.openURL(available[0].buildUrl(url));
      return;
    }

    // Show a modal to pick a manager
    return new Promise<void>((resolve) => {
      const ModalWrapper = () => {
        const [visible, setVisible] = React.useState(true);
        const Component = opts?.renderAndroidPicker ?? ManagerPicker;

        return (
          <Component
            url={url}
            managers={available}
            visible={visible}
            onClose={() => {
              setVisible(false);
              resolve();
            }}
          />
        );
      };

      const { AppRegistry } = require("react-native");
      AppRegistry.registerComponent("OtpManagerPickerModal", () => ModalWrapper);
    });
  }

  // iOS
  if (available.length === 0) {
    if (opts?.fallbackToSystem !== false) {
      // No known manager, fallback to opening the otpauth:// url directly (Apple Passwords)
      await Linking.openURL(url);
    }
    return;
  }

  if (available.length === 1) {
    // Only one available, open it directly
    await Linking.openURL(available[0].buildUrl(url));
    return;
  }

  return new Promise<void>((resolve) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...available.map(m => m.name), "Cancel"],
        cancelButtonIndex: available.length
      },
      async (idx) => {
        if (idx < available.length) {
          Linking.openURL(available[idx].buildUrl(url)).finally(() => resolve());
        } else {
          resolve();
        }
      });
  });
}
