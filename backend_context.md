# Dating App Backend Integration Guide

This document provides comprehensive information for integrating the dating app backend with your frontend application.

## Base URL

For local development:

```
http://localhost:3000/api
```

## Authentication

The API uses JWT (JSON Web Token) for authentication.

### Authentication Endpoints

#### Register a New User

- **Endpoint**: `POST /auth/register`
- **Description**: Register a new user account
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "John"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### Login

- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate a user and get tokens
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John"
      // other user properties
    }
  }
  ```

#### Get Current User

- **Endpoint**: `GET /auth/me`
- **Description**: Get the current authenticated user's information
- **Authentication**: Required (Bearer token)
- **Response**: User object

### Using Authentication in Requests

For authenticated endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## User Profile

### Profile Endpoints

#### Get Complete Profile

- **Endpoint**: `GET /profile`
- **Description**: Get the current user's complete profile
- **Authentication**: Required
- **Response**: Complete profile object with all sections

#### Update Main Profile

- **Endpoint**: `PUT /profile`
- **Description**: Update user's main profile
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "displayName": "JohnDoe",
    "bio": "About me...",
    "isHidden": false
  }
  ```

#### Update Basic Information

- **Endpoint**: `PUT /profile/basic`
- **Description**: Update user's basic information
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "gender": "MALE",
    "birthDate": "1990-01-01",
    "location": {
      "city": "New York",
      "state": "NY",
      "country": "USA"
    },
    "height": 175,
    "maritalStatus": "SINGLE",
    "children": "NO_CHILDREN"
  }
  ```

#### Update Caste & Community Information

- **Endpoint**: `PUT /profile/caste`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "religion": "HINDU",
    "caste": "BRAHMIN",
    "subCaste": "Deshastha",
    "motherTongue": "MARATHI",
    "community": "MAHARASHTRIAN"
  }
  ```

#### Update Occupation & Education

- **Endpoint**: `PUT /profile/occupation`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "education": "GRADUATE",
    "highestDegree": "Masters in Computer Science",
    "occupation": "SOFTWARE_ENGINEER",
    "employedIn": "PRIVATE_SECTOR",
    "companyName": "Tech Company",
    "jobTitle": "Senior Developer",
    "annualIncome": "ABOVE_20L"
  }
  ```

#### Update Lifestyle Information

- **Endpoint**: `PUT /profile/lifestyle`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "diet": "VEGETARIAN",
    "smoking": "NON_SMOKER",
    "drinking": "NON_DRINKER",
    "livingArrangement": "LIVING_WITH_FAMILY",
    "hasDisability": false,
    "disabilityDetails": ""
  }
  ```

#### Update Personality & Interests

- **Endpoint**: `PUT /profile/personality`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "hobbies": ["Reading", "Hiking", "Photography"],
    "interests": ["Technology", "Travel", "Music"],
    "personalityTraits": ["Introverted", "Analytical", "Creative"],
    "musicTaste": ["Rock", "Classical"],
    "movieTaste": ["Sci-Fi", "Drama"],
    "sportsInterest": ["Cricket", "Tennis"],
    "travelStyle": "ADVENTURE_SEEKER"
  }
  ```

#### Update Relationship Preferences

- **Endpoint**: `PUT /profile/preferences`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "lookingFor": ["MARRIAGE"],
    "ageRangeMin": 25,
    "ageRangeMax": 35,
    "heightRangeMin": 150,
    "heightRangeMax": 180,
    "distanceRange": 50,
    "preferredReligion": ["HINDU", "JAIN"],
    "preferredCaste": ["BRAHMIN", "MARATHA"],
    "educationPreference": ["GRADUATE", "POST_GRADUATE"],
    "occupationPreference": ["SOFTWARE_ENGINEER", "DOCTOR"],
    "incomePreference": "ABOVE_10L"
  }
  ```

#### Update Values & Future Plans

- **Endpoint**: `PUT /profile/values`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "familyValues": "TRADITIONAL",
    "religiousBeliefs": "SPIRITUAL",
    "politicalViews": "MODERATE",
    "wantsChildren": "WANTS_CHILDREN",
    "futureGoals": ["Career Growth", "Family", "Travel"],
    "marriagePlans": "WITHIN_1_YEAR",
    "relocateWilling": true
  }
  ```

#### Get Profile Completion

- **Endpoint**: `GET /profile/completion`
- **Description**: Get profile completion score and status
- **Authentication**: Required
- **Response**:
  ```json
  {
    "completionScore": 85.5,
    "sections": {
      "profile": true,
      "basicInfo": true,
      "casteInfo": true,
      "occupationInfo": true,
      "lifestyleInfo": false,
      "personalityInfo": true,
      "relationshipPrefs": false,
      "valuesPlan": true
    }
  }
  ```

## Matching System

### Match Endpoints

#### Get Potential Matches

- **Endpoint**: `GET /matches/potential`
- **Description**: Get potential matches for the user
- **Authentication**: Required
- **Query Parameters**:
  - `limit` (default: 20): Number of matches to return
  - `page` (default: 1): Page number for pagination
- **Response**: List of potential matches with pagination

#### Get Confirmed Matches

- **Endpoint**: `GET /matches/confirmed`
- **Description**: Get confirmed matches for the user
- **Authentication**: Required
- **Query Parameters**: Same as potential matches
- **Response**: List of confirmed matches with pagination

#### Get Match Summary

- **Endpoint**: `GET /matches/summary`
- **Description**: Get match statistics and summary
- **Authentication**: Required
- **Response**:
  ```json
  {
    "totalMatches": 45,
    "pendingMatches": 10,
    "acceptedMatches": 20,
    "rejectedMatches": 15,
    "newMatches": 5
  }
  ```

#### Get Match Details

- **Endpoint**: `GET /matches/:matchId`
- **Description**: Get details of a specific match
- **Authentication**: Required
- **Response**: Detailed match information

#### Express Interest

- **Endpoint**: `POST /matches/interest/:userId`
- **Description**: Express interest in another user
- **Authentication**: Required
- **Response**: Match object with status

#### Accept or Reject Match

- **Endpoint**: `POST /matches/decision/:matchId`
- **Description**: Accept or reject a match
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "decision": "ACCEPTED" // or "REJECTED"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Match accepted successfully",
    "match": {
      // match object
    },
    "chatRoomId": "chat-room-id" // Only if match was accepted
  }
  ```

## Chat System

### Chat Endpoints

#### Get Chat List

- **Endpoint**: `GET /chats`
- **Description**: Get list of user's chats
- **Authentication**: Required
- **Query Parameters**:
  - `limit` (default: 20): Number of chats to return
  - `page` (default: 1): Page number for pagination
- **Response**: List of chat rooms with last message and unread count

#### Get Chat Details

- **Endpoint**: `GET /chats/:chatId`
- **Description**: Get details of a specific chat
- **Authentication**: Required
- **Response**: Chat room details

#### Get Chat History

- **Endpoint**: `GET /chats/:chatId/messages`
- **Description**: Get message history for a chat
- **Authentication**: Required
- **Query Parameters**:
  - `limit` (default: 20): Number of messages to return
  - `before`: Get messages before this message ID (for pagination)
- **Response**: List of messages with pagination info

#### Send Message

- **Endpoint**: `POST /chats/:chatId/messages`
- **Description**: Send a message to a chat
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "content": "Hello, how are you?",
    "messageType": "TEXT" // Optional, defaults to TEXT
  }
  ```
- **Response**: Created message object

#### Mark Messages as Read

- **Endpoint**: `POST /chats/:chatId/read`
- **Description**: Mark messages in a chat as read
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "messageIds": ["message-id-1", "message-id-2"] // Optional, will mark all as read if not provided
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "markedCount": 5
  }
  ```

## Real-time Communication

The backend uses Socket.IO for real-time communication. Connect to the socket server after authentication.

### Socket Connection

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "your-access-token",
  },
});

// Listen for connection
socket.on("connect", () => {
  console.log("Connected to socket server");
});

// Listen for new messages
socket.on("new_message", (message) => {
  console.log("New message received:", message);
});

// Listen for match updates
socket.on("match_update", (match) => {
  console.log("Match update:", match);
});

// Listen for new matches
socket.on("new_match", (match) => {
  console.log("New match:", match);
});
```

## Error Handling

The API returns standard HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses follow this format:

```json
{
  "error": "Error message description"
}
```

## Data Models

### User

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}
```

### Profile

```typescript
interface Profile {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Match

```typescript
interface Match {
  id: string;
  userId: string;
  targetUserId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  initiatedBy: string;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
  targetUser: {
    // User profile information
  };
}
```

### Chat

```typescript
interface ChatRoom {
  id: string;
  participants: string[]; // User IDs
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  lastMessage?: Message;
  unreadCount: number;
  participant: {
    // Other user's profile information
  };
}
```

### Message

```typescript
interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  messageType: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION" | "AUDIO";
  readBy: string[]; // User IDs
  createdAt: string;
  updatedAt: string;
}
```

## Implementation Tips

1. **Authentication Flow**:

   - Store tokens securely (e.g., in HttpOnly cookies or secure storage)
   - Implement token refresh mechanism
   - Add interceptors to automatically include the token in requests

2. **Profile Management**:

   - Implement a step-by-step profile completion wizard
   - Cache profile data locally for better performance
   - Show profile completion percentage to encourage users to complete their profiles

3. **Matching System**:

   - Implement swipe interface for potential matches
   - Add animations for match actions (like, pass)
   - Show match notifications

4. **Chat System**:

   - Implement real-time updates using Socket.IO
   - Add typing indicators
   - Implement message status (sent, delivered, read)
   - Support media messages

5. **Error Handling**:
   - Implement global error handling
   - Show user-friendly error messages
   - Add retry mechanisms for failed requests

## Development Environment Setup

1. Set up environment variables in your frontend:

```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SOCKET_URL=http://localhost:3000
```

2. Install required dependencies:

```bash
npm install axios socket.io-client jwt-decode
```

3. Create an API service to handle all requests:

```javascript
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add request interceptor to include auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle token expiration, etc.
    return Promise.reject(error);
  }
);

export default API;
```
