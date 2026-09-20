import { isNationalDayCampaignActive } from "@/lib/campaigns/saudi-national-day";
import { DefaultHeroSection } from "@/components/home/default-hero-section";
import { NationalDayHeroSection } from "@/components/home/national-day-hero-section";

type HeroSectionProps = {
  heroVideoSrc?: string | null;
};

export function HeroSection({ heroVideoSrc = null }: HeroSectionProps) {
  if (isNationalDayCampaignActive()) {
    return <NationalDayHeroSection />;
  }
  return <DefaultHeroSection heroVideoSrc={heroVideoSrc} />;
}
