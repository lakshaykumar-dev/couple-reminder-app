import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { CoupleTab, CoupleItem, CoupleProfile, ActivityNotification } from '../types/couple';

const PROFILE_KEY = '@couple_profile_v1';

export const DEFAULT_TABS: Array<Omit<CoupleTab, 'id'>> = [
  { name: 'Grocery', icon: '🛒', order: 1 },
  { name: 'Chores', icon: '🧹', order: 2 },
  { name: 'Date Night', icon: '🍷', order: 3 },
  { name: 'Reminders', icon: '⏰', order: 4 },
];

// Load saved local profile (My Name, Partner Name, Couple Space ID)
export async function getLocalProfile(): Promise<CoupleProfile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading profile', e);
  }
  // Default profile if not set
  return {
    coupleId: 'our-happy-space',
    myName: 'Lakshay',
    partnerName: 'Partner',
  };
}

// Save profile locally
export async function saveLocalProfile(profile: CoupleProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile', e);
  }
}

// Real-time Tabs Subscription
export function subscribeToTabs(
  coupleId: string,
  onUpdate: (tabs: CoupleTab[]) => void
) {
  const tabsCol = collection(db, 'couples', coupleId, 'tabs');
  const q = query(tabsCol, orderBy('order', 'asc'));

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      // Seed default tabs on first load
      DEFAULT_TABS.forEach(async (tab, index) => {
        const id = tab.name.toLowerCase().replace(/\s+/g, '-');
        await setDoc(doc(db, 'couples', coupleId, 'tabs', id), {
          ...tab,
          order: index + 1,
        });
      });
      return;
    }

    const tabs: CoupleTab[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        icon: data.icon || '📝',
        order: data.order || 0,
        createdByName: data.createdByName,
      };
    });
    onUpdate(tabs);
  }, (err) => {
    console.error('Tabs snapshot error:', err);
  });
}

// Add a new dynamic Tab
export async function addNewTab(
  coupleId: string,
  name: string,
  icon: string,
  createdByName: string,
  currentTabCount: number
) {
  const id = name.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4);
  const tabDoc = doc(db, 'couples', coupleId, 'tabs', id);
  await setDoc(tabDoc, {
    name: name.trim(),
    icon: icon.trim() || '📌',
    order: currentTabCount + 1,
    createdByName,
    createdAt: Date.now(),
  });

  // Log activity
  await logActivity(coupleId, `${createdByName} created a new tab: "${name.trim()}"`, createdByName);
  return id;
}

// Delete a tab
export async function deleteTab(coupleId: string, tabId: string) {
  const tabDoc = doc(db, 'couples', coupleId, 'tabs', tabId);
  await deleteDoc(tabDoc);
}

// Real-time Items Subscription for a specific tab
export function subscribeToItems(
  coupleId: string,
  tabId: string,
  onUpdate: (items: CoupleItem[]) => void
) {
  const itemsCol = collection(db, 'couples', coupleId, 'tabs', tabId, 'items');
  const q = query(itemsCol, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const items: CoupleItem[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        text: data.text || '',
        quantity: data.quantity || '',
        tabId,
        isCompleted: !!data.isCompleted,
        addedBy: data.addedBy || 'Partner',
        completedBy: data.completedBy,
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt,
      };
    });
    onUpdate(items);
  }, (err) => {
    console.error(`Items snapshot error for tab ${tabId}:`, err);
  });
}

// Add Item
export async function addItem(
  coupleId: string,
  tabId: string,
  tabName: string,
  text: string,
  quantity: string,
  addedBy: string
) {
  const itemsCol = collection(db, 'couples', coupleId, 'tabs', tabId, 'items');
  await addDoc(itemsCol, {
    text: text.trim(),
    quantity: quantity.trim(),
    tabId,
    isCompleted: false,
    addedBy,
    createdAt: Date.now(),
  });

  // Log activity for partner notification
  const qtyText = quantity.trim() ? ` (${quantity.trim()})` : '';
  await logActivity(
    coupleId,
    `${addedBy} added "${text.trim()}${qtyText}" to ${tabName}`,
    addedBy
  );
}

// Toggle Item completion
export async function toggleItem(
  coupleId: string,
  tabId: string,
  tabName: string,
  itemId: string,
  currentStatus: boolean,
  itemText: string,
  actorName: string
) {
  const itemDoc = doc(db, 'couples', coupleId, 'tabs', tabId, 'items', itemId);
  const newStatus = !currentStatus;
  await updateDoc(itemDoc, {
    isCompleted: newStatus,
    completedBy: newStatus ? actorName : null,
    updatedAt: Date.now(),
  });

  if (newStatus) {
    await logActivity(
      coupleId,
      `${actorName} checked off "${itemText}" in ${tabName}`,
      actorName
    );
  }
}

// Delete Item
export async function deleteItem(
  coupleId: string,
  tabId: string,
  itemId: string
) {
  const itemDoc = doc(db, 'couples', coupleId, 'tabs', tabId, 'items', itemId);
  await deleteDoc(itemDoc);
}

// Log Activity (Used for Real-Time Cross-Partner In-App Alerts)
export async function logActivity(
  coupleId: string,
  message: string,
  author: string
) {
  try {
    const actCol = collection(db, 'couples', coupleId, 'activity');
    await addDoc(actCol, {
      message,
      author,
      timestamp: Date.now(),
    });
  } catch (e) {
    console.error('Failed to log activity', e);
  }
}

// Subscribe to Recent Partner Activities (Real-time Alert Bell / Toast)
export function subscribeToPartnerActivity(
  coupleId: string,
  currentUserName: string,
  onNewActivity: (act: ActivityNotification) => void
) {
  const actCol = collection(db, 'couples', coupleId, 'activity');
  const q = query(actCol, orderBy('timestamp', 'desc'), limit(1));

  let initialLoad = true;
  return onSnapshot(q, (snapshot) => {
    // Avoid triggering notification banner on initial historical query
    if (initialLoad) {
      initialLoad = false;
      return;
    }

    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        // Only alert if the activity was performed by the PARTNER (not by current user)
        if (data.author && data.author.toLowerCase() !== currentUserName.toLowerCase()) {
          onNewActivity({
            id: change.doc.id,
            message: data.message,
            author: data.author,
            timestamp: data.timestamp || Date.now(),
          });
        }
      }
    });
  }, (err) => {
    console.error('Activity listener error', err);
  });
}
