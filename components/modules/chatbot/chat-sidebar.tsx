"use client";

import {
  Settings,
  Plus,
  PenLine,
  MessageCircle,
  Send,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  thinking?: string;
  content: React.ReactNode;
  timestamp?: string;
  revertable?: boolean;
}

const messages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    timestamp: "3 minutes ago",
    revertable: true,
    content: (
      <p className="text-[13px] leading-relaxed text-sidebar-foreground/80">
        Recent transactions should be easy to review so the system feels
        accurate and current. Overall, this should feel like a calm,
        professional tool that supports day-to-day decisions rather than a
        complex financial system.
      </p>
    ),
  },
  {
    id: "2",
    role: "assistant",
    thinking: "Thought for 3s",
    timestamp: "a few seconds ago",
    content: (
      <div className="space-y-3">
        <p className="text-[13px] leading-relaxed text-sidebar-foreground/80">
          Looking at this comprehensive request, I&apos;ll plan out the app:
        </p>
        <div className="space-y-1">
          <p className="text-[13px] font-semibold text-sidebar-foreground">
            Planning
          </p>
          <p className="text-[13px] font-medium text-sidebar-foreground">
            Key Features:
          </p>
          <ol className="ml-4 list-decimal space-y-1.5 text-[13px] leading-relaxed text-sidebar-foreground/80">
            <li>
              <span className="font-medium text-sidebar-foreground">
                Dashboard
              </span>{" "}
              - Hero progress bar, daily spending overview, quick stats
            </li>
            <li>
              <span className="font-medium text-sidebar-foreground">
                Expense Tracker
              </span>{" "}
              - Log expenses with categories, pie chart breakdown, recent
              transactions
            </li>
            <li>
              <span className="font-medium text-sidebar-foreground">
                Budget Planner
              </span>{" "}
              - Set monthly budgets per category, progress bars, alerts
            </li>
            <li>
              <span className="font-medium text-sidebar-foreground">
                Savings Goals
              </span>{" "}
              - Create goals, track progress with visual gauges, milestones
            </li>
          </ol>
        </div>
        <p className="text-[13px] leading-relaxed text-sidebar-foreground/80">
          Let me build this elegant finance app:
        </p>
        <div className="space-y-2">
          <WriteBadge label="entities/Expenses" />
          <WriteBadge label="entities/Budget" />
          <WriteBadge label="entities/Saving goals" />
        </div>
      </div>
    ),
  },
];

function WriteBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-5 items-center justify-center rounded-md bg-sidebar-accent">
        <PenLine className="size-3 text-sidebar-foreground/60" />
      </div>
      <span className="text-[13px] text-sidebar-foreground/70">Wrote</span>
      <Badge
        variant="outline"
        className="rounded-lg border-sidebar-border bg-sidebar-accent px-2 py-0.5 text-[11px] font-medium text-sidebar-foreground/80"
      >
        {label}
      </Badge>
    </div>
  );
}

export function ChatSidebar() {
  return (
    <aside className="flex h-full w-[386px] shrink-0 flex-col bg-[#E9EEF0] text-sidebar-foreground">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-5">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              {msg.role === "assistant" && msg.id === "2" && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600">
                      <Sparkles className="size-3 text-white" />
                    </div>
                    <span className="text-[13px] font-semibold text-sidebar-foreground">
                      Base44
                    </span>
                  </div>
                  {msg.thinking && (
                    <button className="flex items-center gap-1 text-[12px] text-sidebar-foreground/50">
                      <ChevronDown className="size-3" />
                      {msg.thinking}
                    </button>
                  )}
                </div>
              )}

              {msg.content}

              <div className="flex items-center gap-3">
                {msg.timestamp && (
                  <span className="text-[11px] text-sidebar-foreground/40">
                    {msg.timestamp}
                  </span>
                )}
                {msg.revertable && (
                  <button className="rounded-lg border border-sidebar-border px-2 py-0.5 text-[11px] text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent">
                    Revert this
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2 rounded-2xl border border-sidebar-border bg-white/80 px-3 py-2.5">
          <input
            type="text"
            placeholder="What would you like to change?"
            className="flex-1 bg-transparent text-[13px] text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:outline-none"
          />
          <Button
            size="icon-xs"
            className="rounded-full bg-[#BCBDEA] text-white hover:bg-[#A098E5]"
          >
            <Send className="size-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-sidebar-border px-4 py-2.5">
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Settings className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Plus className="size-4" />
        </Button>

        <div className="ml-1 flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            className="gap-1 rounded-lg text-[12px] text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <PenLine className="size-3" />
            Visual edit
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="gap-1 rounded-lg text-[12px] text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <MessageCircle className="size-3" />
            Discuss
          </Button>
        </div>
      </div>
    </aside>
  );
}
