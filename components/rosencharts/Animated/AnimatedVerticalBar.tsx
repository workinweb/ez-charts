"use client";
import React from "react";

import { motion } from "motion/react";

export function AnimatedVerticalBar({
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
        initial={{ transform: "translateY(200%)" }}
        animate={{ transform: "translateY(0)" }}
        className={`absolute ${className}`}
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
      initial={{ transform: "translateY(200%)" }}
      animate={{ transform: "translateY(0)" }}
      className={`absolute ${className}`}
      transition={{
        duration: 0.5,
        ease: "easeOut",
        delay: index * 0.075,
      }}
      style={style}
    />
  );
}
