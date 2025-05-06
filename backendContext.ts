// backendContext.ts

/**
 * This file outlines the expected API endpoints and data structures for the backend
 * to support the dating app frontend. It serves as a reference for backend developers.
 */

// ---------- Authentication ----------
/**
 * @route POST /auth/register
 * @description Registers a new user.
 * @body {email, password, name}
 * @returns {userId, token}
 */
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface RegisterResponse {
  userId: string;
  token: string;
}

/**
 * @route POST /auth/login
 * @description Logs in an existing user.
 * @body {email, password}
 * @returns {userId, token}
 */
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  userId: string;
  token: string;
}

// ---------- User Data ----------
/**
 * @route GET /users/:userId
 * @description Gets a user's profile data.
 * @returns {User}
 */
interface User {
  userId: string;
  name: string;
  email: string;
  profilePicture?: string;
  age?: number;
  gender?: string;
  occupation?: string;
  // ... other profile fields
}

/**
 * @route PUT /users/:userId
 * @description Updates a user's profile data.
 * @body {User}
 * @returns {User}
 */

// ---------- Matches ----------
/**
 * @route GET /matches/:userId
 * @description Gets a list of matches for a user.
 * @returns {Match[]}
 */
interface Match {
  userId: string;
  name: string;
  profilePicture?: string;
  // ... other match info
}

// ---------- Chat ----------
/**
 * @route GET /chat/:chatId
 * @description Gets a specific chat thread.
 * @returns {Message[]}
 */
interface Message {
  messageId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

/**
 * @route POST /chat/:chatId/messages
 * @description Sends a new message in a chat thread.
 * @body {text}
 * @returns {Message}
 */
interface SendMessageRequest {
  text: string;
}

// ---------- Onboarding ----------
/**
 * @route PUT /onboarding/:userId
 * @description Updates user onboarding data.
 * @body {onboardingData}
 * @returns {User}
 */
interface OnboardingData {
  question1: string;
  question2: string;
  // ... other onboarding questions
}

// ---------- Additional Endpoints ----------
/**
 * @route GET /users
 * @description Gets a list of all users. (Potentially for admin use)
 * @returns {User[]}
 */

/**
 * @route POST /images
 * @description Uploads an image and returns the URL.
 * @body {image: File}
 * @returns {imageUrl: string}
 */

export {};
