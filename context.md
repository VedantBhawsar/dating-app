# Frontend Context

This dating app frontend provides the following functionalities:

-   **Authentication:**
    -   Login
    -   Registration
-   **Onboarding:**
    -   Basic Information (5 questions)
    -   Caste & Community (5 questions)
    -   Salary & Occupation (5 questions)
    -   Lifestyle & Habits (5 questions)
    -   Personality & Interest (5 questions)
    -   Relationship Preferences (5 questions)
    -   Values & Future Plans (7 questions)
-   **Tabs:**
    -   Home (index)
    -   Matches
    -   Chat
    -   Profile
-   **Modals:**
    -   Chat (individual chat screen)
-   **Chat Functionality:**
    -   Chat list
    -   Individual chat screen
    -   Search bar
    -   Recent contacts

## Backend Implementation Requirements

To fully run this project, the following backend functionalities need to be implemented:

-   **User Authentication:**
    -   Implement user registration and login endpoints.
    -   Securely store user credentials.
    -   Implement session management or JWT-based authentication.
-   **User Profile Management:**
    -   Create endpoints to store and retrieve user profile data collected during onboarding.
    -   Implement data validation and sanitization.
-   **Matching Algorithm:**
    -   Develop an algorithm to match users based on their profile data and preferences.
    -   Create an endpoint to retrieve a list of potential matches for a user.
-   **Chat Functionality:**
    -   Implement real-time chat functionality using WebSockets or a similar technology.
    -   Create endpoints to send and receive messages.
    -   Store chat history in a database.
-   **Data Storage:**
    -   Set up a database to store user profiles, matches, and chat messages.
    -   Choose an appropriate database technology (e.g., PostgreSQL, MongoDB).
-   **API Endpoints:**
    -   Implement all necessary API endpoints for the frontend to communicate with the backend.
    -   Follow RESTful API design principles.
-   **Image Storage:**
    -   Implement image upload functionality for user profiles.
    -   Store images in a cloud storage service (e.g., AWS S3, Google Cloud Storage).
