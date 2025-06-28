"use client";

import { AnimatedBeamMultipleOutputDemo } from "@/components/ui/mail-beam";
import { Button } from "@/components/ui/button";
import { Mail, Send, Check, ArrowRight } from 'lucide-react';

export function MailBeamBlock() {
  return (
    <section className="w-full overflow-hidden py-12 md:py-12 lg:py-15 bg-background">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text Content - First on mobile, left on desktop */}
          <div className="flex flex-col justify-center space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Smart Email Delivery System
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                Our intelligent system analyzes and delivers your emails to the right recipients at the perfect time.
                Watch as your messages find their way to the most relevant contacts across multiple platforms.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button className="bg-primary hover:bg-primary/90 h-12 px-6">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-12 px-6">
                Learn More
              </Button>
            </div>
          </div>

          {/* Animated Beam - Second on mobile, right on desktop */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <div className="w-full max-w-2xl aspect-square">
              <AnimatedBeamMultipleOutputDemo />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
