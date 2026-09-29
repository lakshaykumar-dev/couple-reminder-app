import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';

const ICON_PRESETS = ['🛒', '🧹', '🍷', '🎬', '💊', '🐶', '✈️', '🎁', '🍕', '🚗', '💡', '❤️'];

interface AddTabModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTab: (name: string, icon: string) => void;
}

export const AddTabModal: React.FC<AddTabModalProps> = ({
  visible,
  onClose,
  onAddTab,
}) => {
  const [tabName, setTabName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🛒');

  const handleCreate = () => {
    const trimmed = tabName.trim();
    if (!trimmed) {
      Alert.alert('Empty Name', 'Please enter a name for the tab (e.g. "Target Run").');
      return;
    }
    onAddTab(trimmed, selectedIcon);
    setTabName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Add New Couple Tab</Text>
          <Text style={styles.subtitle}>
            Create a shared category (e.g. Grocery, Weekend Trip, Movie List)
          </Text>

          {/* Icon Selector */}
          <Text style={styles.sectionLabel}>Pick an icon:</Text>
          <View style={styles.iconRow}>
            {ICON_PRESETS.map((icon) => (
              <TouchableOpacity
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                style={[
                  styles.iconTile,
                  selectedIcon === icon && styles.iconTileSelected,
                ]}
              >
                <Text style={styles.iconText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Name Input */}
          <Text style={styles.sectionLabel}>Tab Title:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Weekend Trip, Grocery..."
            placeholderTextColor="#999999"
            value={tabName}
            onChangeText={setTabName}
            maxLength={25}
          />

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCreate}
              style={styles.createButton}
            >
              <Text style={styles.createText}>Create Tab</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 13,
    color: '#777777',
    marginTop: 4,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 8,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTileSelected: {
    backgroundColor: '#FFE5EC',
    borderWidth: 2,
    borderColor: '#FF4D6D',
  },
  iconText: {
    fontSize: 20,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  cancelText: {
    fontSize: 14,
    color: '#777777',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#FF4D6D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  createText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
