# Onboarding Flow Integration

This document explains how the onboarding flow has been integrated with the backend API.

## Overview

The onboarding flow is designed to collect user information in a step-by-step process and save it to the backend. The flow is organized into several sections:

1. Basic Information
2. Caste & Community
3. Occupation & Education
4. Lifestyle & Habits
5. Personality & Interests
6. Relationship Preferences
7. Values & Future Plans
8. Verification

## Architecture

The onboarding flow uses a context-based architecture to manage state and API calls:

- **OnboardingContext.tsx**: Provides a central state management system for all onboarding data and API calls
- **OnboardingLayout.tsx**: Provides a consistent layout for all onboarding screens with progress tracking
- **index.tsx**: Serves as the coordinator for the entire onboarding process, showing completion status

## Backend Integration

Each section of the onboarding flow connects to specific backend endpoints:

- Basic Information: `PUT /profile/basic`
- Caste & Community: `PUT /profile/caste`
- Occupation & Education: `PUT /profile/occupation`
- Lifestyle & Habits: `PUT /profile/lifestyle`
- Personality & Interests: `PUT /profile/personality`
- Relationship Preferences: `PUT /profile/preferences`
- Values & Future Plans: `PUT /profile/values`

## How to Use

### 1. Import the OnboardingContext

In each onboarding screen, import the OnboardingContext:

```tsx
import { useOnboarding } from '../OnboardingContext';
```

### 2. Use the OnboardingLayout

Wrap your screen content with the OnboardingLayout component:

```tsx
<OnboardingLayout
  title="Section Title"
  currentStep={1}
  totalSteps={5}
  onNext={handleNext}
  nextDisabled={!isValid}
>
  {/* Your content here */}
</OnboardingLayout>
```

### 3. Access and Update Data

Use the context hooks to access and update data:

```tsx
const { basicInfo, updateBasicInfo, isLoading } = useOnboarding();

// Update data
const handleNext = async () => {
  await updateBasicInfo({ 
    firstName: 'John',
    lastName: 'Doe'
  });
  
  // Navigate to next screen
  router.push('/onboarding/basic/Question2');
};
```

### 4. Check Completion Status

The main onboarding index page shows the completion status of each section and allows users to continue where they left off.

## Flow Coordination

The onboarding flow is coordinated by the `index.tsx` file, which:

1. Fetches the user's profile completion status
2. Displays the completion percentage
3. Shows which sections are complete/incomplete
4. Allows users to navigate to specific sections
5. Provides a "Continue Where You Left Off" button

## Authentication

The onboarding flow requires authentication. If a user is not authenticated, they will be redirected to the login screen.

## Error Handling

Error handling is built into the OnboardingContext, with loading states and error messages available to all screens.

## Example Implementation

See the following files for examples:

- `/onboarding/basic/Question1.tsx`: Basic information question
- `/onboarding/caste&community/Question6.tsx`: Caste information question
- `/onboarding/caste&community/Question7.tsx`: Caste preference question
