import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
  Keyboard,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { CoupleTab, CoupleItem, CoupleProfile, ActivityNotification } from './src/types/couple';
import {
  getLocalProfile,
  saveLocalProfile,
  getCachedTabs,
  getCachedItems,
  subscribeToTabs,
  subscribeToAllItems,
  addNewTab,
  updateTab,
  deleteTab,
  addItem,
  updateItem,
  toggleItem,
  deleteItem,
  subscribeToPartnerActivity,
  toggleItemReminder,
} from './src/services/coupleService';
import { TopTabBar } from './src/components/TopTabBar';
import { ItemRow } from './src/components/ItemRow';
import { NotificationBanner } from './src/components/NotificationBanner';
import { AddTabModal } from './src/components/AddTabModal';
import { EditTabModal } from './src/components/EditTabModal';
import { EditItemModal } from './src/components/EditItemModal';
import { PairingModal } from './src/components/PairingModal';
import { registerDeviceToken, onForegroundMessage } from './src/services/notificationService';


function MainScreen() {
  const insets = useSafeAreaInsets();

  // Profile & Space
  const [profile, setProfile] = useState<CoupleProfile>({
    coupleId: 'our-happy-space',
    myName: 'Lakshay',
    partnerName: 'Partner',
  });
  const [isPairingVisible, setPairingVisible] = useState(false);
  const [isAddTabVisible, setAddTabVisible] = useState(false);

  // Edit Modals State
  const [editingItem, setEditingItem] = useState<CoupleItem | null>(null);
  const [editingTab, setEditingTab] = useState<CoupleTab | null>(null);

  // Tabs & All Items (Cached in memory for 0ms lag-free tab switching)
  const [tabs, setTabs] = useState<CoupleTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [allItems, setAllItems] = useState<CoupleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Add input state
  const [newItemText, setNewItemText] = useState('');
  const [newItemReminder, setNewItemReminder] = useState(true);

  // Keyboard height state for precise input positioning above the keyboard
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Partner Notification Banner
  const [notification, setNotification] = useState<ActivityNotification | null>(null);

  // 1. Load Local Profile & Instant Cached Data
  useEffect(() => {
    async function load() {
      const p = await getLocalProfile();
      setProfile(p);

      // Instant 0ms display from local cache
      const [cachedTabs, cachedItems] = await Promise.all([
        getCachedTabs(p.coupleId),
        getCachedItems(p.coupleId),
      ]);
      if (cachedTabs.length > 0) {
        setTabs(cachedTabs);
        setActiveTabId(cachedTabs[0].id);
        setLoading(false);
      }
      if (cachedItems.length > 0) {
        setAllItems(cachedItems);
      }
    }
    load();
  }, []);

  // 2. Real-time Subscription to Tabs & All Items for Current Couple Space
  useEffect(() => {
    if (!profile.coupleId) return;

    const unsubscribeTabs = subscribeToTabs(profile.coupleId, (fetchedTabs) => {
      setTabs(fetchedTabs);
      setLoading(false);
      setActiveTabId((currentActive) => {
        if (!currentActive || !fetchedTabs.some((t) => t.id === currentActive)) {
          return fetchedTabs[0]?.id || '';
        }
        return currentActive;
      });
    });

    const unsubscribeItems = subscribeToAllItems(profile.coupleId, (fetchedItems) => {
      setAllItems(fetchedItems);
      setLoading(false);
    });

    return () => {
      unsubscribeTabs();
      unsubscribeItems();
    };
  }, [profile.coupleId]);

  // 3. Real-time Partner Activity Listener (In-app Notification Banner)
  useEffect(() => {
    if (!profile.coupleId) return;

    const unsubscribeActivity = subscribeToPartnerActivity(
      profile.coupleId,
      profile.myName,
      (act) => {
        setNotification(act);
      }
    );

    return () => unsubscribeActivity();
  }, [profile.coupleId, profile.myName]);

  // 4. Register FCM Push Notification Device Token
  useEffect(() => {
    if (!profile.coupleId || !profile.myName) return;
    registerDeviceToken(profile.coupleId, profile.myName);

    const unsubscribeFCM = onForegroundMessage((title, body) => {
      setNotification({
        id: String(Date.now()),
        message: body,
        author: 'Partner',
        timestamp: Date.now(),
      });
    });

    return () => unsubscribeFCM();
  }, [profile.coupleId, profile.myName]);

  // Active Tab metadata
  const currentTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId),
    [tabs, activeTabId]
  );

  // Filter items for the active tab instantly in memory (0ms lag, no cross-tab data leak)
  const activeTabItems = useMemo(() => {
    if (!activeTabId) return [];
    return allItems.filter((item) => item.tabId === activeTabId);
  }, [allItems, activeTabId]);

  // Real-time pending items count per tab for all tab badges
  const tabItemCounts = useMemo(() => {
    const counts: { [tabId: string]: number } = {};
    allItems.forEach((item) => {
      if (!item.isCompleted) {
        counts[item.tabId] = (counts[item.tabId] || 0) + 1;
      }
    });
    return counts;
  }, [allItems]);

  // Handle Add Item
  const handleAddItem = async () => {
    const text = newItemText.trim();
    if (!text) {
      Alert.alert('Empty Item', 'Please enter an item name.');
      return;
    }
    if (!activeTabId || !currentTab) {
      Alert.alert('No Tab Selected', 'Please select or create a tab first.');
      return;
    }

    try {
      await addItem(
        profile.coupleId,
        activeTabId,
        currentTab.name,
        text,
        profile.myName,
        newItemReminder
      );
      setNewItemText('');
      Keyboard.dismiss();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not add item.');
    }
  };

  // Handle Toggle Item Complete
  const handleToggle = async (item: CoupleItem) => {
    if (!currentTab) return;
    try {
      await toggleItem(
        profile.coupleId,
        item.id,
        item.isCompleted,
        item.text,
        currentTab.name,
        profile.myName
      );
    } catch (e: any) {
      console.error('Toggle error:', e);
    }
  };

  // Handle Toggle Reminder (3-Hour Push Notification)
  const handleToggleReminder = async (item: CoupleItem) => {
    try {
      await toggleItemReminder(
        profile.coupleId,
        item.id,
        item.reminderEnabled !== false
      );
    } catch (e: any) {
      console.error('Reminder toggle error:', e);
    }
  };

  // Handle Delete Item
  const handleDelete = (itemId: string) => {
    Alert.alert('Delete Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteItem(profile.coupleId, itemId),
      },
    ]);
  };

  // Handle Add Tab
  const handleCreateTab = async (name: string, icon: string) => {
    try {
      const newId = await addNewTab(
        profile.coupleId,
        name,
        icon,
        profile.myName,
        tabs.length
      );
      setActiveTabId(newId);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not create tab.');
    }
  };

  // Handle Manage Tab (Edit or Delete)
  const handleManageTab = (tab: CoupleTab) => {
    Alert.alert(
      `Manage "${tab.name}"`,
      'Choose an option:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '✏️ Edit Tab',
          onPress: () => setEditingTab(tab),
        },
        {
          text: '🗑️ Delete Tab',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Tab',
              `Delete "${tab.name}" and all items inside it?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteTab(profile.coupleId, tab.id);
                    } catch (e: any) {
                      Alert.alert('Error', e.message || 'Could not delete tab.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Handle Save Edited Item
  const handleSaveEditedItem = async (
    itemId: string,
    newText: string,
    newTabId: string,
    reminderEnabled?: boolean
  ) => {
    try {
      const targetTab = tabs.find((t) => t.id === newTabId) || currentTab;
      await updateItem(
        profile.coupleId,
        itemId,
        newText,
        newTabId,
        targetTab?.name || 'Tab',
        profile.myName,
        reminderEnabled
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not update item.');
    }
  };

  // Handle Save Edited Tab
  const handleSaveEditedTab = async (
    tabId: string,
    newName: string,
    newIcon: string
  ) => {
    try {
      await updateTab(profile.coupleId, tabId, newName, newIcon, profile.myName);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not update tab.');
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (newProfile: CoupleProfile) => {
    setProfile(newProfile);
    await saveLocalProfile(newProfile);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
      ]}
    >
      <StatusBar barStyle="dark-content" />

      {/* Floating Notification Banner */}
      <NotificationBanner
        notification={notification}
        onDismiss={() => setNotification(null)}
      />

      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appTitle}>Couple Reminder 💕</Text>
          <Text style={styles.userInfo}>
            Logged as <Text style={styles.userNameHighlight}>{profile.myName}</Text>
          </Text>
        </View>

        {/* Space ID Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPairingVisible(true)}
          style={styles.spacePill}
        >
          <Text style={styles.spacePillIcon}>🔗</Text>
          <Text style={styles.spacePillText} numberOfLines={1}>
            {profile.coupleId}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Top Tabs Bar */}
      <TopTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onOpenAddTab={() => setAddTabVisible(true)}
        tabItemCounts={tabItemCounts}
        onLongPressTab={handleManageTab}
      />

      {/* Items List Content */}
      <View style={styles.body}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FF4D6D" />
            <Text style={styles.loadingText}>Syncing couple list...</Text>
          </View>
        ) : (
          <FlatList
            data={activeTabItems}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <ItemRow
                item={item}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={(it) => setEditingItem(it)}
                onToggleReminder={handleToggleReminder}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>
                  {currentTab?.icon || '🛒'}
                </Text>
                <Text style={styles.emptyTitle}>
                  {currentTab ? `No items in ${currentTab.name}` : 'No items yet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  Add an item below so your partner can see it in real-time!
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Bottom Quick-Add Input Bar - Dynamically lifts above keyboard */}
      <View
        style={[
          styles.inputBar,
          {
            marginBottom: keyboardHeight,
            paddingBottom: keyboardHeight > 0 ? 10 : Math.max(insets.bottom, 10),
          },
        ]}
      >
        <TextInput
          style={styles.textInput}
          placeholder={`Add to ${currentTab?.name || 'list'}...`}
          placeholderTextColor="#999999"
          value={newItemText}
          onChangeText={setNewItemText}
          returnKeyType="done"
          onSubmitEditing={handleAddItem}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setNewItemReminder((prev) => !prev)}
          style={[
            styles.bellToggleBtn,
            newItemReminder ? styles.bellToggleBtnActive : styles.bellToggleBtnInactive,
          ]}
        >
          <Text style={styles.bellToggleText}>{newItemReminder ? '🔔' : '🔕'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddItem}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AddTabModal
        visible={isAddTabVisible}
        onClose={() => setAddTabVisible(false)}
        onAddTab={handleCreateTab}
      />

      <EditItemModal
        visible={!!editingItem}
        item={editingItem}
        tabs={tabs}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEditedItem}
      />

      <EditTabModal
        visible={!!editingTab}
        tab={editingTab}
        onClose={() => setEditingTab(null)}
        onSave={handleSaveEditedTab}
      />

      <PairingModal
        visible={isPairingVisible}
        profile={profile}
        onClose={() => setPairingVisible(false)}
        onSaveProfile={handleSaveProfile}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  userInfo: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  userNameHighlight: {
    color: '#FF4D6D',
    fontWeight: '700',
  },
  spacePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFCCD5',
    maxWidth: 160,
  },
  spacePillIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  spacePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF4D6D',
  },
  body: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#8E8E93',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444444',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  addButton: {
    backgroundColor: '#FF4D6D',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  bellToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  bellToggleBtnActive: {
    backgroundColor: '#FFF0F3',
    borderColor: '#FFD6DE',
  },
  bellToggleBtnInactive: {
    backgroundColor: '#F5F5F7',
    borderColor: '#E5E5EA',
  },
  bellToggleText: {
    fontSize: 18,
  },
});
