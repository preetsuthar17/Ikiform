"use client";

import { useState, useEffect } from "react";
import { waitlistService } from "../lib/supabase/waitlist";
import confetti from "canvas-confetti";
import { waitlistToasts } from "../lib/toast";
import Image from "next/image";

const Hero = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number>(0);
  const [countLoading, setCountLoading] = useState(true);

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

    fetchCount();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      waitlistToasts.invalidEmail();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      waitlistToasts.invalidEmail();
      return;
    }

    setLoading(true);

    try {
      const result = await waitlistService.addToWaitlist(email);

      if (result.success) {
        setEmail("");
        triggerConfetti();
        waitlistToasts.success(result.message);

        const countResult = await waitlistService.getWaitlistCount();
        setWaitlistCount(countResult.count);
      } else {
        if (result.message.includes("already")) {
          waitlistToasts.alreadyJoined();
        } else {
          waitlistToasts.unknownError();
        }
      }
    } catch {
      waitlistToasts.networkError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center text-center max-w-6xl w-[95%] mx-auto py-12 gap-5">
      <h1 className="text-4xl md:text-5xl font-dm-sans font-medium mt-10 flex flex-col gap-3 max-w-4xl">
        Beautiful, budget-friendly forms without compromises
      </h1>
      <p className="text-gray-600 max-w-2xl">
        Ikiform is an open-source alternative to Typeform and Google Forms,
        designed to help you create beautiful forms effortlessly.
      </p>

      <div className="w-full max-w-md mt-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 text-sm">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exampe@0.email"
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

        {!countLoading && (
          <p className="mt-4 text-gray-500 text-sm">
            {waitlistCount.toLocaleString()} people have already joined the
            waitlist!
          </p>
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
