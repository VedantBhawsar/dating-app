// Settings models for the dating app

// Notification settings model
export interface NotificationSettings {
  newMatches: boolean;
  messages: boolean;
  likesReceived: boolean;
  profileVisits: boolean;
  appUpdates: boolean;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
}

// Privacy settings model
export interface PrivacySettings {
  profileVisibility: 'public' | 'matches-only' | 'hidden';
  showDistance: boolean;
  showLastActive: boolean;
  blockList: string[];
}

// Account settings model
export interface AccountSettings {
  email: string;
  phoneNumber?: string;
  language: string;
  emailNotifications: boolean;
  darkMode: boolean;
}

// User settings model that combines all settings
export interface UserSettings {
  id: string;
  userId: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  account: AccountSettings;
  createdAt: string;
  updatedAt: string;
}

// Default notification settings
export const defaultNotificationSettings: NotificationSettings = {
  newMatches: true,
  messages: true,
  likesReceived: true,
  profileVisits: true,
  appUpdates: true,
  permissionStatus: 'undetermined'
};

// Default privacy settings
export const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: 'public',
  showDistance: true,
  showLastActive: true,
  blockList: []
};

// Default account settings
export const defaultAccountSettings: AccountSettings = {
  email: '',
  language: 'en',
  emailNotifications: true,
  darkMode: false
};

// Default user settings
export const defaultUserSettings: Partial<UserSettings> = {
  notifications: defaultNotificationSettings,
  privacy: defaultPrivacySettings,
  account: defaultAccountSettings
};

// Report reason options
export const reportReasons = [
  'Inappropriate content',
  'Fake profile',
  'Harassment',
  'Scam or fraud',
  'Underage user',
  'Other'
];

// Account deletion reason options
export const deleteAccountReasons = [
  'Found a partner',
  'Taking a break from dating',
  'Not finding suitable matches',
  'Privacy concerns',
  'Created a new account',
  'Technical issues',
  'Other'
];

// Available languages
export const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'gu', name: 'Gujarati' }
];
