"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BarChart3,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  Settings,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

import { useChatbotStore } from "@/stores/chatbot-store";
import { useSectionStore } from "@/stores/section-store";
import { useChatContext } from "./chat-context";
import { TypewriterText } from "./typewriter-text";
import { chartTypes } from "@/components/rosencharts";
import type { ChartTypeKey } from "@/components/rosencharts";
import { ErrorMessage } from "./error-message";
import { ChatSettingsView } from "./chat-settings-view";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** Extract plain text from a UIMessage's parts array */
function getMessageText(msg: {
  parts?: Array<{ type: string; text?: string }>;
}): string {
  if (!msg.parts) return "";
  return msg.parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");
}

/** Check if message has a completed createChart tool result */
function messageHasCompletedChart(msg: {
  role?: string;
  parts?: Array<{ type?: string; state?: string; output?: unknown }>;
}): boolean {
  if (msg.role !== "assistant" || !msg.parts) return false;
  return msg.parts.some(
    (p) =>
      p?.type === "tool-createChart" &&
      p?.state === "output-available" &&
      p?.output &&
      typeof p.output === "object" &&
      "chartType" in p.output &&
      "data" in p.output,
  );
}

const ACCEPTED_FILE_TYPES =
  ".csv,.xlsx,.xls,.pdf,.json,.txt,.tsv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf,application/json,text/plain,text/tab-separated-values";

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "xls" || ext === "csv" || ext === "tsv")
    return FileSpreadsheet;
  return FileText;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Inner content reused by both the desktop sidebar and the mobile drawer */
export function ChatSidebarContent() {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    startNewChat,
    status,
    error,
    attachedFiles,
    addFiles,
    removeFile,
  } = useChatContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    selectedChartKey,
    toggleSelectedChartKey,
    chatSidebarView,
    toggleChatSidebarView,
  } = useChatbotStore();
  const setActiveSection = useSectionStore((s) => s.setActiveSection);
  const router = useRouter();

  const isLoading = status === "submitted" || status === "streaming";
  const lastMsg = messages[messages.length - 1];
  const lastMsgHasChart =
    !isLoading &&
    lastMsg?.role === "assistant" &&
    messageHasCompletedChart(lastMsg);
  const hasParsing = attachedFiles.some((f) => f.parsing);

  const [chartPopoverOpen, setChartPopoverOpen] = useState(false);

  const toggleChartSelection = (key: ChartTypeKey) => {
    toggleSelectedChartKey(key);
    setChartPopoverOpen(false);
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  return (
    <div className="flex h-full w-full flex-col bg-[#E9EEF0] text-sidebar-foreground">
      {/* Chat view — kept mounted when hidden to preserve state */}
      <div
        ref={scrollRef}
        className={cn(
          "flex flex-1 flex-col overflow-hidden",
          chatSidebarView !== "chat" && "hidden",
        )}
      >
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-5">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={540}
                  height={540}
                  className="size-40 rounded-full object-cover"
                />

                <p className="text-[13px] font-semibold text-sidebar-foreground">
                  EZ Charts AI
                </p>
                <p className="text-center text-[13px] leading-relaxed text-sidebar-foreground/50">
                  Ask me to create a chart, analyze data, or upload a file to
                  get started.
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const text = getMessageText(msg);

              return (
                <div key={msg.id} className="space-y-2">
                  {msg.role === "assistant" && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/logo.png"
                          alt="Logo"
                          width={20}
                          height={20}
                          className="size-5 rounded-full object-cover"
                        />
                        <span className="text-[13px] font-semibold text-sidebar-foreground">
                          Ez Charts
                        </span>
                      </div>
                    </div>
                  )}

                  {msg.role === "user" && (
                    <div className="flex items-center gap-2">
                      <div className="flex size-5 items-center justify-center rounded-full bg-sidebar-foreground/10">
                        <span className="text-[9px] font-bold text-sidebar-foreground/60">
                          You
                        </span>
                      </div>
                      <span className="text-[13px] font-semibold text-sidebar-foreground">
                        You
                      </span>
                    </div>
                  )}

                  {text && (
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-sidebar-foreground/80">
                      {text}
                    </p>
                  )}
                </div>
              );
            })}

            {lastMsgHasChart && (
              <div className="rounded-xl bg-[#BCBDEA]/15 px-3 py-2.5 ring-1 ring-[#6C5DD3]/20">
                <p className="text-[13px] leading-relaxed text-sidebar-foreground/90">
                  <TypewriterText
                    text="Chart created! Check it out in the AI Builds tab — "
                    speed={30}
                    className="inline"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection("new");
                      if (typeof window !== "undefined" && window.location.pathname !== "/")
                        router.push("/");
                    }}
                    className="inline font-medium text-[#6C5DD3] underline-offset-2 hover:underline hover:text-[#5a4dbf]"
                  >
                    See it
                  </button>
                </p>
              </div>
            )}

            {isLoading &&
              (messages.length === 0 ||
                messages[messages.length - 1]?.role === "user") && (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/logo.png"
                        alt="Logo"
                        width={20}
                        height={20}
                        className="size-5 rounded-full object-cover"
                      />
                      <span className="text-[13px] font-semibold text-sidebar-foreground">
                        Ez Charts
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-3 animate-spin text-sidebar-foreground/40" />
                    <span className="text-[12px] text-sidebar-foreground/40">
                      Thinking…
                    </span>
                  </div>
                </div>
              )}

            {error && <ErrorMessage error={error} />}
          </div>
        </div>

        <div className="border-t border-sidebar-border px-4 py-3">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_FILE_TYPES}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                addFiles(e.target.files);
              }
              // Reset so same file can be re-added
              e.target.value = "";
            }}
          />

          {/* Attached file chips */}
          {attachedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {attachedFiles.map((af, idx) => {
                const Icon = getFileIcon(af.name);
                return (
                  <div
                    key={`${af.name}-${idx}`}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] ${
                      af.error
                        ? "border border-red-200 bg-red-50 text-red-600"
                        : af.parsing
                          ? "bg-sidebar-foreground/5 text-sidebar-foreground/50"
                          : "bg-[#BCBDEA]/15 text-sidebar-foreground/70"
                    }`}
                  >
                    {af.parsing ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Icon className="size-3 shrink-0" />
                    )}
                    <span className="max-w-[120px] truncate">{af.name}</span>
                    <span className="text-[10px] opacity-60">
                      {formatFileSize(af.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-sidebar-foreground/10"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 rounded-sm border border-sidebar-border bg-white/80 px-3 pb-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (
                    input.trim() ||
                    attachedFiles.some((f) => f.parsedContent)
                  ) {
                    handleSubmit();
                  }
                }
              }}
              placeholder={
                attachedFiles.length > 0
                  ? "Describe what chart to create from the data…"
                  : "What would you like to create?"
              }
              rows={2}
              className="rounded-none min-h-[48px] max-h-32 min-w-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-0  text-[13px] leading-relaxed text-sidebar-foreground shadow-none placeholder:text-sidebar-foreground/40 focus-visible:ring-0"
            />

            <Button
              type="submit"
              size="icon-xs"
              disabled={
                isLoading ||
                hasParsing ||
                (!input.trim() && !attachedFiles.some((f) => f.parsedContent))
              }
              className="shrink-0 rounded-full bg-[#BCBDEA] text-white hover:bg-[#A098E5] disabled:opacity-50"
            >
              <Send className="size-3" />
            </Button>
          </form>
        </div>
      </div>

      {/* Settings view — kept mounted when hidden to preserve state */}
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden",
          chatSidebarView !== "settings" && "hidden",
        )}
      >
        <ChatSettingsView />
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-sidebar-border px-4 py-2.5">
        <Button
          variant="ghost"
          size="icon-xs"
          type="button"
          onClick={toggleChatSidebarView}
          title={
            chatSidebarView === "settings" ? "Back to chat" : "Chat settings"
          }
          className={cn(
            "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            chatSidebarView === "settings" && "bg-[#BCBDEA]/20 text-[#6C5DD3]",
          )}
        >
          {chatSidebarView === "settings" ? (
            <MessageSquare className="size-4" />
          ) : (
            <Settings className="size-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          type="button"
          onClick={startNewChat}
          title="New chat"
          className="text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Plus className="size-4" />
        </Button>

        <div className="ml-1 flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1 rounded-lg text-[12px] text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Paperclip className="size-3" />
            Add Files
          </Button>
          {/* <Button
            variant="ghost"
            size="xs"
            className="gap-1 rounded-lg text-[12px] text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <MessageCircle className="size-3" />
            Discuss
          </Button> */}

          <Popover open={chartPopoverOpen} onOpenChange={setChartPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                className="gap-1 rounded-lg text-[12px] text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <BarChart3 className="size-3" />
                {selectedChartKey
                  ? (chartTypes.find((c) => c.key === selectedChartKey)
                      ?.label ?? "Charts")
                  : "Charts"}
                <ChevronDown className="size-2.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="top"
              className="flex w-52 flex-col gap-1.5 rounded-2xl border-0 bg-white p-2 shadow-xl"
            >
              {chartTypes.map(({ key, label, icon: Icon }) => {
                const isSelected = selectedChartKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleChartSelection(key)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors hover:bg-[#BCBDEA]/20 hover:text-sidebar-foreground ${
                      isSelected
                        ? "bg-[#BCBDEA]/20 text-sidebar-foreground"
                        : "text-sidebar-foreground/70"
                    }`}
                  >
                    <Icon className="size-3.5 shrink-0" strokeWidth={1.7} />
                    <span className="min-w-0 flex-1 truncate text-left">
                      {label}
                    </span>
                    {isSelected && (
                      <Check className="size-3.5 shrink-0 text-[#6C5DD3]" />
                    )}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

/** Desktop sidebar — hidden on mobile */
export function ChatSidebar() {
  return (
    <aside className="hidden h-full shrink-0 lg:flex lg:w-[320px] lg:min-w-[320px] xl:w-[360px] xl:min-w-[360px] 2xl:w-[386px] 2xl:min-w-[386px]">
      <ChatSidebarContent />
    </aside>
  );
}
