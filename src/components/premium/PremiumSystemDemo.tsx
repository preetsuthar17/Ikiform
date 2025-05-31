// Premium System Usage Examples
// This file demonstrates how to use the enhanced premium system with coming soon features

import React from "react";
import {
  PremiumGate,
  PremiumUpgradeCard,
  ComingSoonCard,
  PremiumFeatureList,
  PremiumBadge,
  PremiumButton,
} from "@/components/premium/PremiumComponents";
import {
  usePremium,
  PREMIUM_FEATURES,
  getAvailableFeatures,
  getComingSoonFeatures,
  getBetaFeatures,
  getAllFeatureCategories,
} from "@/lib/premium";

export const PremiumSystemDemo: React.FC = () => {
  const {
    isPremium,
    currentPlan,
    canUseFeature,
    isFeatureComingSoon,
    isFeatureBeta,
  } = usePremium();

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Premium System Demo</h1>
      {/* Current Status */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Current Status</h2>
        <p>Plan: {currentPlan}</p>
        <p>Premium: {isPremium ? "Yes" : "No"}</p>
      </div>
      {/* Premium Gates Examples */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Premium Gates</h2>

        {/* Available Feature */}
        <PremiumGate featureId="CUSTOM_BRANDING">
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            ✅ Custom Branding Feature Content (Available)
          </div>
        </PremiumGate>

        {/* Coming Soon Feature */}
        <PremiumGate featureId="FILE_UPLOADS">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            📁 File Upload Feature Content (Coming Soon)
          </div>
        </PremiumGate>

        {/* Beta Feature */}
        <PremiumGate featureId="API_ACCESS">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded">
            🚀 API Access Feature Content (Beta)
          </div>
        </PremiumGate>
      </div>
      {/* Premium Badges */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Premium Badges</h2>
        <div className="flex gap-2 flex-wrap">
          <PremiumBadge featureId="CUSTOM_BRANDING" size="sm" />
          <PremiumBadge featureId="FILE_UPLOADS" />
          <PremiumBadge featureId="API_ACCESS" size="lg" />
          <PremiumBadge featureId="TEAM_COLLABORATION" />
        </div>
      </div>
      {/* Premium Buttons */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Premium Buttons</h2>
        <div className="flex gap-2 flex-wrap">
          <PremiumButton
            featureId="WEBHOOK_INTEGRATIONS"
            onClick={() => alert("Webhook setup!")}
          >
            Setup Webhooks
          </PremiumButton>
          <PremiumButton
            featureId="FILE_UPLOADS"
            onClick={() => alert("File upload!")}
          >
            Upload Files (Coming Soon)
          </PremiumButton>
          <PremiumButton
            featureId="API_ACCESS"
            onClick={() => alert("API access!")}
          >
            Access API (Beta)
          </PremiumButton>
        </div>
      </div>
      {/* Feature Lists by Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Available Features</h3>
          <PremiumFeatureList
            features={getAvailableFeatures().map((f) => f.id.toUpperCase())}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Coming Soon Features</h3>
          <PremiumFeatureList
            features={getComingSoonFeatures().map((f) => f.id.toUpperCase())}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Beta Features</h3>
          <PremiumFeatureList
            features={getBetaFeatures().map((f) => f.id.toUpperCase())}
          />
        </div>
      </div>{" "}
      {/* Individual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PremiumUpgradeCard feature={PREMIUM_FEATURES.UNLIMITED_FORMS} />
        <ComingSoonCard feature={PREMIUM_FEATURES.PAYMENT_INTEGRATION} />
        <PremiumUpgradeCard feature={PREMIUM_FEATURES.API_ACCESS} />
      </div>
      {/* Feature Status Checks */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Feature Status Checks</h2>
        <div className="text-sm space-y-1">
          <p>
            Can use Custom Branding:{" "}
            {canUseFeature("CUSTOM_BRANDING") ? "✅" : "❌"}
          </p>
          <p>
            Can use File Uploads: {canUseFeature("FILE_UPLOADS") ? "✅" : "❌"}
          </p>
          <p>
            Is File Uploads coming soon:{" "}
            {isFeatureComingSoon("FILE_UPLOADS") ? "✅" : "❌"}
          </p>
          <p>Is API Access beta: {isFeatureBeta("API_ACCESS") ? "✅" : "❌"}</p>
        </div>
      </div>
    </div>
  );
};

// Example usage in a form builder component
export const FormBuilderPremiumExample: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">Advanced Features</h3>
        <PremiumBadge featureId="CONDITIONAL_LOGIC" size="sm" />
      </div>

      <PremiumGate
        featureId="CONDITIONAL_LOGIC"
        fallback={
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-600 mb-3">Conditional Logic</p>
            <PremiumBadge featureId="CONDITIONAL_LOGIC" />
          </div>
        }
      >
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium mb-2">Conditional Logic Settings</h4>
          <p className="text-sm text-gray-600">
            Configure when this field should show or hide based on other field
            values.
          </p>
          {/* Conditional logic form would go here */}
        </div>
      </PremiumGate>

      <PremiumGate
        featureId="FILE_UPLOADS"
        showUpgrade={false}
        fallback={
          <ComingSoonCard feature={PREMIUM_FEATURES.FILE_UPLOADS} compact />
        }
      >
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium mb-2">File Upload Field</h4>
          <p className="text-sm text-gray-600">
            Allow users to upload files with this field.
          </p>
        </div>
      </PremiumGate>
    </div>
  );
};
