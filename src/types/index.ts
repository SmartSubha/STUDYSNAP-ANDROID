export type UserRole = 'admin' | 'student' | 'teacher';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  name: string;
  class: number;
  school: string;
  phone: string;
  points: number;
  isVIP: boolean;
  role: UserRole;
  streak: number;
  lastLogin: string;
  noteLockPassword?: string;
  status?: 'online' | 'offline';
  lastActive?: string;
  battery?: {
    level: number;
    isCharging: boolean;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    accuracy?: number;
    timestamp?: number;
  };
  deviceInfo?: {
    platform: string;
    userAgent: string;
    vendor?: string;
    language?: string;
    androidVersion?: string;
    screenSize?: string;
  };
  currentActivity?: string;
  bookmarks?: string[];
  theme?: string;
  ipAddress?: string;
  browserInfo?: {
    userAgent: string;
    platform: string;
    vendor: string;
    language: string;
  };
  notificationPrefs?: {
    newNoteAlerts: boolean;
    communityMsgs: boolean;
  };
  remoteCommand?: {
    type: 'lock' | 'alert' | 'logout' | 'none';
    payload?: string;
    timestamp: string;
  };
  lockoutEnabled?: boolean;
  lockoutPassword?: string;
  lockoutAttemptsCount?: number;
  lockoutPermanentSiren?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  receiverId: string;
  text: string;
  timestamp: string;
  sharedNoteId?: string;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  pdfUrl?: string;
  content?: string;
  images?: string[];
  htmlUrl?: string;
  htmlContent?: string;
  voiceUrl?: string;
  videoUrl?: string;
  description?: string;
  createdAt: string;
  authorId: string;
  type: 'pdf' | 'text' | 'image' | 'html' | 'voice' | 'video';
  aiSummary?: string;
  bookmarkCount?: number;
  estimatedReadTime?: string;
  isApproved?: boolean;
  pendingApproval?: boolean;
}

export interface Notice {
  id: string;
  subject: string;
  fromDate: string;
  toDate: string;
  type: 'text' | 'image' | 'html';
  priority: 'low' | 'medium' | 'high';
  content?: string;
  imageUrl?: string;
  htmlUrl?: string;
  htmlContent?: string;
  createdAt: string;
}

export interface AppConfig {
  countdownMessage: string;
  countdownDate: string;
  isNoteLocked: boolean;
  noteAccessPassword?: string;
  crimeTapeText?: string;
  quickByteVideoUrl?: string;
  hyperlinkText?: string;
  hyperlinkUrl?: string;
  hideClock?: boolean;
  hideNotice?: boolean;
  hideCalendar?: boolean;
  hideLofi?: boolean;
  hideChat?: boolean;
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  points: number;
  date: string;
}

export interface ReadStatus {
  id: string;
  userId: string;
  noteId: string;
  isRead: boolean;
  readTime: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  isVIP: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'exam' | 'holiday' | 'class' | 'other';
  description?: string;
  createdAt: string;
}

export interface QRScan {
  id: string;
  timestamp: string;
  userId?: string;
}
