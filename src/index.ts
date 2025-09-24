import { ActionSheetIOS, Linking, Platform } from "react-native";

export type OtpManager = {
  name: string;
  schemeProbe: string; // e.g. "onepassword://"
  buildUrl: (url: string) => string; // final deeplink
};

export type Options = {
  /** Override the default known managers list */
  managers?: OtpManager[];
  /** If no manager is available on iOS, fallback to opening the url:// directly (Apple Passwords) */
  fallbackToSystem?: boolean;
};

const defaultManagers: OtpManager[] = [
  // 1Password
  {
    name: "1Password",
    schemeProbe: "onepassword://",
    // docs: https://developer.1password.com/docs/mobile/ios/ (deeplinks vary by version)
    buildUrl: (url) => `onepassword://add-item?otp=${encodeURIComponent(url)}`
  },
  // Bitwarden
  {
    name: "Bitwarden",
    schemeProbe: "bitwarden://",
    // community-documented
    buildUrl: (url) => `bitwarden://otp/add?data=${encodeURIComponent(url)}`
  },
  // Authy
  {
    name: "Authy",
    schemeProbe: "authy://",
    buildUrl: (url) => `authy://otp/add?url=${encodeURIComponent(url)}`
  }
];

export async function getAvailableManagers(opts?: Options): Promise<OtpManager[]> {
  const list = opts?.managers ?? defaultManagers;
  const checks = await Promise.all(
    list.map(async (m) => ({
      m,
      ok: await Linking.canOpenURL(m.schemeProbe).catch(() => false),
    }))
  );
  // Always return an array
  return checks.filter((c) => c.ok).map((c) => c.m);
}

/**
 * Opens an OTP manager. On iOS shows an ActionSheet if multiple are available.
 * On Android, the system chooser usally appears for otpauth:// directly.
 */
export async function openOtpManager(url: string, opts?: Options) {
  if (Platform.OS === "android") {
    // On Android, just open the otpauth:// url directly and let the system handle it
    await Linking.openURL(url);
    return;
  }

  const available: OtpManager[] = (await getAvailableManagers(opts)) ?? [];

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

