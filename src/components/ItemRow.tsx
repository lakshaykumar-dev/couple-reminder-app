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
}

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  onToggle,
  onDelete,
}) => {
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

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, item.isCompleted && styles.titleCompleted]}
          >
            {item.text}
          </Text>
          {item.quantity ? (
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>{item.quantity}</Text>
            </View>
          ) : null}
        </View>

        {/* Attribution Subtitle */}
        <View style={styles.attributionRow}>
          <Text style={styles.attributionText}>
            {item.isCompleted
              ? `Done by ${item.completedBy || 'Partner'} ✨`
              : `Added by ${item.addedBy || 'Partner'}`}
          </Text>
        </View>
      </View>

      {/* Delete Action */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onDelete(item.id)}
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardCompleted: {
    backgroundColor: '#FAF9F9',
    borderColor: '#ECEBEB',
    opacity: 0.75,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkboxCompleted: {
    backgroundColor: '#2EC4B6',
    borderColor: '#2EC4B6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2B2B2B',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  quantityBadge: {
    marginLeft: 8,
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF4D6D',
  },
  attributionRow: {
    marginTop: 3,
  },
  attributionText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 6,
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 14,
    color: '#C7C7CC',
    fontWeight: 'bold',
  },
});
