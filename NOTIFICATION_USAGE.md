# Global Toast Notification System

This project now includes a global toast notification system that can be used in any page or component.

## How to Use

### 1. Import the useAuth hook
```typescript
import { useAuth } from '../contexts/AuthContext';
```

### 2. Destructure the notification functions
```typescript
const { showError, showSuccess, showWarning, showInfo } = useAuth();
```

### 3. Call the appropriate notification function

#### Error Notifications (Red, 7 seconds duration)
```typescript
// Basic error
showError('Something went wrong!');

// Error with custom title
showError('Invalid email format', 'Validation Error');

// In try-catch blocks
try {
  await someApiCall();
} catch (error) {
  showError('Failed to save data. Please try again.', 'Save Failed');
}
```

#### Success Notifications (Green, 4 seconds duration)
```typescript
// Basic success
showSuccess('Data saved successfully!');

// Success with custom title
showSuccess('Welcome back to SmartTravel!', 'Login Successful');

// After successful operations
const handleSave = async () => {
  try {
    await saveData();
    showSuccess('Your changes have been saved.');
  } catch (error) {
    showError('Failed to save changes.');
  }
};
```

#### Warning Notifications (Yellow, 5 seconds duration)
```typescript
// Basic warning
showWarning('Please check your internet connection');

// Warning with custom title
showWarning('Some fields are missing', 'Form Incomplete');
```

#### Info Notifications (Blue, 4 seconds duration)
```typescript
// Basic info
showInfo('Loading data...');

// Info with custom title
showInfo('Click here to learn more about premium features', 'Tip');
```

## Examples in Practice

### Login Page Error Handling
```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
    showSuccess('Welcome back!', 'Login Successful');
  } catch (error) {
    showError('Invalid credentials. Please try again.', 'Login Failed');
  }
};
```

### Form Validation
```typescript
const handleSubmit = () => {
  if (!email || !password) {
    showWarning('Please fill in all required fields', 'Missing Information');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('Please enter a valid email address', 'Invalid Email');
    return;
  }
  
  // Proceed with form submission...
};
```

### API Data Loading
```typescript
const fetchData = async () => {
  try {
    const data = await apiService.getData();
    showInfo('Data refreshed successfully');
  } catch (error) {
    showError('Unable to load data. Please try again later.', 'Loading Error');
  }
};
```

## Additional Functions

### Remove Specific Notification
```typescript
const { removeNotification } = useAuth();
// If you have the notification ID
removeNotification(notificationId);
```

### Clear All Notifications
```typescript
const { clearAllNotifications } = useAuth();
// Remove all visible notifications
clearAllNotifications();
```

## Customization

The notification system automatically:
- Positions toasts at the top-right corner
- Auto-closes notifications after the specified duration
- Shows appropriate icons for each type
- Uses consistent styling with Bootstrap components
- Stacks multiple notifications vertically

## Current Implementation

The notification system has been added to these pages as examples:
- `LoginPage.tsx` - Login success/error notifications
- `RegisterPage.tsx` - Registration success/error and validation notifications  
- `HomePage.tsx` - Data loading error notifications
- `PlansPage.tsx` - Subscription success/error notifications

You can follow similar patterns to add notifications to any other page in the application.