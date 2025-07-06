import {
  BarChart2,
  Users,
  Palette,
  MailCheck,
  Sparkles
} from "lucide-react";

import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";

const features = [
  {
    Icon: Sparkles,
    name: "AI-Powered Content",
    description: "Generate high-converting email copy in seconds with our advanced AI, tailored to your brand voice.",
    href: "#",
    cta: "See how it works",
    background: <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-10 blur-3xl" />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: BarChart2,
    name: "Smart Analytics",
    description: "Track opens, clicks, and conversions with real-time analytics to optimize your campaigns.",
    href: "#",
    cta: "View analytics",
    background: <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-green-500 to-teal-600 opacity-10 blur-3xl" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: Users,
    name: "Audience Segmentation",
    description: "Create targeted campaigns by segmenting your audience based on behavior and preferences.",
    href: "#",
    cta: "Learn more",
    background: <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 opacity-10 blur-3xl" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Palette,
    name: "Beautiful Templates",
    description: "Choose from professionally designed, mobile-responsive email templates that convert.",
    href: "#",
    cta: "Browse templates",
    background: <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 opacity-10 blur-3xl" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: MailCheck,
    name: "Automated Workflows",
    description: "Set up automated email sequences that nurture leads and drive conversions.",
    href: "#",
    cta: "Explore workflows",
    background: <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 opacity-10 blur-3xl" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export function BentoDemo() {
  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Powerful Email Marketing Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to create, send, and track high-performing email campaigns.</p>
        </div>
        <BentoGrid className="lg:grid-rows-3">
          {features.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
  