// Premium Feature System - Modular and Secure Premium Feature Management
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export type PremiumPlan = "free" | "pro";

export interface PremiumStatus {
  isPremium: boolean;
  premiumPlan: PremiumPlan;
  expiresAt: string | null;
  subscriptionStatus: string;
  daysRemaining: number | null;
  isTrial: boolean;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  requiredPlan: PremiumPlan;
  category: string;
  status: "available" | "coming_soon" | "beta";
  comingSoonMessage?: string;
  limit?: number; // For features with usage limits
}

// Plan Limits Configuration - Updated to be more generous for free plan
export const PLAN_LIMITS = {
  free: {
    forms: -1, // Unlimited forms
    submissions: -1, // Unlimited submissions
    fileUploadSize: 100 * 1024 * 1024, // 100MB file uploads
    storage: 10 * 1024 * 1024 * 1024, // 10GB storage
    analytics: true, // Advanced analytics available
    customBranding: true, // Custom branding available
    conditionalLogic: true, // Conditional logic available
    teamMembers: -1, // Unlimited team members
    webhookIntegrations: true, // Webhook integrations available
    advancedSecurity: true, // Advanced security available
  },
  pro: {
    forms: -1, // Unlimited
    submissions: -1, // Unlimited
    fileUploadSize: 500 * 1024 * 1024, // 500MB (increased from 100MB)
    storage: 50 * 1024 * 1024 * 1024, // 50GB (increased from 10GB)
    analytics: true,
    customBranding: true,
    conditionalLogic: true,
    teamMembers: -1, // Unlimited
    webhookIntegrations: true,
    advancedSecurity: true,
  },
};

// Define features - all now available for free with simplified plan structure
export const PREMIUM_FEATURES: Record<string, PremiumFeature> = {
  UNLIMITED_FORMS: {
    id: "unlimited_forms",
    name: "Unlimited Forms",
    description: "Create unlimited forms",
    requiredPlan: "free",
    category: "forms",
    status: "available",
  },
  ADVANCED_ANALYTICS: {
    id: "advanced_analytics",
    name: "Advanced Analytics",
    description: "Access detailed analytics and insights",
    requiredPlan: "free",
    category: "analytics",
    status: "available",
  },

  FILE_UPLOADS: {
    id: "file_uploads",
    name: "File Uploads",
    description: "Allow file uploads in forms",
    requiredPlan: "free",
    category: "forms",
    status: "available",
  },
  CONDITIONAL_LOGIC: {
    id: "conditional_logic",
    name: "Conditional Logic",
    description: "Show/hide fields based on responses",
    requiredPlan: "free",
    category: "forms",
    status: "available",
  },

  PRIORITY_SUPPORT: {
    id: "priority_support",
    name: "Priority Support",
    description: "Get priority customer support",
    requiredPlan: "pro",
    category: "support",
    status: "available",
  },
  WEBHOOK_INTEGRATIONS: {
    id: "webhook_integrations",
    name: "Webhook Integrations",
    description: "Send form data to external services",
    requiredPlan: "free",
    category: "integrations",
    status: "available",
  },
  ADVANCED_SECURITY: {
    id: "advanced_security",
    name: "Advanced Security",
    description: "CAPTCHA, IP limiting, and time restrictions",
    requiredPlan: "free",
    category: "security",
    status: "available",
  },
  FORM_TEMPLATES: {
    id: "form_templates",
    name: "Premium Templates",
    description: "Access to premium form templates",
    requiredPlan: "free",
    category: "templates",
    status: "available",
  },
};

// Utility functions to check plan capabilities
export const canUserAccessFeature = (
  userPlan: PremiumPlan,
  requiredPlan: PremiumPlan,
): boolean => {
  const planHierarchy: Record<PremiumPlan, number> = {
    free: 0,
    pro: 1,
  };

  return planHierarchy[userPlan] >= planHierarchy[requiredPlan];
};

export const getPlanLimits = (plan: PremiumPlan) => {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
};

// Client-side premium status checker
export class PremiumChecker {
  private static instance: PremiumChecker;
  private premiumStatus: PremiumStatus | null = null;
  private user: User | null = null;

  private constructor() {}

  static getInstance(): PremiumChecker {
    if (!PremiumChecker.instance) {
      PremiumChecker.instance = new PremiumChecker();
    }
    return PremiumChecker.instance;
  }

  async initialize(user: User | null): Promise<void> {
    this.user = user;
    if (user) {
      await this.loadPremiumStatus();
    }
  }

  private async loadPremiumStatus(): Promise<void> {
    if (!this.user) return;

    const supabase = createClient();
    try {
      const { data, error } = await supabase.rpc("get_user_premium_status", {
        user_id: this.user.id,
      });

      if (error) {
        console.error("Error fetching premium status:", error);
        this.premiumStatus = {
          isPremium: false,
          premiumPlan: "free",
          expiresAt: null,
          subscriptionStatus: "inactive",
          daysRemaining: null,
          isTrial: false,
        };
        return;
      }

      this.premiumStatus = {
        isPremium: data[0]?.is_premium || false,
        premiumPlan: data[0]?.premium_plan || "free",
        expiresAt: data[0]?.expires_at || null,
        subscriptionStatus: data[0]?.subscription_status || "inactive",
        daysRemaining: data[0]?.days_remaining || null,
        isTrial: data[0]?.is_trial || false,
      };
    } catch (error) {
      console.error("Error loading premium status:", error);
      this.premiumStatus = {
        isPremium: false,
        premiumPlan: "free",
        expiresAt: null,
        subscriptionStatus: "inactive",
        daysRemaining: null,
        isTrial: false,
      };
    }
  }

  async refreshPremiumStatus(): Promise<void> {
    await this.loadPremiumStatus();
  }

  getPremiumStatus(): PremiumStatus | null {
    return this.premiumStatus;
  }

  isPremiumUser(): boolean {
    return this.premiumStatus?.isPremium || false;
  }

  getCurrentPlan(): PremiumPlan {
    return this.premiumStatus?.premiumPlan || "free";
  }
  hasFeature(featureId: string): boolean {
    // All features are now free - always return true
    return true;
  }

  canUseFeature(featureId: string): boolean {
    // All features are now available - always return true
    return true;
  }
  canCreateForm(): boolean {
    // All plans now have unlimited forms
    return true;
  }

  canAccessFeature(featureId: string): boolean {
    // All features are now free
    return true;
  }

  getFeatureRequirement(featureId: string): PremiumFeature | null {
    return PREMIUM_FEATURES[featureId] || null;
  }

  getUsageLimits() {
    const plan = this.getCurrentPlan();
    return getPlanLimits(plan);
  }
  checkUsageLimit(
    type: keyof typeof PLAN_LIMITS.free,
    currentUsage: number,
  ): boolean {
    // All limits are now unlimited - always return true
    return true;
  }
  getDaysRemaining(): number | null {
    return this.premiumStatus?.daysRemaining || null;
  }

  isExpiringSoon(days: number = 7): boolean {
    const remaining = this.getDaysRemaining();
    return remaining !== null && remaining <= days && remaining > 0;
  }

  isTrial(): boolean {
    return this.premiumStatus?.isTrial || false;
  }
}

// Utility functions for easy use in components
export const premiumChecker = PremiumChecker.getInstance();

// Hook for premium status
export const usePremium = () => {
  const status = premiumChecker.getPremiumStatus();

  return {
    isPremium: premiumChecker.isPremiumUser(),
    currentPlan: premiumChecker.getCurrentPlan(),
    isTrial: premiumChecker.isTrial(),
    status,
    hasFeature: (featureId: string) => premiumChecker.hasFeature(featureId),
    canAccess: (featureId: string) =>
      premiumChecker.canAccessFeature(featureId),
    canUseFeature: (featureId: string) =>
      premiumChecker.canUseFeature(featureId),
    refresh: () => premiumChecker.refreshPremiumStatus(),
    isExpiringSoon: (days?: number) => premiumChecker.isExpiringSoon(days),
    daysRemaining: premiumChecker.getDaysRemaining(),
    usageLimits: premiumChecker.getUsageLimits(),
    checkUsageLimit: (
      type: keyof typeof PLAN_LIMITS.free,
      currentUsage: number,
    ) => premiumChecker.checkUsageLimit(type, currentUsage),
    // Feature status helpers
    isFeatureAvailable: (featureId: string) => isFeatureAvailable(featureId),
    isFeatureComingSoon: (featureId: string) => isFeatureComingSoon(featureId),
    isFeatureBeta: (featureId: string) => isFeatureBeta(featureId),
    getFeatureStatus: (featureId: string) => getFeatureStatus(featureId),
    getComingSoonMessage: (featureId: string) =>
      getComingSoonMessage(featureId),
  };
};

// Server-side premium checker for API routes
export const checkPremiumServer = async (
  userId: string,
): Promise<PremiumStatus> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc("get_user_premium_status", {
      user_id: userId,
    });

    if (error) {
      console.error("Error checking premium status:", error);
      return {
        isPremium: false,
        premiumPlan: "free",
        expiresAt: null,
        subscriptionStatus: "inactive",
        daysRemaining: null,
        isTrial: false,
      };
    }

    return {
      isPremium: data[0]?.is_premium || false,
      premiumPlan: data[0]?.premium_plan || "free",
      expiresAt: data[0]?.expires_at || null,
      subscriptionStatus: data[0]?.subscription_status || "inactive",
      daysRemaining: data[0]?.days_remaining || null,
      isTrial: data[0]?.is_trial || false,
    };
  } catch (error) {
    console.error("Error checking premium status:", error);
    return {
      isPremium: false,
      premiumPlan: "free",
      expiresAt: null,
      subscriptionStatus: "inactive",
      daysRemaining: null,
      isTrial: false,
    };
  }
};

// Decorator for marking functions as premium
export const requiresPremium = (featureId: string) => {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // All features are now free - no restrictions
      return method.apply(this, args);
    };
  };
};

// Simple function wrapper for premium features
export const withPremiumCheck = <T extends (...args: any[]) => any>(
  featureId: string,
  fn: T,
  fallback?: () => any,
): T => {
  return ((...args: any[]) => {
    // All features are now free - no restrictions
    return fn(...args);
  }) as T;
};

// Easy-to-use feature checking functions
export const isPremiumFeature = (featureId: string): boolean => {
  const feature = PREMIUM_FEATURES[featureId];
  return feature ? feature.requiredPlan !== "free" : false;
};

export const getRequiredPlan = (featureId: string): PremiumPlan | null => {
  const feature = PREMIUM_FEATURES[featureId];
  return feature ? feature.requiredPlan : null;
};

// Feature status checking functions
export const isFeatureAvailable = (featureId: string): boolean => {
  const feature = PREMIUM_FEATURES[featureId];
  return feature ? feature.status === "available" : false;
};

export const isFeatureComingSoon = (featureId: string): boolean => {
  const feature = PREMIUM_FEATURES[featureId];
  return feature ? feature.status === "coming_soon" : false;
};

export const isFeatureBeta = (featureId: string): boolean => {
  const feature = PREMIUM_FEATURES[featureId];
  return feature ? feature.status === "beta" : false;
};

export const getFeatureStatus = (featureId: string): string | null => {
  const feature = PREMIUM_FEATURES[featureId];
  return feature ? feature.status : null;
};

export const getComingSoonMessage = (featureId: string): string | null => {
  const feature = PREMIUM_FEATURES[featureId];
  return feature?.comingSoonMessage || null;
};

// Feature marking helpers for components
export const markAsPremium = (featureId: string) => ({
  "data-premium-feature": featureId,
  "data-required-plan": getRequiredPlan(featureId),
});

// Monthly subscription management helpers
export const SUBSCRIPTION_PRICES = {
  pro: 19.99,
} as const;

export const TRIAL_DURATION_DAYS = 14;

// Feature categorization helpers
export const getFeaturesByCategory = (category: string): PremiumFeature[] => {
  return Object.values(PREMIUM_FEATURES).filter(
    (feature) => feature.category === category,
  );
};

export const getFeaturesByStatus = (
  status: "available" | "coming_soon" | "beta",
): PremiumFeature[] => {
  return Object.values(PREMIUM_FEATURES).filter(
    (feature) => feature.status === status,
  );
};

export const getAvailableFeatures = (): PremiumFeature[] => {
  return getFeaturesByStatus("available");
};

export const getComingSoonFeatures = (): PremiumFeature[] => {
  return getFeaturesByStatus("coming_soon");
};

export const getBetaFeatures = (): PremiumFeature[] => {
  return getFeaturesByStatus("beta");
};

export const getAllFeatureCategories = (): string[] => {
  const categories = new Set(
    Object.values(PREMIUM_FEATURES).map((feature) => feature.category),
  );
  return Array.from(categories).sort();
};

// Premium badge helpers for UI components
export const getPremiumBadgeText = (featureId: string): string => {
  const feature = PREMIUM_FEATURES[featureId];
  if (!feature) return "PREMIUM";

  if (feature.status === "coming_soon") return "COMING SOON";
  if (feature.status === "beta") return "BETA";
  return feature.requiredPlan.toUpperCase();
};
