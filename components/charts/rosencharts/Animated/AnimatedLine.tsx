"use client";
import React from "react";

import { motion } from "motion/react";

export function AnimatedLine({
  children,
  withAnimation = false,
  lineLength = 1,
}: {
  children: React.ReactNode;
  withAnimation?: boolean;
  lineLength?: number;
}) {
  const strokeDashValue = 1500 * lineLength;

  if (!withAnimation) {
    return children;
  }

  return (
    <motion.g
      initial={{ strokeDashoffset: strokeDashValue }}
      animate={{ strokeDashoffset: 0 }}
      transition={{
        strokeDashoffset: { type: "spring", duration: 1.5, bounce: 0 },
      }}
      style={{ strokeDasharray: strokeDashValue }}
    >
      {children}
    </motion.g>
  );
}
