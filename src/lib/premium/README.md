# Premium Feature System Documentation

## Overview

The Premium Feature System provides a comprehensive, modular approach to managing features in your form builder application. The system has been simplified to make all features free for now, while maintaining the infrastructure for future premium features. Currently supports Free and Pro plans where most features are available to all users.

## Key Features

- **Simplified Plans**: Only Free and Pro plans for easier management
- **All Features Free**: All features are currently available to free users
- **Modular Components**: Reusable UI components that can be easily re-enabled for premium gating
- **Type Safety**: Full TypeScript support with proper type definitions
- **Easy Integration**: Simple hooks and utilities for feature checking

## Plans Structure

### Free Plan (Current Default)

- Unlimited forms
- Unlimited submissions
- All features available
- 100MB file upload limit
- 10GB storage
- Advanced analytics
- Custom branding
- Webhook integrations
- Advanced security features
- Team collaboration

### Pro Plan ($19.99/month)

- Everything in Free plan
- Increased file upload limit (500MB)
- Increased storage (50GB)
- Priority support

## Feature Categories

### Forms

- `UNLIMITED_FORMS` - Create unlimited forms (Free)
- `CONDITIONAL_LOGIC` - Show/hide fields based on responses (Free)
- `FILE_UPLOADS` - Allow file uploads in forms (Free)
- `MULTI_STEP_FORMS` - Create multi-page forms (Free)
- `FORM_SCHEDULING` - Schedule form availability (Free)

### Analytics & Data

- `ADVANCED_ANALYTICS` - Detailed analytics and insights (Free)
- `EXPORT_RESPONSES` - Export responses to CSV/Excel (Free)

### Branding & Customization

- `CUSTOM_BRANDING` - Remove branding and add your own (Free)
- `FORM_TEMPLATES` - Access premium form templates (Free)

### Integrations

- `WEBHOOK_INTEGRATIONS` - Send form data to external services (Free)
- `PAYMENT_INTEGRATION` - Accept payments through forms (Free)
- `API_ACCESS` - Access forms and submissions via REST API (Free)

### Security

- `ADVANCED_SECURITY` - CAPTCHA, IP limiting, time restrictions (Free)

### Collaboration & Support

- `TEAM_COLLABORATION` - Share forms with team members (Free)
- `PRIORITY_SUPPORT` - Get priority customer support (Pro)

## Usage Examples

### Basic Feature Gating

```tsx
import { PremiumGate } from '@/components/premium/PremiumComponents';

// Gate premium content
<PremiumGate featureId="CUSTOM_BRANDING">
  <CustomBrandingSettings />
</PremiumGate>

// With fallback for coming soon features
<PremiumGate
  featureId="FILE_UPLOADS"
  fallback={<ComingSoonMessage />}
>
  <FileUploadSettings />
</PremiumGate>
```

### Premium Badges

```tsx
import { PremiumBadge } from '@/components/premium/PremiumComponents';

// Simple badge
<PremiumBadge featureId="WEBHOOK_INTEGRATIONS" />

// Different sizes
<PremiumBadge featureId="FILE_UPLOADS" size="sm" />
<PremiumBadge featureId="API_ACCESS" size="lg" />
```

### Feature Status Checking

```tsx
import { usePremium } from "@/lib/premium";

const MyComponent = () => {
  const {
    canUseFeature,
    isFeatureComingSoon,
    isFeatureBeta,
    getComingSoonMessage,
  } = usePremium();

  // Check if user can actually use the feature
  const canUploadFiles = canUseFeature("FILE_UPLOADS"); // false for coming soon

  // Check feature status
  const isComingSoon = isFeatureComingSoon("FILE_UPLOADS"); // true
  const isBeta = isFeatureBeta("API_ACCESS"); // true

  // Get coming soon message
  const message = getComingSoonMessage("FILE_UPLOADS");
};
```

### Premium Buttons

```tsx
import { PremiumButton } from '@/components/premium/PremiumComponents';

// Button that handles premium requirements automatically
<PremiumButton
  featureId="WEBHOOK_INTEGRATIONS"
  onClick={() => setupWebhooks()}
>
  Setup Webhooks
</PremiumButton>

// Coming soon features are disabled with tooltip
<PremiumButton featureId="FILE_UPLOADS">
  Upload Files (Coming Soon)
</PremiumButton>
```

### Feature Lists

```tsx
import { PremiumFeatureList, getAvailableFeatures } from '@/lib/premium';

// Show all available features
<PremiumFeatureList
  features={getAvailableFeatures().map(f => f.id.toUpperCase())}
/>

// Show specific features
<PremiumFeatureList
  features={['CUSTOM_BRANDING', 'WEBHOOK_INTEGRATIONS', 'FILE_UPLOADS']}
/>
```

## Utility Functions

### Plan and Feature Checking

- `canUserAccessFeature(userPlan, requiredPlan)` - Check if plan has access
- `isFeatureAvailable(featureId)` - Check if feature is available (not coming soon)
- `isFeatureComingSoon(featureId)` - Check if feature is coming soon
- `isFeatureBeta(featureId)` - Check if feature is in beta

### Feature Organization

- `getFeaturesByCategory(category)` - Get features by category
- `getFeaturesByStatus(status)` - Get features by status
- `getAvailableFeatures()` - Get all available features
- `getComingSoonFeatures()` - Get all coming soon features
- `getBetaFeatures()` - Get all beta features

### Hooks

- `usePremium()` - Main hook for premium status and feature checking
  - `isPremium` - Whether user has premium
  - `currentPlan` - User's current plan
  - `hasFeature(id)` - Whether user's plan includes feature
  - `canUseFeature(id)` - Whether user can actually use feature (considers status)
  - `isFeatureAvailable(id)` - Whether feature is available
  - `isFeatureComingSoon(id)` - Whether feature is coming soon
  - `getComingSoonMessage(id)` - Get coming soon message

## Adding New Features

1. **Add to PREMIUM_FEATURES object**:

```typescript
NEW_FEATURE: {
  id: 'new_feature',
  name: 'New Feature',
  description: 'Description of the new feature',
  requiredPlan: 'pro',
  category: 'forms',
  status: 'coming_soon', // or 'available' or 'beta'
  comingSoonMessage: 'This feature is in development!'
}
```

2. **Use in components**:

```tsx
<PremiumGate featureId="NEW_FEATURE">
  <NewFeatureComponent />
</PremiumGate>
```

## Component Reference

### PremiumGate

Main component for gating premium features.

**Props:**

- `featureId: string` - ID of the feature to check
- `children: ReactNode` - Content to show if user has access
- `fallback?: ReactNode` - Content to show if user doesn't have access
- `showUpgrade?: boolean` - Whether to show upgrade card (default: true)
- `className?: string` - Additional CSS classes

### PremiumBadge

Simple badge component for showing feature status.

**Props:**

- `featureId: string` - ID of the feature
- `size?: 'sm' | 'default' | 'lg'` - Badge size
- `className?: string` - Additional CSS classes

### PremiumButton

Button that handles premium requirements automatically.

**Props:**

- `featureId: string` - ID of the feature to check
- `children: ReactNode` - Button content
- `onClick?: () => void` - Click handler (only called if user has access)
- Standard button props (variant, size, disabled, etc.)

### ComingSoonCard

Card component specifically for coming soon features.

**Props:**

- `feature?: PremiumFeature` - Feature object
- `compact?: boolean` - Whether to show compact version
- `className?: string` - Additional CSS classes

## Best Practices

1. **Always use canUseFeature()** instead of hasFeature() when checking if a user can actually use a feature
2. **Provide clear messaging** for coming soon features with expected timelines
3. **Use consistent badge placement** across the application
4. **Test all feature states** (available, coming soon, beta) in development
5. **Keep feature descriptions concise** but informative
6. **Group related features** in the same category for better organization

## Migration from Multi-Plan System

If migrating from a multi-plan system:

1. Update all feature `requiredPlan` values to either 'free' or 'pro'
2. Remove references to 'basic', 'enterprise', etc. plans
3. Update any hardcoded plan checks in components
4. Test all premium gates still work correctly
5. Update subscription pricing display to only show Pro plan
