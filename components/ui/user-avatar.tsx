"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/(auth)/auth-client";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  className?: string;
  size?: "sm" | "default" | "lg";
};

const sizeClasses = {
  sm: "size-5",
  default: "size-8",
  lg: "size-14",
};

const fallbackSizeClasses = {
  sm: "text-[8px]",
  default: "text-sm",
  lg: "text-[20px]",
};

/** Shared user avatar: uses session user image when available (e.g. Google), else first letter fallback. */
export function UserAvatar({ className, size = "default" }: UserAvatarProps) {
  const { data: session } = authClient.useSession();
  const image = session?.user?.image;
  const name = session?.user?.name ?? "?";
  const initial = name.charAt(0).toUpperCase();

  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        size === "lg" ? "rounded-2xl" : "rounded-full",
        className,
      )}
    >
      {image && <AvatarImage src={image} alt={name} />}
      <AvatarFallback
        className={cn(
          "font-bold text-white bg-gradient-to-br from-[#BCBDEA] to-[#6C5DD3]",
          size === "lg" ? "rounded-2xl" : "rounded-full",
          fallbackSizeClasses[size],
        )}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
