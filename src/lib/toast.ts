import toast from "react-hot-toast";

// Utility functions for common toast patterns
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
    }
  ) => toast.promise(promise, messages),
  dismiss: (toastId?: string) => toast.dismiss(toastId),
};

// Waitlist specific toasts
export const waitlistToasts = {
  success: (message: string = "Welcome to the waitlist! 🎉") =>
    showToast.success(message),
  alreadyJoined: () => showToast.error("You're already on our waitlist!"),
  invalidEmail: () => showToast.error("Please enter a valid email address"),
  networkError: () => showToast.error("Connection failed. Please try again."),
  unknownError: () =>
    showToast.error("Something went wrong. Please try again."),
};
