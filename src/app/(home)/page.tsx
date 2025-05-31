import Hero from "@/components/Hero";
import FeatureShowcase from "@/components/FeatureShowcase";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-inter)]">
      <Hero />
      <Pricing />
    </div>
  );
}
