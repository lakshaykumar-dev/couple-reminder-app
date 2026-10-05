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
  onSave: (itemId: string, text: string, tabId: string, reminderEnabled: boolean) => void;
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
  const [reminderEnabled, setReminderEnabled] = useState(true);

  useEffect(() => {
    if (item) {
      setText(item.text);
      setSelectedTabId(item.tabId);
      setReminderEnabled(item.reminderEnabled !== false);
    }
  }, [item]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert('Empty Text', 'Please enter an item name.');
      return;
    }
    if (!item) return;

    onSave(item.id, trimmed, selectedTabId, reminderEnabled);
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
            Update task details, category, or reminder alerts.
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

          {/* 3-Hour Push Reminder Toggle */}
          <Text style={styles.sectionLabel}>3-Hour Push Reminder</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setReminderEnabled(!reminderEnabled)}
            style={[
              styles.reminderToggleCard,
              reminderEnabled && styles.reminderToggleCardActive,
            ]}
          >
            <View style={[styles.bellBadge, reminderEnabled && styles.bellBadgeActive]}>
              <Text style={styles.bellBadgeIcon}>{reminderEnabled ? '🔔' : '🔕'}</Text>
            </View>
            <View style={styles.reminderTextContainer}>
              <Text style={[styles.reminderTitle, reminderEnabled && styles.reminderTitleActive]}>
                {reminderEnabled ? '3-Hour Reminder Active' : 'Reminder Disabled'}
              </Text>
              <Text style={styles.reminderSubtitle}>
                {reminderEnabled
                  ? 'Sends push notification every 3 hours while unfinished'
                  : 'No periodic alerts will be sent'}
              </Text>
            </View>
          </TouchableOpacity>

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
  reminderToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    gap: 12,
  },
  reminderToggleCardActive: {
    backgroundColor: '#FFF5F7',
    borderColor: '#FFCCD5',
  },
  bellBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeActive: {
    backgroundColor: '#FFE5EC',
  },
  bellBadgeIcon: {
    fontSize: 18,
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  reminderTitleActive: {
    color: '#FF4D6D',
  },
  reminderSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
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
