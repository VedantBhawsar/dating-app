import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://60d6-223-185-38-78.ngrok-free.app/api";
console.log("API URL configured as:", API_URL);

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    // Don't set Authorization here as AsyncStorage.getItem returns a Promise
    // Authorization will be set in the request interceptor
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

export default api;
