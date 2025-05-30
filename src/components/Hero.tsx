"use client";

import { useState, useEffect } from "react";
import { waitlistService } from "../lib/supabase/waitlist";
import { createClient } from "@/lib/supabase/client";
import confetti from "canvas-confetti";
import {
  waitlistToasts,
  validationToasts,
  networkToasts,
  successToasts,
} from "../lib/toast";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number>(0);
  const [countLoading, setCountLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [starCount, setStarCount] = useState<number | null>(null);

  const supabase = createClient();

  // Extract user data from different OAuth providers
  const getUserDisplayData = (user: User | null) => {
    if (!user) return null;

    const metadata = user.user_metadata || {};
    const appMetadata = user.app_metadata || {};

    // For GitHub OAuth
    if (appMetadata.provider === "github") {
      return {
        name:
          metadata.full_name ||
          metadata.name ||
          metadata.user_name ||
          user.email?.split("@")[0] ||
          "GitHub User",
        firstName:
          metadata.full_name?.split(" ")[0] ||
          metadata.name?.split(" ")[0] ||
          metadata.user_name ||
          user.email?.split("@")[0] ||
          "there",
      };
    }

    // For Google OAuth
    if (appMetadata.provider === "google") {
      return {
        name:
          metadata.full_name ||
          metadata.name ||
          user.email?.split("@")[0] ||
          "Google User",
        firstName:
          metadata.given_name ||
          metadata.full_name?.split(" ")[0] ||
          metadata.name?.split(" ")[0] ||
          user.email?.split("@")[0] ||
          "there",
      };
    }

    // Fallback for other providers or direct email signup
    return {
      name:
        metadata.full_name ||
        metadata.name ||
        user.email?.split("@")[0] ||
        "User",
      firstName:
        metadata.full_name?.split(" ")[0] ||
        metadata.name?.split(" ")[0] ||
        user.email?.split("@")[0] ||
        "there",
    };
  };

  const userDisplayData = getUserDisplayData(user);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const result = await waitlistService.getWaitlistCount();
        setWaitlistCount(result.count);
      } catch (error) {
        console.error("Failed to fetch waitlist count:", error);
      } finally {
        setCountLoading(false);
      }
    };

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };

    fetchCount();
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
    }, 200);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 400);
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!email.trim()) {
  //     validationToasts.required("Email");
  //     return;
  //   }

  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   if (!emailRegex.test(email)) {
  //     validationToasts.invalidEmail();
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const result = await waitlistService.addToWaitlist(email);

  //     if (result.success) {
  //       setEmail("");
  //       triggerConfetti();
  //       successToasts.created("Waitlist entry");

  //       const countResult = await waitlistService.getWaitlistCount();
  //       setWaitlistCount(countResult.count);
  //     } else {
  //       if (result.message.includes("already")) {
  //         waitlistToasts.alreadyJoined();
  //       } else {
  //         waitlistToasts.unknownError();
  //       }
  //     }
  //   } catch (error) {
  //     if (error instanceof Error && error.message.includes("network")) {
  //       networkToasts.connectionError();
  //     } else if (error instanceof Error && error.message.includes("timeout")) {
  //       networkToasts.timeoutError();
  //     } else {
  //       networkToasts.apiError("waitlist");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    // Existing fetchCount and getUser calls...

    const fetchStarCount = async () => {
      try {
        const res = await fetch(
          "https://api.github.com/repos/preetsuthar17/ikiform"
        );
        const data = await res.json();
        if (data && typeof data.stargazers_count === "number") {
          setStarCount(data.stargazers_count);
        }
      } catch (err) {
        console.error("Failed to fetch GitHub stars", err);
      }
    };

    fetchStarCount();
  }, []);

  return (
    <section className="flex flex-col items-center justify-center text-center max-w-6xl w-[90%] mx-auto py-12 gap-5">
      <div className="flex items-center justify-center font-medium gap-2 text-sm text-gray-500 border px-4 py-2 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 text-yellow-500"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
        <span>
          {starCount !== null ? starCount.toLocaleString() : 0} GitHub Stars
        </span>
      </div>
      <h1 className="text-4xl md:text-5xl font-dm-sans font-medium mt-10 flex flex-col gap-3 max-w-4xl">
        Beautiful, budget-friendly forms without compromises
      </h1>
      <p className="text-gray-600 max-w-2xl">
        Ikiform is an open-source alternative to Typeform and Google Forms,
        designed to help you create beautiful forms effortlessly.
      </p>{" "}
      <div className="w-full max-w-md mt-8">
        {" "}
        {/* Show different content based on auth state */}
        {!authLoading && user && userDisplayData ? (
          // Authenticated user - show welcome back and dashboard button
          <div className="flex flex-col gap-4 text-center">
            <p className="text-gray-600">
              Welcome back, {userDisplayData.firstName}! 👋
            </p>
            <Button asChild size="lg" className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap justify-center items-center">
            <Link
              className="px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              href="/auth/login"
            >
              Get started - free
            </Link>
            <Link
              className="px-6 py-3 bg-gray-100 text-black rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              href="/auth/login"
            >
              View demo
            </Link>
          </div>
        )}
      </div>
      <div className="w-full mt-16">
        <div className="relative">
          <img
            src="/hero/hero-image.png"
            alt="Ikiform Dashboard Preview"
            className="object-cover w-full h-full border border-gray-300 rounded-2xl shadow-2xl/10"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
