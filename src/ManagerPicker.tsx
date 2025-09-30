import { Linking, Modal, Pressable, Text, View } from "react-native";
import type { OtpManager } from "./managers";

type Props = {
  url: string;
  managers: OtpManager[];
  visible: boolean;
  onClose: () => void;
};

// @NOTE: This modal is only used on Android, as iOS uses ActionSheetIOS.
export function ManagerPicker({ url, managers, visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            padding: 16,
            width: "80%",
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 12 }}>
            Choose a password manager
          </Text>

          {managers.map((m) => (
            <Pressable
              key={m.name}
              onPress={async () => {
                await Linking.openURL(m.buildUrl(url));
                onClose();
              }}
              style={{ paddingVertical: 10 }}
            >
              <Text>{m.name}</Text>
            </Pressable>
          ))}

          <Pressable onPress={onClose} style={{ marginTop: 16 }}>
            <Text style={{ color: "red" }}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
