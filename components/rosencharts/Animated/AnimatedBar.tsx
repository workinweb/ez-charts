"use client";
import React from "react";

import { motion } from "motion/react";

export function AnimatedBar({
  index = 0,
  withAnimation = true,
  className,
  style,
  children,
}: {
  index?: number;
  withAnimation?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  if (!withAnimation) {
    if (children) {
      return (
        <div className={`${className}`} style={style}>
          {children}
        </div>
      );
    }

    return <div className={`${className}`} style={style} />;
  }

  if (children) {
    return (
      <motion.div
        initial={{ transform: "translateX(-200%)" }}
        animate={{ transform: "translateX(0)" }}
        className={`absolute inset-0 ${className}`}
        transition={{
          duration: 0.5,
          ease: "easeOut",
          delay: index * 0.075,
        }}
        style={style}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ transform: "translateX(-200%)" }}
      animate={{ transform: "translateX(0)" }}
      className={`absolute inset-0 ${className}`}
      transition={{
        duration: 0.5,
        ease: "easeOut",
        delay: index * 0.075,
      }}
      style={style}
    />
  );
}
