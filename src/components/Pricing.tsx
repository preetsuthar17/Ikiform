"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Check, ArrowRight, Crown } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      description: "Perfect for individuals and small projects",
      price: "Free Forever!",
      popular: false,
      features: [
        "Unlimited forms & submissions",
        "15+ field types",
        "File uploads (10MB)",
        "Real-time analytics",
        "Customization",
        "Export responses",
        "Mobile responsive",
      ],
      cta: "Get Started Free",
      ctaVariant: "outline" as const,
    },
    {
      name: "Pro",
      description: "For businesses that need premium support",
      price: "$0",
      period: "/per month",
      originalPrice: "$29",
      popular: true,
      features: [
        "Everything in Free",
        "Priority email support",
        "Advanced security features",
        "Custom domains",
        "Password protection",
        "CAPTCHA integration",
        "Webhook integrations",
      ],
      cta: "Upgrade now!",
      ctaVariant: "default" as const,
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4">
            💰 Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-dm-sans font-medium mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Start free and scale as you grow. No hidden fees, no surprises.
            Everything you need to create amazing forms.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Check className="w-4 h-4 text-green-500" />
            <span>14-day free trial</span>
            <span>•</span>
            <Check className="w-4 h-4 text-green-500" />
            <span>No credit card required</span>
            <span>•</span>
            <Check className="w-4 h-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular
                    ? "border-0 bg-neutral-50"
                    : "border-0 bg-neutral-50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-zinc-900 text-white px-4 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Worth every penny
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-dm-sans mb-2">
                    {plan.name}
                  </CardTitle>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold  font-jetbrains-mono text-zinc-900">
                      {plan.price}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    size="lg"
                    variant={plan.ctaVariant}
                    className={`w-full ${
                      plan.popular ? "bg-zinc-900 hover:bg-zinc-800" : ""
                    }`}
                  >
                    <Link
                      href="/auth/login"
                      className="flex items-center justify-center gap-2"
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
