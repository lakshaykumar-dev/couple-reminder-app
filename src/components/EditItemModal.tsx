import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { CoupleItem, CoupleTab } from '../types/couple';

interface EditItemModalProps {
  visible: boolean;
  item: CoupleItem | null;
  tabs: CoupleTab[];
  onClose: () => void;
  onSave: (itemId: string, text: string, tabId: string) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  visible,
  item,
  tabs,
  onClose,
  onSave,
}) => {
  const [text, setText] = useState('');
  const [selectedTabId, setSelectedTabId] = useState('');

  useEffect(() => {
    if (item) {
      setText(item.text);
      setSelectedTabId(item.tabId);
    }
  }, [item]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert('Empty Text', 'Please enter an item name.');
      return;
    }
    if (!item) return;

    onSave(item.id, trimmed, selectedTabId);
    onClose();
  };

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Edit Item</Text>
          <Text style={styles.subtitle}>
            Update task name or move it to a different tab.
          </Text>

          {/* Item Name */}
          <Text style={styles.sectionLabel}>Item Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Almond Milk..."
            placeholderTextColor="#9CA3AF"
            value={text}
            onChangeText={setText}
            autoFocus
          />

          {/* Move to Tab */}
          <Text style={styles.sectionLabel}>Tab Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {tabs.map((tab) => {
              const isSelected = tab.id === selectedTabId;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setSelectedTabId(tab.id)}
                  style={[
                    styles.tabChip,
                    isSelected && styles.tabChipSelected,
                  ]}
                >
                  <Text style={styles.tabChipIcon}>{tab.icon || '📌'}</Text>
                  <Text
                    style={[
                      styles.tabChipLabel,
                      isSelected && styles.tabChipLabelSelected,
                    ]}
                  >
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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
              activeOpacity={0.8}
              onPress={handleSave}
              style={styles.saveButton}
            >
              <Text style={styles.saveText}>Save Changes</Text>
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
    marginBottom: 6,
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
    marginBottom: 14,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    marginBottom: 20,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabChipSelected: {
    backgroundColor: '#FFE5EC',
    borderColor: '#FF4D6D',
  },
  tabChipIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  tabChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  tabChipLabelSelected: {
    color: '#FF4D6D',
    fontWeight: '700',
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
  saveButton: {
    backgroundColor: '#FF4D6D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
