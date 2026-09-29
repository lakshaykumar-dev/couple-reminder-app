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
import { CoupleProfile } from '../types/couple';

interface PairingModalProps {
  visible: boolean;
  profile: CoupleProfile;
  onClose: () => void;
  onSaveProfile: (profile: CoupleProfile) => void;
}

export const PairingModal: React.FC<PairingModalProps> = ({
  visible,
  profile,
  onClose,
  onSaveProfile,
}) => {
  const [coupleId, setCoupleId] = useState(profile.coupleId);
  const [myName, setMyName] = useState(profile.myName);

  const handleSave = () => {
    const cleanId = coupleId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const cleanName = myName.trim();

    if (!cleanId) {
      Alert.alert('Space ID Required', 'Please enter a shared Space ID so both phones connect to the same list.');
      return;
    }
    if (!cleanName) {
      Alert.alert('Your Name Required', 'Please enter your name so your partner knows who added items.');
      return;
    }

    onSaveProfile({
      ...profile,
      coupleId: cleanId,
      myName: cleanName,
    });
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
          <Text style={styles.title}>Couple Space & Pairing 💕</Text>
          <Text style={styles.subtitle}>
            Both partners must enter the exact same Shared Space ID to sync lists in real-time.
          </Text>

          {/* Couple Space ID */}
          <Text style={styles.sectionLabel}>Shared Space ID / Code:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. lakshay-home-2026"
            placeholderTextColor="#999999"
            value={coupleId}
            onChangeText={setCoupleId}
            autoCapitalize="none"
          />

          {/* User Name */}
          <Text style={styles.sectionLabel}>Your Name (shown to partner):</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Lakshay"
            placeholderTextColor="#999999"
            value={myName}
            onChangeText={setMyName}
          />

          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              💡 Tip: Tell your partner to enter "{coupleId || 'your-space-id'}" on their phone.
            </Text>
          </View>

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
              onPress={handleSave}
              style={styles.saveButton}
            >
              <Text style={styles.saveText}>Save & Connect</Text>
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
    color: '#666666',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
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
    marginBottom: 16,
  },
  tipBox: {
    backgroundColor: '#FFF0F3',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 12,
    color: '#FF4D6D',
    fontWeight: '500',
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
