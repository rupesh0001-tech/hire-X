"use client";
import { motion } from "framer-motion";
import { WordRotate } from "@/components/ui/word-rotate";

export function HeroHeadline() {
  return (
    <motion.h1 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
      }}
      className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-black dark:text-white"
    >
      The Ultimate Platform for <br /> <WordRotate 
        className="text-transparent my-1 bg-clip-text bg-linear-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-emerald-200" 
        words={["Career Growth", "Job Matchmaking", "Networking Events", "Founder Funding", "Expert Resumes", "Secure Face-Auth", "Marketplace"]} 
      />
      <br className="hidden md:block" />
      <span className="text bg-clip-text text-black dark:text-white">
         Built for the Future.
      </span>
    </motion.h1>
  );
}
