import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/config";


// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      console.log("Token found, adding to request header");
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("No token found in AsyncStorage");
    }
    return config;
  },
  (error) => {
    console.error("API Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      "API Response Error:",
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
  }) => {
    try {
      const response = await api.post("/auth/register", userData);

      // Store tokens in AsyncStorage
      if (response.data.accessToken) {
        await AsyncStorage.setItem("accessToken", response.data.accessToken);
      }
      if (response.data.refreshToken) {
        await AsyncStorage.setItem("refreshToken", response.data.refreshToken);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      // Store tokens in AsyncStorage
      if (response.data.accessToken) {
        await AsyncStorage.setItem("accessToken", response.data.accessToken);
      }
      if (response.data.refreshToken) {
        await AsyncStorage.setItem("refreshToken", response.data.refreshToken);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  getUserByToken: async ()=> {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  }
};

export const profileService = {
  getProfile: async () => {
    try {
      const response = await api.get("/profile");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  updateProfile: async (profileData: {
    displayName?: string;
    bio?: string;
    isHidden?: boolean;
  }) => {
    try {
      const response = await api.put("/profile", profileData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  updateBasicInfo: async (basicInfo: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    birthDate?: string;
    location?: object;
    height?: number;
    maritalStatus?: string;
    children?: string;
  }) => {
    try {
      const response = await api.put("/profile/basic", basicInfo);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  updateCasteInfo: async (casteInfo: {
    religion?: string;
    caste?: string;
    subCaste?: string;
    motherTongue?: string;
    community?: string;
  }) => {
    try {
      const response = await api.put("/profile/caste", casteInfo);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  updateOccupationInfo: async (occupationInfo: {
    education?: string;
    highestDegree?: string;
    occupation?: string;
    employedIn?: string;
    companyName?: string;
    jobTitle?: string;
    annualIncome?: string;
  }) => {
    try {
      const response = await api.put("/profile/occupation", occupationInfo);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  updateLifestyleInfo: async (lifestyleInfo: {
    diet?: string;
    smoking?: string;
    drinking?: string;
    livingArrangement?: string;
    hasDisability?: boolean;
    disabilityDetails?: string;
  }) => {
    try {
      const response = await api.put("/profile/lifestyle", lifestyleInfo);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  updatePersonalityInfo: async (personalityInfo: {
    hobbies?: string[];
    interests?: string[];
    personalityTraits?: string[];
    musicTaste?: string[];
    movieTaste?: string[];
    sportsInterest?: string[];
    travelStyle?: string;
  }) => {
    try {
      const response = await api.put("/profile/personality", personalityInfo);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  updateRelationshipPreferences: async (relationshipPrefs: {
    lookingFor?: string[];
    ageRangeMin?: number;
    ageRangeMax?: number;
    heightRangeMin?: number;
    heightRangeMax?: number;
    distanceRange?: number;
    preferredReligion?: string[];
    preferredCaste?: string[];
    educationPreference?: string[];
    occupationPreference?: string[];
    incomePreference?: string;
  }) => {
    try {
      const response = await api.put("/profile/preferences", relationshipPrefs);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  updateValuesPlan: async (valuesPlan: {
    familyValues?: string;
    religiousBeliefs?: string;
    politicalViews?: string;
    wantsChildren?: string;
    futureGoals?: string[];
    marriagePlans?: string;
    relocateWilling?: boolean;
  }) => {
    try {
      const response = await api.put("/profile/values", valuesPlan);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getProfileCompletion: async () => {
    try {
      const response = await api.get("/profile/completion");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },
};

export const matchService = {
  getPotentialMatches: async (limit = 20, page = 1) => {
    try {
      const response = await api.get(
        `/matches/potential?limit=${limit}&page=${page}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getConfirmedMatches: async (limit = 20, page = 1) => {
    try {
      const response = await api.get(
        `/matches/confirmed?limit=${limit}&page=${page}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getMatchSummary: async () => {
    try {
      const response = await api.get("/matches/summary");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getMatchDetails: async (matchId: string) => {
    try {
      const response = await api.get(`/matches/${matchId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  expressInterest: async (userId: string) => {
    try {
      // The endpoint expects just the userId in the URL
      console.log(`Expressing interest in user: ${userId}`);
      const response = await api.post(`/matches/interest/${userId}`, {});
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Express interest error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  makeMatchDecision: async (
    matchId: string,
    decision: "ACCEPTED" | "REJECTED"
  ) => {
    try {
      const response = await api.post(`/matches/decision/${matchId}`, {
        decision,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },
};

export const messageService = {
  getChats: async (limit = 20, page = 1) => {
    try {
      const response = await api.get(`/chats?limit=${limit}&page=${page}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getChatById: async (chatId: string) => {
    try {
      const response = await api.get(`/chats/${chatId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getMessages: async (chatId: string, limit = 20, page = 1) => {
    try {
      const response = await api.get(
        `/chats/${chatId}/messages?limit=${limit}&page=${page}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  sendMessage: async (
    chatId: string,
    content: string,
    messageType = "TEXT"
  ) => {
    try {
      const response = await api.post(`/chats/${chatId}/messages`, {
        content,
        messageType,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  markMessagesAsRead: async (chatId: string, messageIds: string[]) => {
    try {
      const response = await api.post(`/chats/${chatId}/messages/read`, {
        messageIds,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },
};

export const settingsService = {
  // Helper function to save settings to local storage
  saveSettingsToLocalStorage: async (settings: any) => {
    try {
      await AsyncStorage.setItem("userSettings", JSON.stringify(settings));
      console.log("Settings saved to local storage");
    } catch (error) {
      console.error("Error saving settings to local storage:", error);
    }
  },

  // Helper function to get settings from local storage
  getSettingsFromLocalStorage: async () => {
    try {
      const settings = await AsyncStorage.getItem("userSettings");
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error("Error getting settings from local storage:", error);
      return null;
    }
  },

  getSettings: async () => {
    try {
      // First try to get from API
      const response = await api.get("/settings");
      const settings = response.data;

      // Save to local storage for offline access
      await settingsService.saveSettingsToLocalStorage(settings);

      return settings;
    } catch (error) {
      console.error("Error fetching settings from API:", error);

      // If API fails, try to get from local storage
      const localSettings = await settingsService.getSettingsFromLocalStorage();
      if (localSettings) {
        console.log("Retrieved settings from local storage");
        return localSettings;
      }

      // If both fail, throw the original error
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  updateNotificationSettings: async (settings: {
    newMatches?: boolean;
    messages?: boolean;
    likesReceived?: boolean;
    profileVisits?: boolean;
    appUpdates?: boolean;
    permissionStatus?: "granted" | "denied" | "undetermined";
  }) => {
    try {
      // Update on server
      const response = await api.put("/settings/notifications", settings);
      const updatedSettings = response.data;

      // Update in local storage
      const currentSettings =
        await settingsService.getSettingsFromLocalStorage();
      if (currentSettings) {
        const mergedSettings = {
          ...currentSettings,
          notifications: {
            ...currentSettings.notifications,
            ...settings,
          },
        };
        await settingsService.saveSettingsToLocalStorage(mergedSettings);
      }

      return updatedSettings;
    } catch (error) {
      // Try to update local storage even if API fails
      try {
        const currentSettings =
          await settingsService.getSettingsFromLocalStorage();
        if (currentSettings) {
          const mergedSettings = {
            ...currentSettings,
            notifications: {
              ...currentSettings.notifications,
              ...settings,
            },
          };
          await settingsService.saveSettingsToLocalStorage(mergedSettings);
        }
      } catch (localError) {
        console.error("Error updating local settings:", localError);
      }

      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  updatePrivacySettings: async (settings: {
    profileVisibility?: "public" | "matches-only" | "hidden";
    showDistance?: boolean;
    showLastActive?: boolean;
    blockList?: string[];
  }) => {
    try {
      // Update on server
      const response = await api.put("/settings/privacy", settings);
      const updatedSettings = response.data;

      // Update in local storage
      const currentSettings =
        await settingsService.getSettingsFromLocalStorage();
      if (currentSettings) {
        const mergedSettings = {
          ...currentSettings,
          privacy: {
            ...currentSettings.privacy,
            ...settings,
          },
        };
        await settingsService.saveSettingsToLocalStorage(mergedSettings);
      }

      return updatedSettings;
    } catch (error) {
      // Try to update local storage even if API fails
      try {
        const currentSettings =
          await settingsService.getSettingsFromLocalStorage();
        if (currentSettings) {
          const mergedSettings = {
            ...currentSettings,
            privacy: {
              ...currentSettings.privacy,
              ...settings,
            },
          };
          await settingsService.saveSettingsToLocalStorage(mergedSettings);
        }
      } catch (localError) {
        console.error("Error updating local privacy settings:", localError);
      }

      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  updateAccountSettings: async (settings: {
    email?: string;
    phoneNumber?: string;
    language?: string;
    emailNotifications?: boolean;
    darkMode?: boolean;
    deleteAccountReason?: string;
  }) => {
    try {
      // Update on server
      const response = await api.put("/settings/account", settings);
      const updatedSettings = response.data;

      // Update in local storage
      const currentSettings =
        await settingsService.getSettingsFromLocalStorage();
      if (currentSettings) {
        const mergedSettings = {
          ...currentSettings,
          account: {
            ...currentSettings.account,
            ...settings,
          },
        };
        await settingsService.saveSettingsToLocalStorage(mergedSettings);
      }

      return updatedSettings;
    } catch (error) {
      // Try to update local storage even if API fails
      try {
        const currentSettings =
          await settingsService.getSettingsFromLocalStorage();
        if (currentSettings) {
          const mergedSettings = {
            ...currentSettings,
            account: {
              ...currentSettings.account,
              ...settings,
            },
          };
          await settingsService.saveSettingsToLocalStorage(mergedSettings);
        }
      } catch (localError) {
        console.error("Error updating local account settings:", localError);
      }

      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      const response = await api.put("/settings/change-password", data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  deleteAccount: async (reason?: string) => {
    try {
      const response = await api.delete("/settings/account", {
        data: { reason },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  blockUser: async (userId: string) => {
    try {
      const response = await api.post("/settings/block-user", { userId });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  unblockUser: async (userId: string) => {
    try {
      const response = await api.delete(`/settings/block-user/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getBlockedUsers: async () => {
    try {
      const response = await api.get("/settings/blocked-users");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  reportUser: async (data: {
    userId: string;
    reason: string;
    details?: string;
  }) => {
    try {
      const response = await api.post("/settings/report-user", data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },
};

export default api;
