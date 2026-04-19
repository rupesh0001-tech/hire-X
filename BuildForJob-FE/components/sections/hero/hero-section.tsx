"use client";
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import ScrollRevealParagraph from "@/components/scroll-reveal-paragraph";
import { GridBackground } from "@/components/ui/grid-background";
import { HeroCta } from "./hero-cta";
import { HeroBadge } from "./hero-badge";
import { HeroHeadline } from "./hero-headline";
import { HeroMockup } from "./hero-mockup";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function HeroSection() {
  return (
    <section className="relative w-full pt-16 pb-24 md:pt-24 text-center">
      <GridBackground />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          <HeroBadge />
          <HeroHeadline />

          <ScrollRevealParagraph 
            className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
            paragraph="The all-in-one ecosystem for job seekers and founders. Discover elite opportunities, host professional events, secure funding, and build unbeatable AI-powered job applications."
          />

          <HeroCta />
          
          <motion.p variants={fadeIn} className="mt-6 text-sm text-gray-500 flex items-center justify-center gap-2">
            <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-500" /> No credit card required. Free templates included.
          </motion.p>
        </motion.div>

        <HeroMockup />
      </div>
    </section>
  );
}
