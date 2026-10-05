export interface CoupleTab {
  id: string;
  name: string;
  icon?: string;
  order: number;
  createdByName?: string;
}

export interface CoupleItem {
  id: string;
  text: string;
  quantity?: string;
  tabId: string;
  isCompleted: boolean;
  addedBy: string;
  completedBy?: string;
  createdAt: number;
  updatedAt?: number;
  reminderEnabled?: boolean;
}

export interface CoupleProfile {
  coupleId: string;
  myName: string;
  partnerName: string;
}

export interface ActivityNotification {
  id: string;
  message: string;
  author: string;
  timestamp: number;
}
