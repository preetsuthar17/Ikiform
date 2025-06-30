"use client";

import { Button } from "../ui/button";

const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center max-w-6xl w-[95%] mx-auto py-12 gap-5 relative overflow-hidden">
      <h1 className="text-4xl md:text-5xl tracking-tight font-medium mt-10 flex flex-col gap-3 max-w-3xl relative">
        <span className="inline-block px-2 py-1 ">
          Beautiful, budget-friendly forms without compromises
        </span>
      </h1>
      <p className="text-muted-foreground max-w-2xl">
        Forms0 is an open-source alternative to Typeform and Google Forms,
        designed to help you create beautiful forms effortlessly.
      </p>
      <div className="w-full max-w-md mt-8 flex flex-col items-center">
        <Button size="lg" disabled>
          Coming Soon
        </Button>
      </div>
    </section>
  );
};

export default Hero;
