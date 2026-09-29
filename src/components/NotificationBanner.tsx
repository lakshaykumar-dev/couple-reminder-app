import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { ActivityNotification } from '../types/couple';

interface NotificationBannerProps {
  notification: ActivityNotification | null;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onDismiss,
}) => {
  const slideAnim = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    if (notification) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
      }).start();

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  if (!notification) return null;

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.bannerContent}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🔔</Text>
        </View>
        <View style={styles.textColumn}>
          <Text style={styles.authorBadge}>Partner Alert</Text>
          <Text style={styles.messageText} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDismiss}
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E24',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 77, 109, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 16,
  },
  textColumn: {
    flex: 1,
  },
  authorBadge: {
    fontSize: 11,
    color: '#FF758F',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    marginTop: 1,
  },
  closeButton: {
    padding: 6,
    marginLeft: 8,
  },
  closeText: {
    color: '#AAAAAA',
    fontSize: 14,
  },
});
