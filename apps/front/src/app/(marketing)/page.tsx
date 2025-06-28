import { BentoDemo } from "@/components/blocks/bento-grid-block";
import FooterSection from "@/components/blocks/footer";
import { HeroSection } from "@/components/blocks/hero-section-5";
import { MailBeamBlock } from "@/components/blocks/mail-beam-block";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <MailBeamBlock/>
      <BentoDemo/>
      <FooterSection />
    </div>
  );
}
