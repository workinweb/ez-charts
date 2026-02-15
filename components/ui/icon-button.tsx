"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface IconButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "children"> {
  /** Accessible label (used for aria-label and tooltip) */
  label: string;
  icon: React.ReactNode;
  /** Optional tooltip content if different from label */
  tooltip?: string;
}

/**
 * Icon-only button with accessible tooltip.
 * Uses aria-label for screen readers and Radix Tooltip for hover/focus.
 */
export function IconButton({
  label,
  icon,
  tooltip,
  ...buttonProps
}: IconButtonProps) {
  const tooltipText = tooltip ?? label;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...buttonProps} aria-label={label} title={label}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}
