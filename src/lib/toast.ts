import toast from "react-hot-toast";

// Common toast utility functions
export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
  ) => toast.promise(promise, messages),
  dismiss: (toastId?: string) => toast.dismiss(toastId),
};

// Predefined waitlist-related toasts
export const waitlistToasts = {
  success: (message: string = "Welcome to the waitlist! 🎉") =>
    showToast.success(message),
  alreadyJoined: () => showToast.error("You're already on our waitlist!"),
  invalidEmail: () => showToast.error("Please enter a valid email address"),
  networkError: () => showToast.error("Connection failed. Please try again."),
  unknownError: () =>
    showToast.error("Something went wrong. Please try again."),
};

// Authentication-specific error toasts
export const authToasts = {
  // Error messages
  signInError: (provider?: string) => {
    const message = provider
      ? `Failed to sign in with ${provider}. Please try again.`
      : "Sign in failed. Please try again.";
    return showToast.error(message);
  },
  signOutError: () =>
    showToast.error(
      "Failed to sign out properly. You may need to refresh the page.",
    ),
  invalidCredentials: () =>
    showToast.error(
      "Invalid email or password. Please check your credentials.",
    ),
  userNotFound: () =>
    showToast.error("User not found. Please check your email or sign up."),
  emailNotVerified: () =>
    showToast.error("Please verify your email before signing in."),
  accountDisabled: () =>
    showToast.error("Your account has been disabled. Please contact support."),
  tooManyAttempts: () =>
    showToast.error(
      "Too many sign-in attempts. Please wait before trying again.",
    ),
  sessionExpired: () =>
    showToast.error("Your session has expired. Please sign in again."),
  tokenExpired: () =>
    showToast.error(
      "Your authentication token has expired. Please sign in again.",
    ),
  weakPassword: () =>
    showToast.error("Password is too weak. Please use a stronger password."),
  passwordMismatch: () =>
    showToast.error("Passwords do not match. Please try again."),
  emailInUse: () =>
    showToast.error(
      "This email is already in use. Please use a different email.",
    ),
  providerError: (provider: string) =>
    showToast.error(`${provider} authentication failed. Please try again.`),

  // Success messages
  signInSuccess: (provider?: string) => {
    const message = provider
      ? `Successfully signed in with ${provider}!`
      : "Successfully signed in!";
    return showToast.success(message);
  },
  signOutSuccess: () => showToast.success("Successfully signed out!"),
  passwordResetSent: () =>
    showToast.success("Password reset email sent! Check your inbox."),
  emailVerificationSent: () =>
    showToast.success("Verification email sent! Check your inbox."),

  // Loading states
  signingIn: (provider?: string) => {
    const message = provider
      ? `Signing in with ${provider}...`
      : "Signing in...";
    return showToast.loading(message);
  },
  signingOut: () => showToast.loading("Signing out..."),

  // Promise-based auth operations
  signInPromise: (promise: Promise<any>, provider?: string) => {
    const providerText = provider ? ` with ${provider}` : "";
    return showToast.promise(promise, {
      loading: `Signing in${providerText}...`,
      success: `Successfully signed in${providerText}!`,
      error: (error: any) => {
        if (error?.message) {
          return `Sign in failed: ${error.message}`;
        }
        return `Failed to sign in${providerText}. Please try again.`;
      },
    });
  },
  signOutPromise: (promise: Promise<any>) => {
    return showToast.promise(promise, {
      loading: "Signing out...",
      success: "Successfully signed out!",
      error: "Failed to sign out properly. You may need to refresh the page.",
    });
  },
};

// Form validation error toasts
export const validationToasts = {
  required: (field: string) =>
    showToast.error(`${field} is required. Please fill in this field.`),
  invalidEmail: () => showToast.error("Please enter a valid email address."),
  invalidUrl: () => showToast.error("Please enter a valid URL."),
  invalidPhone: () => showToast.error("Please enter a valid phone number."),
  minLength: (field: string, length: number) =>
    showToast.error(`${field} must be at least ${length} characters long.`),
  maxLength: (field: string, length: number) =>
    showToast.error(`${field} must be no more than ${length} characters long.`),
  pattern: (field: string) =>
    showToast.error(`${field} format is invalid. Please check your input.`),
  numeric: (field: string) =>
    showToast.error(`${field} must be a valid number.`),
  positiveNumber: (field: string) =>
    showToast.error(`${field} must be a positive number.`),
  futureDate: (field: string) =>
    showToast.error(`${field} must be a future date.`),
  pastDate: (field: string) => showToast.error(`${field} must be a past date.`),
  fileSize: (maxSize: string) =>
    showToast.error(`File size must be less than ${maxSize}.`),
  fileType: (allowedTypes: string) =>
    showToast.error(`File type must be one of: ${allowedTypes}.`),
};

// Network and API error toasts
export const networkToasts = {
  connectionError: () =>
    showToast.error(
      "No internet connection. Please check your network and try again.",
    ),
  timeoutError: () => showToast.error("Request timed out. Please try again."),
  serverError: () =>
    showToast.error("Server error occurred. Please try again later."),
  notFound: (resource?: string) =>
    showToast.error(`${resource || "Resource"} not found.`),
  forbidden: () =>
    showToast.error("You don't have permission to access this resource."),
  unauthorized: () =>
    showToast.error("Unauthorized access. Please log in and try again."),
  badRequest: () =>
    showToast.error("Invalid request. Please check your input and try again."),
  conflict: (resource?: string) =>
    showToast.error(`${resource || "Resource"} already exists.`),
  rateLimited: () =>
    showToast.error("Too many requests. Please wait a moment and try again."),
  maintenanceMode: () =>
    showToast.error("Service is under maintenance. Please try again later."),
  apiError: (endpoint?: string) =>
    showToast.error(
      `API error${endpoint ? ` at ${endpoint}` : ""}. Please try again.`,
    ),
  corsError: () =>
    showToast.error("Cross-origin request blocked. Please contact support."),
};

// Database operation error toasts
export const databaseToasts = {
  connectionFailed: () =>
    showToast.error("Database connection failed. Please try again later."),
  queryFailed: () =>
    showToast.error("Database query failed. Please try again."),
  insertFailed: (item?: string) =>
    showToast.error(`Failed to create ${item || "record"}. Please try again.`),
  updateFailed: (item?: string) =>
    showToast.error(`Failed to update ${item || "record"}. Please try again.`),
  deleteFailed: (item?: string) =>
    showToast.error(`Failed to delete ${item || "record"}. Please try again.`),
  duplicateEntry: (field?: string) =>
    showToast.error(
      `${field || "Entry"} already exists. Please use a different value.`,
    ),
  constraintViolation: () =>
    showToast.error(
      "Operation violates data constraints. Please check your input.",
    ),
  transactionFailed: () =>
    showToast.error("Transaction failed. Changes have been rolled back."),
};

// File operation error toasts
export const fileToasts = {
  uploadFailed: () => showToast.error("File upload failed. Please try again."),
  downloadFailed: () =>
    showToast.error("File download failed. Please try again."),
  deleteFailed: () =>
    showToast.error("File deletion failed. Please try again."),
  invalidFormat: (allowedFormats: string) =>
    showToast.error(`Invalid file format. Allowed formats: ${allowedFormats}.`),
  fileTooLarge: (maxSize: string) =>
    showToast.error(`File is too large. Maximum size: ${maxSize}.`),
  fileEmpty: () =>
    showToast.error("File is empty. Please select a valid file."),
  processingFailed: () =>
    showToast.error("File processing failed. Please try again."),
  virusScanFailed: () =>
    showToast.error("File failed security scan. Please try a different file."),
  storageQuotaExceeded: () =>
    showToast.error(
      "Storage quota exceeded. Please free up space and try again.",
    ),
};

// Payment and billing error toasts
export const paymentToasts = {
  paymentFailed: () =>
    showToast.error(
      "Payment failed. Please check your payment method and try again.",
    ),
  cardDeclined: () =>
    showToast.error("Card declined. Please use a different payment method."),
  insufficientFunds: () =>
    showToast.error("Insufficient funds. Please check your account balance."),
  expiredCard: () =>
    showToast.error("Card has expired. Please update your payment method."),
  invalidCard: () =>
    showToast.error("Invalid card details. Please check and try again."),
  subscriptionFailed: () =>
    showToast.error("Subscription activation failed. Please try again."),
  refundFailed: () =>
    showToast.error("Refund processing failed. Please contact support."),
  billingAddressRequired: () =>
    showToast.error("Billing address is required for this payment method."),
};

// General application error toasts
export const appToasts = {
  unexpectedError: () =>
    showToast.error("An unexpected error occurred. Please try again."),
  featureNotAvailable: () =>
    showToast.error("This feature is not available yet. Coming soon!"),
  maintenanceMode: () =>
    showToast.error(
      "Application is under maintenance. Please try again later.",
    ),
  versionMismatch: () =>
    showToast.error("App version mismatch. Please refresh the page."),
  browserNotSupported: () =>
    showToast.error(
      "Your browser is not supported. Please use a modern browser.",
    ),
  javascriptDisabled: () =>
    showToast.error(
      "JavaScript is disabled. Please enable it to use this application.",
    ),
  cookiesDisabled: () =>
    showToast.error(
      "Cookies are disabled. Please enable them to use this application.",
    ),
  storageQuotaExceeded: () =>
    showToast.error(
      "Browser storage quota exceeded. Please clear your browser data.",
    ),
  geolocationDenied: () =>
    showToast.error("Location access denied. Please enable location services."),
  cameraAccessDenied: () =>
    showToast.error("Camera access denied. Please allow camera permissions."),
  microphoneAccessDenied: () =>
    showToast.error(
      "Microphone access denied. Please allow microphone permissions.",
    ),
  clipboardAccessDenied: () =>
    showToast.error(
      "Clipboard access denied. Please allow clipboard permissions.",
    ),
};

// Business logic error toasts
export const businessToasts = {
  invalidOperation: (operation?: string) =>
    showToast.error(`${operation || "Operation"} is not allowed at this time.`),
  quotaExceeded: (resource?: string) =>
    showToast.error(
      `${resource || "Resource"} quota exceeded. Please upgrade your plan.`,
    ),
  limitReached: (limit?: string) =>
    showToast.error(
      `${limit || "Limit"} reached. Please remove items or upgrade.`,
    ),
  duplicateAction: () =>
    showToast.error("This action has already been performed."),
  prerequisiteNotMet: (prerequisite?: string) =>
    showToast.error(
      `${prerequisite || "Required condition"} not met. Please complete first.`,
    ),
  conflictingState: () =>
    showToast.error(
      "Resource is in a conflicting state. Please refresh and try again.",
    ),
  operationNotAllowed: () =>
    showToast.error("This operation is not allowed for your account type."),
  temporarilyUnavailable: (feature?: string) =>
    showToast.error(
      `${feature || "Feature"} is temporarily unavailable. Please try again later.`,
    ),
};

// Success message toasts for various operations
export const successToasts = {
  saved: (item?: string) =>
    showToast.success(`${item || "Changes"} saved successfully!`),
  created: (item?: string) =>
    showToast.success(`${item || "Item"} created successfully!`),
  updated: (item?: string) =>
    showToast.success(`${item || "Item"} updated successfully!`),
  deleted: (item?: string) =>
    showToast.success(`${item || "Item"} deleted successfully!`),
  uploaded: (item?: string) =>
    showToast.success(`${item || "File"} uploaded successfully!`),
  shared: (item?: string) =>
    showToast.success(`${item || "Item"} shared successfully!`),
  copied: (item?: string) =>
    showToast.success(`${item || "Content"} copied to clipboard!`),
  sent: (item?: string) =>
    showToast.success(`${item || "Message"} sent successfully!`),
  completed: (action?: string) =>
    showToast.success(`${action || "Action"} completed successfully!`),
  welcome: (name?: string) =>
    showToast.success(`Welcome${name ? `, ${name}` : ""}!`),
};
