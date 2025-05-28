# Toast Notification System

This project uses `react-hot-toast` for beautiful, accessible toast notifications.

## Setup

The `Toaster` component is configured in `src/app/layout.tsx` with:

- Position: bottom-right
- Dark theme with custom colors
- Success toasts: 3 seconds duration with green accent
- Error toasts: 4 seconds duration with red accent

## Usage

### Basic Usage

```tsx
import { showToast } from "@/lib/toast";

// Success toast
showToast.success("Operation completed!");

// Error toast
showToast.error("Something went wrong");

// Loading toast
const loadingToast = showToast.loading("Processing...");
// Dismiss when done
showToast.dismiss(loadingToast);
```

### Waitlist Specific Toasts

```tsx
import { waitlistToasts } from "@/lib/toast";

waitlistToasts.success(); // Custom success message
waitlistToasts.alreadyJoined(); // Already in waitlist
waitlistToasts.invalidEmail(); // Invalid email format
waitlistToasts.networkError(); // Connection issues
waitlistToasts.unknownError(); // Generic error
```

### Promise-based Toasts

```tsx
showToast.promise(fetchData(), {
  loading: "Saving...",
  success: "Data saved successfully!",
  error: "Failed to save data",
});
```

## Features

- ✅ Consistent styling across the app
- ✅ Contextual waitlist messages
- ✅ Auto-dismiss timers
- ✅ Accessible and keyboard navigable
- ✅ Smooth animations
- ✅ TypeScript support
