import { Linking } from "react-native";

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
  /** render a custom picker component on Android if multiple managers are available */
  renderAndroidPicker?: React.ComponentType<{
    url: string;
    managers: OtpManager[];
    visible: boolean;
    onClose: () => void;
  }>;
};

export const defaultManagers: OtpManager[] = [
  { name: "Passwords", schemeProbe: "otpauth://", buildUrl: (url) => url },
  { name: "1Password", schemeProbe: "onepassword://", buildUrl: (url) => `onepassword://${encodeURIComponent(url)}` },
  { name: "Bitwarden", schemeProbe: "bitwarden://", buildUrl: (url) => `bitwarden://${encodeURIComponent(url)}` },
  { name: "Authy", schemeProbe: "authy://", buildUrl: (url) => `authy://${encodeURIComponent(url)}` },
  { name: "LastPass", schemeProbe: "lastpass://", buildUrl: (url) => `lastpass://${encodeURIComponent(url)}` },
  { name: "Dashlane", schemeProbe: "dashlane://", buildUrl: (url) => `dashlane://${encodeURIComponent(url)}` },
  { name: "Authenticator", schemeProbe: "msauthv2://", buildUrl: (url) => `msauthv2://${encodeURIComponent(url)}` },
];

export async function getAvailableManagers(opts?: Options): Promise<OtpManager[]> {
  const list = opts?.managers ?? defaultManagers;
  const checks = await Promise.all(
    list.map(async (m) => ({
      m,
      ok: await Linking.canOpenURL(m.schemeProbe).catch(() => false),
    }))
  );
  return checks.filter((c) => c.ok).map((c) => c.m);
}
