import { useCallback } from "react";
import { Linking, Modal, Pressable, Text, View, StyleSheet } from "react-native";
import type { OtpManager } from "./managers";

type Props = {
  url: string;
  managers: OtpManager[];
  visible: boolean;
  onClose: () => void;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    width: "80%",
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
  managerButton: {
    paddingVertical: 10,
  },
  cancelButton: {
    marginTop: 16,
  },
  cancelText: {
    color: "red",
  },
});

// @NOTE: This modal is only used on Android, as iOS uses ActionSheetIOS.
export function ManagerPicker({ url, managers, visible, onClose }: Props) {
  const handleManagerPress = useCallback(async (manager: OtpManager) => {
    await Linking.openURL(manager.buildUrl(url));
    onClose();
  }, [url, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            Choose a password manager
          </Text>

          {managers.map((manager) => (
            <Pressable
              key={manager.name}
              onPress={() => handleManagerPress(manager)}
              style={styles.managerButton}
            >
              <Text>{manager.name}</Text>
            </Pressable>
          ))}

          <Pressable onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
