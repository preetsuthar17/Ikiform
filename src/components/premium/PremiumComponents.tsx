// Premium UI Components - Secure premium feature UI components
"use client";

import React, { ReactNode } from "react";
import {
  usePremium,
  PREMIUM_FEATURES,
  PremiumFeature,
  getPremiumBadgeText,
} from "@/lib/premium";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Crown,
  Lock,
  Zap,
  Star,
  Shield,
  Sparkles,
  AlertTriangle,
  Clock,
  Calendar,
  Wrench,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumGateProps {
  featureId: string;
  children?: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
  className?: string;
}

// Main component to gate premium features
export const PremiumGate: React.FC<PremiumGateProps> = ({
  featureId,
  children,
  fallback,
  showUpgrade = true,
  className,
}) => {
  const { hasFeature, isPremium } = usePremium();
  const feature = PREMIUM_FEATURES[featureId];

  // All features are now free - always show children
  return <div className={className}>{children}</div>;
};

interface PremiumUpgradeCardProps {
  feature?: PremiumFeature;
  compact?: boolean;
  className?: string;
}

export const PremiumUpgradeCard: React.FC<PremiumUpgradeCardProps> = ({
  feature,
  compact = false,
  className,
}) => {
  const { isPremium, status } = usePremium();

  // Handle different feature statuses
  const getFeatureIcon = () => {
    if (feature?.status === "coming_soon") return Calendar;
    if (feature?.status === "beta") return Wrench;
    return Crown;
  };

  const getFeatureColors = () => {
    if (feature?.status === "coming_soon") {
      return {
        alert: "border-blue-200 bg-blue-50",
        card: "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50",
        icon: "bg-gradient-to-br from-blue-500 to-indigo-500",
        badge: "bg-blue-100 text-blue-800 border-blue-300",
        button:
          "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
        text: "text-blue-800",
      };
    }
    if (feature?.status === "beta") {
      return {
        alert: "border-purple-200 bg-purple-50",
        card: "border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50",
        icon: "bg-gradient-to-br from-purple-500 to-pink-500",
        badge: "bg-purple-100 text-purple-800 border-purple-300",
        button:
          "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
        text: "text-purple-800",
      };
    }
    return {
      alert: "border-amber-200 bg-amber-50",
      card: "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50",
      icon: "bg-gradient-to-br from-amber-500 to-orange-500",
      badge: "bg-amber-100 text-amber-800 border-amber-300",
      button:
        "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
      text: "text-amber-800",
    };
  };

  const colors = getFeatureColors();
  const FeatureIcon = getFeatureIcon();

  if (compact) {
    return (
      <Alert className={cn(colors.alert, className)}>
        <FeatureIcon className="h-4 w-4 text-amber-600" />
        <AlertTitle className={colors.text}>
          {feature?.status === "coming_soon"
            ? "Coming Soon"
            : feature?.status === "beta"
              ? "Beta Feature"
              : "Premium Feature"}
        </AlertTitle>
        <AlertDescription className="text-amber-700">
          {feature?.status === "coming_soon"
            ? feature.comingSoonMessage || "This feature is in development."
            : feature
              ? feature.description
              : "This feature requires a premium subscription."}
          {feature?.status !== "coming_soon" && (
            <Button
              variant="link"
              className="p-0 h-auto text-amber-800 font-semibold"
            >
              Upgrade Now
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // For coming soon features, use ComingSoonCard
  if (feature?.status === "coming_soon") {
    return <ComingSoonCard feature={feature} className={className} />;
  }

  const getButtonText = () => {
    if (feature?.status === "beta") return "Join Beta";
    return "Upgrade to Premium";
  };

  return (
    <Card className={cn(colors.card, className)}>
      <CardHeader className="text-center">
        <div
          className={`mx-auto w-12 h-12 rounded-full ${colors.icon} flex items-center justify-center mb-4`}
        >
          <FeatureIcon className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">
          {feature ? `Unlock ${feature.name}` : "Premium Feature"}
          {feature?.status === "beta" && (
            <Badge
              variant="secondary"
              className="ml-2 bg-purple-100 text-purple-800"
            >
              BETA
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {feature
            ? feature.description
            : "This feature is available with a premium subscription"}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex justify-center">
          <Badge variant="secondary" className={colors.badge}>
            <Sparkles className="w-3 h-3 mr-1" />
            {feature?.requiredPlan.toUpperCase()} PLAN
          </Badge>
        </div>
        <Button className={`w-full ${colors.button} text-white`}>
          <FeatureIcon className="w-4 h-4 mr-2" />
          {getButtonText()}
        </Button>
        <p className="text-xs text-gray-500">
          {feature?.status === "beta"
            ? "Beta access included with Pro plan"
            : "30-day money back guarantee"}
        </p>
      </CardContent>
    </Card>
  );
};

interface PremiumButtonProps {
  featureId: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  featureId,
  children,
  onClick,
  disabled,
  variant = "default",
  size = "default",
  className,
}) => {
  const { hasFeature, getFeatureStatus } = usePremium();
  const feature = PREMIUM_FEATURES[featureId];
  const featureStatus = getFeatureStatus(featureId);
  const canAccess = hasFeature(featureId) && featureStatus === "available";
  const isComingSoon = featureStatus === "coming_soon";
  const isBeta = featureStatus === "beta";

  const handleClick = () => {
    if (canAccess && onClick) {
      onClick();
    } else if (isComingSoon) {
      // Show coming soon notification
      console.log("Feature coming soon:", featureId);
    } else if (!canAccess) {
      // Show upgrade modal or redirect
      console.log("Premium required for:", featureId);
    }
  };

  const getButtonIcon = () => {
    if (isComingSoon) return Calendar;
    if (isBeta) return Wrench;
    if (!canAccess) return Lock;
    return null;
  };

  const ButtonIcon = getButtonIcon();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || (!canAccess && !isComingSoon)}
      className={cn(
        !canAccess && !isComingSoon && "opacity-75 cursor-not-allowed",
        isComingSoon && "opacity-60",
        className
      )}
      title={isComingSoon ? feature?.comingSoonMessage : undefined}
    >
      {ButtonIcon && <ButtonIcon className="w-4 h-4 mr-2" />}
      {children}
      {isBeta && (
        <Badge
          variant="secondary"
          className="ml-2 text-xs bg-purple-100 text-purple-800"
        >
          BETA
        </Badge>
      )}
    </Button>
  );
};

interface PremiumFeatureListProps {
  features: string[];
  showStatus?: boolean;
  className?: string;
}

export const PremiumFeatureList: React.FC<PremiumFeatureListProps> = ({
  features,
  showStatus = true,
  className,
}) => {
  const { hasFeature, isPremium, getFeatureStatus } = usePremium();

  const getFeatureDisplayInfo = (
    feature: PremiumFeature,
    hasAccess: boolean
  ) => {
    const status = feature.status;

    if (status === "coming_soon") {
      return {
        bgColor: "bg-blue-50 border-blue-200",
        dotColor: "bg-blue-500",
        badgeIcon: Calendar,
        badgeText: "Coming Soon",
        badgeClass: "bg-blue-100 text-blue-800",
      };
    }

    if (status === "beta") {
      return {
        bgColor: hasAccess
          ? "bg-purple-50 border-purple-200"
          : "bg-gray-50 border-gray-200",
        dotColor: hasAccess ? "bg-purple-500" : "bg-gray-400",
        badgeIcon: hasAccess ? Wrench : Lock,
        badgeText: hasAccess ? "Beta" : "Locked",
        badgeClass: hasAccess ? "bg-purple-100 text-purple-800" : "",
      };
    }

    // Available features
    return {
      bgColor: hasAccess
        ? "bg-green-50 border-green-200"
        : "bg-gray-50 border-gray-200",
      dotColor: hasAccess ? "bg-green-500" : "bg-gray-400",
      badgeIcon: hasAccess ? Shield : Lock,
      badgeText: hasAccess ? "Active" : "Locked",
      badgeClass: hasAccess ? "bg-green-100 text-green-800" : "",
    };
  };

  return (
    <div className={cn("space-y-2", className)}>
      {features.map((featureId) => {
        const feature = PREMIUM_FEATURES[featureId];
        const hasAccess =
          hasFeature(featureId) && feature?.status === "available";

        if (!feature) return null;

        const displayInfo = getFeatureDisplayInfo(feature, hasAccess);
        const BadgeIcon = displayInfo.badgeIcon;

        return (
          <div
            key={featureId}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              displayInfo.bgColor
            )}
          >
            <div className="flex items-center space-x-3">
              <div
                className={cn("w-2 h-2 rounded-full", displayInfo.dotColor)}
              />
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">{feature.name}</p>
                  {feature.status === "beta" && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-purple-100 text-purple-800"
                    >
                      BETA
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {feature.status === "coming_soon" && feature.comingSoonMessage
                    ? feature.comingSoonMessage
                    : feature.description}
                </p>
              </div>
            </div>
            {showStatus && (
              <div className="flex items-center space-x-2">
                <Badge
                  variant={hasAccess ? "default" : "secondary"}
                  className={displayInfo.badgeClass}
                >
                  <BadgeIcon className="w-3 h-3 mr-1" />
                  {displayInfo.badgeText}
                </Badge>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const PremiumStatus: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { isPremium, status, isExpiringSoon, daysRemaining } = usePremium();

  if (!status) return null;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            {isPremium ? (
              <>
                <Crown className="w-5 h-5 mr-2 text-amber-500" />
                Premium Active
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2 text-gray-500" />
                Free Plan
              </>
            )}
          </CardTitle>
          <Badge
            variant={isPremium ? "default" : "secondary"}
            className={isPremium ? "bg-amber-100 text-amber-800" : ""}
          >
            {status.subscriptionStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isPremium && isExpiringSoon() && (
          <Alert className="mb-4 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">Expiring Soon</AlertTitle>
            <AlertDescription className="text-orange-700">
              Your premium subscription expires in {daysRemaining} days.
            </AlertDescription>
          </Alert>
        )}

        {isPremium ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              You have access to all premium features.
            </p>
            {status.expiresAt && (
              <p className="text-xs text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Expires: {new Date(status.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Upgrade to unlock premium features and remove limitations.
            </p>
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Component for coming soon features
interface ComingSoonCardProps {
  feature?: PremiumFeature;
  compact?: boolean;
  className?: string;
}

export const ComingSoonCard: React.FC<ComingSoonCardProps> = ({
  feature,
  compact = false,
  className,
}) => {
  if (compact) {
    return (
      <Alert className={cn("border-blue-200 bg-blue-50", className)}>
        <Calendar className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Coming Soon</AlertTitle>
        <AlertDescription className="text-blue-700">
          {feature?.comingSoonMessage ||
            "This feature is in development and will be available soon."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card
      className={cn(
        "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50",
        className
      )}
    >
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">
          {feature ? `${feature.name} - Coming Soon` : "Coming Soon"}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {feature?.comingSoonMessage ||
            "This feature is in development and will be available soon."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex justify-center">
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            <Clock className="w-3 h-3 mr-1" />
            IN DEVELOPMENT
          </Badge>
        </div>
        <Button
          variant="outline"
          className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          <Info className="w-4 h-4 mr-2" />
          Get Notified When Available
        </Button>
        <p className="text-xs text-gray-500">
          We'll notify you when this feature launches
        </p>
      </CardContent>
    </Card>
  );
};

// Simple premium badge component for easy use
interface PremiumBadgeProps {
  featureId: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  featureId,
  className,
  size = "default",
}) => {
  const feature = PREMIUM_FEATURES[featureId];
  if (!feature) return null;

  const getVariantColors = () => {
    switch (feature.status) {
      case "coming_soon":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "beta":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  const getIcon = () => {
    switch (feature.status) {
      case "coming_soon":
        return (
          <Calendar
            className={`${size === "sm" ? "w-2 h-2" : "w-3 h-3"} mr-1`}
          />
        );
      case "beta":
        return (
          <Wrench className={`${size === "sm" ? "w-2 h-2" : "w-3 h-3"} mr-1`} />
        );
      default:
        return (
          <Crown className={`${size === "sm" ? "w-2 h-2" : "w-3 h-3"} mr-1`} />
        );
    }
  };

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    default: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        getVariantColors(),
        sizeClasses[size],
        "font-medium",
        className
      )}
    >
      {getIcon()}
      {getPremiumBadgeText(featureId)}
    </Badge>
  );
};

// Higher-order component for premium protection
export function withPremiumProtection<P extends object>(
  Component: React.ComponentType<P>,
  featureId: string,
  fallbackComponent?: React.ComponentType<P>
) {
  return function PremiumProtectedComponent(props: P) {
    const { hasFeature } = usePremium();

    if (hasFeature(featureId)) {
      return <Component {...props} />;
    }

    if (fallbackComponent) {
      const FallbackComponent = fallbackComponent;
      return <FallbackComponent {...props} />;
    }

    return <PremiumUpgradeCard feature={PREMIUM_FEATURES[featureId]} />;
  };
}
