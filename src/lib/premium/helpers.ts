// Premium feature marking helpers - Easy modular system to mark any function as premium
import { premiumChecker, PREMIUM_FEATURES, PremiumPlan } from "./index";

/**
 * Modular Premium Feature Marking System
 *
 * This system provides easy ways to mark any function, component, or feature as premium
 * with simple decorators, HOCs, and utility functions.
 */

// 1. SIMPLE FUNCTION DECORATOR
/**
 * Decorator to mark a class method as requiring a premium feature
 * @param featureId - The premium feature ID required
 * @example
 * class FormBuilder {
 *   @requiresPremiumFeature('FILE_UPLOADS')
 *   enableFileUploads() {
 *     // This method requires premium
 *   }
 * }
 */
export function requiresPremiumFeature(featureId: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // All features are now free - no restrictions
      return method.apply(this, args);
    };

    return descriptor;
  };
}

// 2. FUNCTION WRAPPER
/**
 * Wrap any function to make it premium-only
 * @param featureId - The premium feature ID required
 * @param fn - The function to wrap
 * @param fallback - Optional fallback function for non-premium users
 * @example
 * const exportToCsv = makePremium('EXPORT_RESPONSES',
 *   (data) => exportData(data),
 *   () => showUpgradePrompt()
 * );
 */
export function makePremium<T extends (...args: any[]) => any>(
  featureId: string,
  fn: T,
  fallback?: (...args: Parameters<T>) => any
): T {
  return ((...args: Parameters<T>) => {
    // All features are now free - no restrictions
    return fn(...args);
  }) as T;
}

// 3. CONDITIONAL EXECUTION
/**
 * Execute different functions based on premium status
 * @param featureId - The premium feature ID required
 * @param premiumFn - Function to execute if user has premium
 * @param freeFn - Function to execute if user doesn't have premium
 * @example
 * conditionalPremium('UNLIMITED_FORMS',
 *   () => createForm(),
 *   () => checkFormLimit()
 * );
 */
export function conditionalPremium<T>(
  featureId: string,
  premiumFn: () => T,
  freeFn: () => T
): T {
  // All features are now free - always execute the "premium" function
  return premiumFn();
}

// 4. PREMIUM CHECK WITH LIMITS
/**
 * Check if user can perform an action based on plan limits
 * @param limitType - Type of limit to check
 * @param currentUsage - Current usage count
 * @param actionFn - Function to execute if allowed
 * @param limitReachedFn - Function to execute if limit reached
 * @example
 * checkLimit('forms', currentFormCount,
 *   () => createNewForm(),
 *   () => showUpgradePrompt()
 * );
 */
export function checkLimit<T>(
  limitType:
    | "forms"
    | "submissions"
    | "fileUploadSize"
    | "storage"
    | "teamMembers",
  currentUsage: number,
  actionFn: () => T,
  limitReachedFn: () => T
): T {
  // All limits are now unlimited for free plan - always allow action
  return actionFn();
}

// 5. FEATURE AVAILABILITY CHECKER
/**
 * Check if a feature is available for the current user
 * @param featureId - The premium feature ID to check
 * @returns Object with availability info
 */
export function checkFeatureAvailability(featureId: string) {
  const feature = PREMIUM_FEATURES[featureId];
  const hasAccess = premiumChecker.hasFeature(featureId);
  const currentPlan = premiumChecker.getCurrentPlan();

  return {
    available: hasAccess,
    feature,
    currentPlan,
    requiredPlan: feature?.requiredPlan,
    needsUpgrade: !hasAccess,
    upgradeMessage: hasAccess
      ? null
      : `Upgrade to ${feature?.requiredPlan} plan to access ${feature?.name}`,
  };
}

// 6. ASYNC PREMIUM WRAPPER
/**
 * Wrap async functions with premium checks
 * @param featureId - The premium feature ID required
 * @param asyncFn - The async function to wrap
 * @param fallback - Optional fallback for non-premium users
 * @example
 * const uploadFile = makePremiumAsync('FILE_UPLOADS',
 *   async (file) => await uploadToServer(file),
 *   async () => ({ error: 'Premium required' })
 * );
 */
export function makePremiumAsync<T extends (...args: any[]) => Promise<any>>(
  featureId: string,
  asyncFn: T,
  fallback?: (...args: Parameters<T>) => Promise<any>
): T {
  return (async (...args: Parameters<T>) => {
    // All features are now free - no restrictions
    return await asyncFn(...args);
  }) as T;
}

// 7. PLAN-SPECIFIC FEATURES
/**
 * Execute different functions based on user's plan
 * @param planActions - Object with actions for each plan
 * @example
 * planSpecific({
 *   free: () => showLimitedFeatures(),
 *   basic: () => showBasicFeatures(),
 *   pro: () => showProFeatures(),
 *   enterprise: () => showEnterpriseFeatures()
 * });
 */
export function planSpecific<T>(
  planActions: Partial<Record<PremiumPlan, () => T>>
): T | undefined {
  const currentPlan = premiumChecker.getCurrentPlan();
  const action = planActions[currentPlan];
  return action ? action() : undefined;
}

// 8. USAGE-BASED PREMIUM CHECKS
/**
 * Create a usage-aware function that checks limits before execution
 * @param limitType - Type of limit to check
 * @param usageGetter - Function that returns current usage
 * @param actionFn - Function to execute if under limit
 * @param limitReachedFn - Function to execute if limit reached
 */
export function createUsageAwareFunction<T>(
  limitType:
    | "forms"
    | "submissions"
    | "fileUploadSize"
    | "storage"
    | "teamMembers",
  usageGetter: () => number | Promise<number>,
  actionFn: () => T | Promise<T>,
  limitReachedFn: () => T | Promise<T>
) {
  return async (): Promise<T> => {
    // All limits are now unlimited - always allow action
    return await actionFn();
  };
}

// 9. FEATURE GATE HELPER
/**
 * Simple boolean check for component rendering
 * @param featureId - The premium feature ID to check
 * @returns true if user can access the feature
 */
export const canAccess = (featureId: string): boolean => {
  // All features are now free - always return true
  return true;
};

// 10. PREMIUM REQUIREMENT INFO
/**
 * Get detailed info about what's required for a feature
 * @param featureId - The premium feature ID to check
 * @returns Detailed requirement information
 */
export function getFeatureRequirements(featureId: string) {
  const feature = PREMIUM_FEATURES[featureId];
  if (!feature) return null;

  const currentPlan = premiumChecker.getCurrentPlan();
  const hasAccess = premiumChecker.hasFeature(featureId);

  return {
    featureId,
    featureName: feature.name,
    description: feature.description,
    category: feature.category,
    requiredPlan: feature.requiredPlan,
    currentPlan,
    hasAccess,
    isUpgradeNeeded: !hasAccess,
    upgradeFrom: currentPlan,
    upgradeTo: feature.requiredPlan,
  };
}

// EXAMPLE USAGE PATTERNS:

// 1. Simple component feature gate:
// const showAdvancedAnalytics = canAccess('ADVANCED_ANALYTICS');

// 2. Function decoration:
// @requiresPremiumFeature('FILE_UPLOADS')
// uploadFile(file: File) { ... }

// 3. Conditional execution:
// conditionalPremium('UNLIMITED_FORMS',
//   () => createForm(),
//   () => checkFormLimit()
// );

// 4. Usage-based limits:
// checkLimit('forms', currentFormCount,
//   () => createForm(),
//   () => showUpgradePrompt()
// );

// 5. Async premium wrapper:
// const exportData = makePremiumAsync('EXPORT_RESPONSES',
//   async (data) => await exportToCsv(data)
// );
