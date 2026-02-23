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
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ChartLibrarySelector } from "@/components/chart-library-selector";
import { PROMPT_EXAMPLES } from "@/lib/prompt-examples";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useFeatureCheck } from "@/hooks/use-feature-check";
import { getChartTypesByLibrary } from "@/lib/chart-registry";
import { cn } from "@/lib/utils";
import { useChatbotStore } from "@/stores/chatbot-store";
import { useSectionStore } from "@/stores/section-store";
import { useMutation } from "convex/react";
import { useChatContext } from "./chat-context";
import { ChatSettingsView } from "./chat-settings-view";
import { ErrorMessage } from "./error-message";
import { TypewriterText } from "./typewriter-text";

/** Parse structured output (message, chartType, title, data) from JSON text */
function parseStructuredOutput(text: string): {
  message?: string;
  chartType?: string;
  title?: string;
  data?: unknown;
} | null {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    /* partial/invalid JSON during streaming */
  }
  return null;
}

/** Extract plain text from a UIMessage's parts. For assistant: show only "message" from structured output. */
function getMessageText(msg: {
  role?: string;
  parts?: Array<{ type: string; text?: string }>;
}): string {
  if (!msg.parts) return "";
  const texts = msg.parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text!);
  const combined = texts.join("");
  if (msg.role === "assistant") {
    const structured = parseStructuredOutput(combined);
    if (structured?.message !== undefined) return String(structured.message);
    return ""; // During streaming or non-JSON: don't show raw JSON
  }
  return combined;
}

/** For user messages: show only the written text + file names, not the full attached data */
function getDisplayText(msg: {
  role?: string;
  parts?: Array<{ type: string; text?: string }>;
}): string {
  const raw = getMessageText(msg);
  if (!raw || msg.role !== "user") return raw;

  // Format: "user text\n\n---\n[Attached file: name]\ncontent..." or just file context
  const sep = "\n\n---\n";
  const idx = raw.indexOf(sep);
  if (idx === -1) return raw;

  const userPart = raw.slice(0, idx).trim();
  const fileSection = raw.slice(idx + sep.length);
  const fileNames: string[] = [];
  const fileRe = /\[Attached file: ([^\]]+)\]/g;
  const docRe = /\[Loaded document: ([^\]]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = fileRe.exec(fileSection)) !== null) {
    fileNames.push(m[1] ?? "");
  }
  while ((m = docRe.exec(fileSection)) !== null) {
    fileNames.push(m[1] ?? "");
  }

  if (fileNames.length === 0) return userPart || raw;
  const fileRef =
    fileNames.length === 1
      ? ` (${fileNames[0]})`
      : ` (+ ${fileNames.length} files: ${fileNames.slice(0, 3).join(", ")}${fileNames.length > 3 ? "…" : ""})`;
  return userPart ? `${userPart}${fileRef}` : `With context${fileRef}`;
}

/** Check if message has completed chart (structured output with chartType + data) */
function messageHasCompletedChart(msg: {
  role?: string;
  parts?: Array<{ type?: string; text?: string }>;
}): boolean {
  if (msg.role !== "assistant" || !msg.parts) return false;
  const combined = msg.parts
    .filter((p) => p?.type === "text" && p.text)
    .map((p) => p.text!)
    .join("");
  const structured = parseStructuredOutput(combined);
  return !!(structured?.chartType && structured.data !== undefined);
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
    setAttachedChartContext,
    effectiveChartContext,
    loadedDocuments,
    removeLoadedDocument,
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
  const chartFeedbackMap = useChatbotStore((s) => s.chartFeedbackMap);
  const setChartFeedbackStore = useChatbotStore((s) => s.setChartFeedback);
  const conversationId = useChatbotStore((s) => s.conversationId);
  const updateChartResultFeedback = useMutation(
    api.chat.updateChartResultFeedback,
  );
  const { canUse } = useFeatureCheck();
  const chatAllowed = canUse("chat");

  const isLoading = status === "submitted" || status === "streaming";
  const lastMsg = messages[messages.length - 1];
  const lastMsgHasChart =
    !isLoading &&
    lastMsg?.role === "assistant" &&
    messageHasCompletedChart(lastMsg);
  const hasParsing = attachedFiles.some((f) => f.parsing);
  const hasChartContext = !!effectiveChartContext;
  const hasLoadedDocs = loadedDocuments.length > 0;

  const [chartPopoverOpen, setChartPopoverOpen] = useState(false);

  const handleChartSelect = (key: string) => {
    toggleSelectedChartKey(key);
    setChartPopoverOpen(false);
  };

  // Auto-scroll to bottom on new messages and during streaming
  const lastMessageText = messages.length
    ? getMessageText(messages[messages.length - 1]!)
    : "";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status, lastMessageText]);

  const storedFeedback =
    lastMsgHasChart && lastMsg?.id ? chartFeedbackMap[lastMsg.id] : undefined;
  const currentFeedback =
    storedFeedback === "liked"
      ? "up"
      : storedFeedback === "disliked"
        ? "down"
        : null;

  const handleChartFeedback = (value: "up" | "down") => {
    if (!lastMsg?.id || !lastMsgHasChart) return;
    const feedback = value === "up" ? "liked" : "disliked";
    const next = storedFeedback === feedback ? null : feedback;
    setChartFeedbackStore(lastMsg.id, next);
    if (conversationId) {
      updateChartResultFeedback({
        conversationId:
          conversationId as import("@/convex/_generated/dataModel").Id<"chatConversations">,
        clientMessageId: lastMsg.id,
        feedback: next ?? "nofeedback",
      }).catch(() => {});
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#E9EEF0] text-sidebar-foreground">
      {/* Chat view — kept mounted when hidden to preserve state */}
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden",
          chatSidebarView !== "chat" && "hidden",
        )}
      >
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-5">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={540}
                  height={540}
                  className="size-32 rounded-full object-cover"
                />

                <p className="text-[13px] font-semibold text-sidebar-foreground">
                  EZ Charts AI
                </p>
                <p className="text-center text-[13px] leading-relaxed text-sidebar-foreground/50">
                  Ask me to create a chart, analyze data, or upload a file to
                  get started.
                </p>

                <div className="mt-2 flex w-full max-w-sm flex-wrap justify-center gap-2">
                  {PROMPT_EXAMPLES.slice(0, 4).map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setInput(prompt)}
                      className="rounded-xl border border-sidebar-border bg-white/80 px-3 py-2 text-left text-[11px] font-medium leading-snug text-sidebar-foreground/80 transition-colors hover:bg-[#BCBDEA]/20 hover:text-sidebar-foreground"
                    >
                      {prompt.length > 45 ? `${prompt.slice(0, 45)}…` : prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const text =
                msg.role === "user" ? getDisplayText(msg) : getMessageText(msg);

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
                          EZ Charts
                        </span>
                      </div>
                    </div>
                  )}

                  {msg.role === "user" && (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[13px] font-semibold text-sidebar-foreground">
                        User
                      </span>
                      <div className="flex size-5 items-center justify-center rounded-full bg-sidebar-foreground/10">
                        <span className="text-[9px] font-bold text-sidebar-foreground/60">
                          U
                        </span>
                      </div>
                    </div>
                  )}

                  {text && (
                    <p
                      className={cn(
                        "whitespace-pre-wrap text-[13px] leading-relaxed text-sidebar-foreground/80",
                        msg.role === "user" && "text-right",
                      )}
                    >
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
                    speed={20}
                    className="inline"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection("new");
                      if (
                        typeof window !== "undefined" &&
                        window.location.pathname !== "/"
                      )
                        router.push("/ezcharts");
                    }}
                    className="inline font-medium text-[#6C5DD3] underline-offset-2 hover:underline hover:text-[#5a4dbf]"
                  >
                    See it
                  </button>
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="mr-1 text-[11px] text-sidebar-foreground/50">
                    Rate our response
                  </span>
                  <button
                    type="button"
                    onClick={() => handleChartFeedback("up")}
                    className={cn(
                      "rounded-md p-1.5 transition-colors",
                      currentFeedback === "up"
                        ? "bg-[#6C5DD3]/20 text-[#6C5DD3]"
                        : "text-sidebar-foreground/50 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground/70",
                    )}
                    title="Good response"
                  >
                    <ThumbsUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChartFeedback("down")}
                    className={cn(
                      "rounded-md p-1.5 transition-colors",
                      currentFeedback === "down"
                        ? "bg-red-500/20 text-red-600"
                        : "text-sidebar-foreground/50 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground/70",
                    )}
                    title="Not what I wanted"
                  >
                    <ThumbsDown className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

            {isLoading &&
              (messages.length === 0 ||
                messages[messages.length - 1]?.role === "user" ||
                (messages[messages.length - 1]?.role === "assistant" &&
                  !getMessageText(messages[messages.length - 1]!))) && (
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
                        EZ Charts
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

          {/* Chart context chip — from explicit attach or current AI Builds selection */}
          {hasChartContext && effectiveChartContext && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              <div className="flex items-center gap-1.5 rounded-lg bg-[#BCBDEA]/15 px-2.5 py-1.5 text-[11px] text-sidebar-foreground/70">
                <BarChart3 className="size-3 shrink-0" />
                <span className="max-w-[140px] truncate">
                  {effectiveChartContext.fromHistory
                    ? `Editing: ${effectiveChartContext.title}`
                    : `Chart: ${effectiveChartContext.title}`}
                </span>
                {!effectiveChartContext.fromHistory && (
                  <button
                    type="button"
                    onClick={() => setAttachedChartContext(null)}
                    className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-sidebar-foreground/10"
                    title="Remove chart context"
                  >
                    <X className="size-2.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Loaded document chips */}
          {loadedDocuments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {loadedDocuments.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-1.5 rounded-lg bg-[#94B49F]/20 px-2.5 py-1.5 text-[11px] text-sidebar-foreground/80"
                >
                  <FileText className="size-3 shrink-0" />
                  <span className="max-w-[120px] truncate">{d.name}</span>
                  <button
                    type="button"
                    onClick={() => removeLoadedDocument(d.id)}
                    className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-sidebar-foreground/10"
                    title="Remove from chat context"
                  >
                    <X className="size-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

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
                      aria-label={`Remove ${af.name} from attachments`}
                      title={`Remove ${af.name} from attachments`}
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
                    attachedFiles.some((f) => f.parsedContent) ||
                    hasChartContext ||
                    hasLoadedDocs
                  ) {
                    handleSubmit();
                  }
                }
              }}
              placeholder={
                attachedFiles.length > 0 || hasLoadedDocs
                  ? "Describe what chart to create from the data…"
                  : "What would you like to create?"
              }
              rows={2}
              className="rounded-none min-h-[48px] max-h-32 min-w-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-0  text-[13px] leading-relaxed text-sidebar-foreground shadow-none placeholder:text-sidebar-foreground/40 focus-visible:ring-0"
            />

            <Button
              type="submit"
              size="icon-xs"
              aria-label="Send message"
              title={!chatAllowed.allowed ? chatAllowed.reason : "Send message"}
              disabled={
                isLoading ||
                hasParsing ||
                !chatAllowed.allowed ||
                (!input.trim() &&
                  !attachedFiles.some((f) => f.parsedContent) &&
                  !hasChartContext &&
                  !hasLoadedDocs)
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
          aria-label={
            chatSidebarView === "settings" ? "Back to chat" : "Chat settings"
          }
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
          aria-label="New chat"
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
                  ? (getChartTypesByLibrary()
                      .rosencharts.concat(getChartTypesByLibrary().shadcn)
                      .find((c) => c.key === selectedChartKey)?.label ??
                    "Charts")
                  : "Charts"}
                <ChevronDown className="size-2.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="top"
              className="w-auto max-w-[320px] p-0 rounded-2xl border-0 bg-white shadow-xl overflow-hidden"
            >
              <ChartLibrarySelector
                key={selectedChartKey ?? "none"}
                selectedChartKey={selectedChartKey}
                onSelect={handleChartSelect}
                className="h-[360px] w-[300px]"
              />
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
