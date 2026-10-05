import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { CoupleItem } from '../types/couple';

interface ItemRowProps {
  item: CoupleItem;
  onToggle: (item: CoupleItem) => void;
  onDelete: (id: string) => void;
  onEdit?: (item: CoupleItem) => void;
  onToggleReminder?: (item: CoupleItem) => void;
}

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  onToggle,
  onDelete,
  onEdit,
  onToggleReminder,
}) => {
  const isReminderOn = item.reminderEnabled !== false;

  return (
    <View style={[styles.card, item.isCompleted && styles.cardCompleted]}>
      {/* Checkbox */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onToggle(item)}
        style={[styles.checkbox, item.isCompleted && styles.checkboxCompleted]}
      >
        {item.isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      {/* Content (Tap to Edit) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onEdit && onEdit(item)}
        style={styles.content}
      >
        <Text
          style={[styles.title, item.isCompleted && styles.titleCompleted]}
          numberOfLines={2}
        >
          {item.text}
        </Text>

        {/* Attribution & Reminder Status Subtitle */}
        <View style={styles.attributionRow}>
          <Text style={styles.attributionText}>
            {item.isCompleted
              ? `Done by ${item.completedBy || 'Partner'} ✨`
              : `Added by ${item.addedBy || 'Partner'}`}
            {!item.isCompleted && isReminderOn ? ' • 3h reminder on 🔔' : ''}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Action Buttons: Clean Minimalist Bell, Edit & Delete */}
      <View style={styles.actionsContainer}>
        {onToggleReminder && !item.isCompleted && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onToggleReminder(item)}
            style={[
              styles.iconCircle,
              isReminderOn ? styles.bellActiveCircle : styles.bellInactiveCircle,
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <Text style={styles.bellIcon}>{isReminderOn ? '🔔' : '🔕'}</Text>
          </TouchableOpacity>
        )}

        {onEdit && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onEdit(item)}
            style={styles.iconCircle}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <Text style={styles.editSymbol}>✎</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onDelete(item.id)}
          style={[styles.iconCircle, styles.deleteCircle]}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 8 }}
        >
          <Text style={styles.deleteSymbol}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardCompleted: {
    backgroundColor: '#FAFAFA',
    borderColor: '#ECECEC',
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  attributionRow: {
    marginTop: 4,
  },
  attributionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellActiveCircle: {
    backgroundColor: '#FFF0F3',
    borderWidth: 1,
    borderColor: '#FFD6E0',
  },
  bellInactiveCircle: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  bellIcon: {
    fontSize: 12,
  },
  editSymbol: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '700',
  },
  deleteCircle: {
    backgroundColor: '#F9FAFB',
  },
  deleteSymbol: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '800',
  },
});
