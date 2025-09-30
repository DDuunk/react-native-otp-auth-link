import React from "react";
import { ActionSheetIOS, Linking, Platform } from "react-native";
import { getAvailableManagers, Options, OtpManager } from "./managers";

export class AndroidPickerResult extends Error {
  constructor(
    public type: 'picker',
    public url: string,
    public managers: OtpManager[]
  ) {
    super('Android picker required');
    this.name = 'AndroidPickerResult';
  }
}

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

    // For Android, we need to return the picker data instead of trying to render a modal
    // The calling component should handle the modal rendering
    throw new AndroidPickerResult('picker', url, available);
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

/**
 * Hook for handling OTP manager selection on Android.
 * Use this in your React components to properly handle the modal.
 *
 * @example
 * ```tsx
 * const { openManager, pickerData, hidePicker } = useOtpManager();
 *
 * return (
 *   <View>
 *     <Button onPress={() => openManager('otpauth://...')} />
 *     {pickerData && (
 *       <ManagerPicker
 *         url={pickerData.url}
 *         managers={pickerData.managers}
 *         visible={true}
 *         onClose={hidePicker}
 *       />
 *     )}
 *   </View>
 * );
 * ```
 */
export function useOtpManager() {
  const [pickerData, setPickerData] = React.useState<{ url: string; managers: OtpManager[] } | null>(null);

  const openManager = async (url: string, opts?: Options) => {
    try {
      await openOtpManager(url, opts);
    } catch (result: unknown) {
      if (result instanceof AndroidPickerResult) {
        setPickerData({ url: result.url, managers: result.managers });
      } else {
        throw result;
      }
    }
  };

  const showPicker = (url: string, managers: OtpManager[]) => {
    setPickerData({ url, managers });
  };

  const hidePicker = () => {
    setPickerData(null);
  };

  return {
    openManager,
    showPicker,
    pickerData,
    hidePicker,
  };
}
