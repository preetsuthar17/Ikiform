"use client";

import { useState, useEffect } from "react";
import { waitlistService } from "../lib/supabase/waitlist";
import confetti from "canvas-confetti";
import { waitlistToasts } from "../lib/toast";

const Hero = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number>(0);
  const [countLoading, setCountLoading] = useState(true);
  // Fetch waitlist count on component mount
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const result = await waitlistService.getWaitlistCount();
        setWaitlistCount(result.count);
      } catch (error) {
        console.error("Failed to fetch waitlist count:", error);
        // Silently fail for count loading - don't show toast for this
      } finally {
        setCountLoading(false);
      }
    };

    fetchCount();
  }, []);

  const triggerConfetti = () => {
    // Create a burst of confetti from the center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Add a second burst with different colors
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      waitlistToasts.invalidEmail();
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      waitlistToasts.invalidEmail();
      return;
    }

    setLoading(true);

    try {
      const result = await waitlistService.addToWaitlist(email);

      if (result.success) {
        setEmail(""); // Clear email on success
        triggerConfetti(); // 🎉 Trigger confetti animation
        waitlistToasts.success(result.message);

        // Update waitlist count
        const countResult = await waitlistService.getWaitlistCount();
        setWaitlistCount(countResult.count);
      } else {
        // Handle specific error cases
        if (result.message.includes("already")) {
          waitlistToasts.alreadyJoined();
        } else {
          waitlistToasts.unknownError();
        }
      }
    } catch (error) {
      waitlistToasts.networkError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="flex items-center justify-center text-center flex-col max-w-6xl w-[95%] mx-auto py-20 gap-5">
        <h1 className="text-4xl md:text-6xl font-dm-sans font-medium text-center mt-10 flex flex-col gap-3">
          <span>Beyond just forms.</span>
          <span>Beautiful forms at your fingertips.</span>
        </h1>{" "}
        <p className="text-lg text-gray-600 max-w-2xl">
          Ikiform is an open-source alternative to Typeform and Google Forms,
          designed to help you create beautiful forms effortlessly.
        </p>
        {/* Waitlist Form */}
        <div className="w-full max-w-md mt-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {" "}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                disabled={loading}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Joining..." : "Join Waitlist"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Hero;
