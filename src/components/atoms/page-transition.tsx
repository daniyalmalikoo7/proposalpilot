"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

const pageTransition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

interface PageTransitionProps {
  readonly children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={prefersReducedMotion ? { opacity: 0 } : pageVariants.initial}
        animate={prefersReducedMotion ? { opacity: 1 } : pageVariants.animate}
        exit={prefersReducedMotion ? { opacity: 0 } : pageVariants.exit}
        transition={pageTransition}
        style={{ height: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
