"use client";

import { createContext, useContext, useCallback, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { AttachedChartContext } from "@/stores/chatbot-store";
import { useChatbotStore } from "@/stores/chatbot-store";
import { useChartsStore } from "@/stores/charts-store";

type UseChatReturn = ReturnType<typeof useChat>;

interface ChatContextValue {
  messages: UseChatReturn["messages"];
  status: UseChatReturn["status"];
  error: UseChatReturn["error"];
  sendMessage: UseChatReturn["sendMessage"];
  stop: UseChatReturn["stop"];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  startNewChat: () => void;
  attachedFiles: ReturnType<typeof useChatbotStore.getState>["attachedFiles"];
  addFiles: (files: FileList | File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  attachedChartContext: ReturnType<typeof useChatbotStore.getState>["attachedChartContext"];
  setAttachedChartContext: (ctx: AttachedChartContext | null) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export interface SerializedChatResult {
  clientMessageId?: string;
  chartType: string;
  chartTitle: string;
  chartData: unknown;
  feedback: "liked" | "disliked" | "nofeedback";
}

interface SerializedMessage {
  role: string;
  content: string;
  chartType?: string;
  chartTitle?: string;
  chartData?: unknown;
  feedback?: "liked" | "disliked";
}

/** Serialize a single message for Convex. Returns message + optional result for assistant+chart. */
function serializeMessage(
  msg: {
    id?: string;
    role?: string;
    parts?: Array<{
      type?: string;
      text?: string;
      state?: string;
      output?: unknown;
    }>;
  },
  feedbackMap: Record<string, "liked" | "disliked">,
): { message: SerializedMessage; result?: SerializedChatResult } {
  let content = "";
  let chartType: string | undefined;
  let chartTitle: string | undefined;
  let chartData: unknown;
  if (msg.parts) {
    for (const p of msg.parts) {
      if (p?.type === "text" && p.text) content += p.text;
      else if (
        p?.type === "tool-createChart" &&
        p?.state === "output-available" &&
        p?.output &&
        typeof p.output === "object" &&
        "chartType" in p.output &&
        "data" in p.output
      ) {
        const o = p.output as { chartType: string; title?: string; data: unknown };
        chartType = o.chartType;
        chartTitle = o.title ?? "Chart";
        chartData = o.data;
      }
    }
  }
  const feedback = msg.id ? feedbackMap[msg.id] : undefined;
  const message: SerializedMessage = {
    role: msg.role ?? "user",
    content: content.slice(0, 8000),
    ...(chartType && { chartType }),
    ...(chartTitle && { chartTitle }),
    ...(chartData !== undefined && { chartData }),
    ...(feedback && { feedback }),
  };
  const result: SerializedChatResult | undefined =
    msg.role === "assistant" && chartType && chartTitle !== undefined
      ? {
          clientMessageId: msg.id,
          chartType,
          chartTitle,
          chartData: chartData ?? [],
          feedback: feedback ?? "nofeedback",
        }
      : undefined;
  return { message, result };
}

function extractChartFromToolPart(
  part: { type?: string; state?: string; output?: unknown },
): { chartType: string; title: string; data: unknown } | null {
  if (
    part?.type === "tool-createChart" &&
    part?.state === "output-available" &&
    part?.output &&
    typeof part.output === "object" &&
    "chartType" in part.output &&
    "data" in part.output
  ) {
    const o = part.output as { chartType: string; title?: string; data: unknown };
    return {
      chartType: o.chartType,
      title: o.title ?? "Chart",
      data: o.data,
    };
  }
  return null;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const chat = useChat();
  const createConversationMutation = useMutation(api.chat.createConversation);
  const addMessageMutation = useMutation(api.chat.addMessage);
  const documentsCreate = useMutation(api.documents.create);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const {
    input,
    setInput,
    attachedFiles,
    addFiles,
    removeFile,
    clearFiles,
    attachedChartContext,
    setAttachedChartContext,
    selectedChartKey,
    chartFeedbackMap,
    conversationId,
    setConversationId,
    clearConversation,
    saveDocumentsOnDb,
  } = useChatbotStore();
  const addChartFromTool = useChartsStore((s) => s.addChartFromTool);
  const processedToolCalls = useRef<Set<string>>(new Set());
  const syncedMessageIds = useRef<Set<string>>(new Set());
  const syncInProgress = useRef(false);

  // Sync messages to Convex incrementally (create conversation at start, add each message)
  useEffect(() => {
    const { messages, status } = chat;
    if (messages.length === 0) {
      syncedMessageIds.current.clear();
      return;
    }
    const lastMsg = messages[messages.length - 1];
    const isStreaming = status === "streaming" || status === "submitted";
    const lastIncomplete =
      lastMsg?.role === "assistant" && isStreaming;

    const toSync: (typeof messages)[number][] = [];
    for (const msg of messages) {
      if (msg.role === "user" || msg.role === "assistant") {
        const isLast = msg === lastMsg;
        if (isLast && lastIncomplete) break;
        if (msg.id && !syncedMessageIds.current.has(msg.id)) {
          toSync.push(msg);
        }
      }
    }
    if (toSync.length === 0) return;
    if (syncInProgress.current) return;
    syncInProgress.current = true;

    let convId = conversationId;
    (async () => {
      try {
        for (const msg of toSync) {
          const { message, result } = serializeMessage(msg, chartFeedbackMap);
          if (message.content.trim().length === 0) continue;
          if (!convId) {
            const id = await createConversationMutation({});
            if (!id) return;
            convId = id as string;
            setConversationId(convId);
          }
          await addMessageMutation({
            conversationId: convId as import("@/convex/_generated/dataModel").Id<"chatConversations">,
            message,
            result: result ?? undefined,
          });
          if (msg.id) syncedMessageIds.current.add(msg.id);
        }
      } finally {
        syncInProgress.current = false;
      }
    })().catch(() => {
      syncInProgress.current = false;
    });
  }, [
    chat.messages,
    chat.status,
    conversationId,
    chartFeedbackMap,
    createConversationMutation,
    addMessageMutation,
    setConversationId,
  ]);

  // Extract createChart tool results and add to charts store
  useEffect(() => {
    for (const msg of chat.messages) {
      if (msg.role !== "assistant" || !msg.parts) continue;
      for (const part of msg.parts) {
        const p = part as { type?: string; state?: string; output?: unknown; toolCallId?: string };
        const toolCallId = p.toolCallId;
        if (!toolCallId || processedToolCalls.current.has(toolCallId)) continue;
        const chart = extractChartFromToolPart(p);
        if (chart) {
          processedToolCalls.current.add(toolCallId);
          addChartFromTool(chart as { chartType: import("@/components/rosencharts").ChartTypeKey; title: string; data: unknown });
        }
      }
    }
  }, [chat.messages, addChartFromTool]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = input.trim();
      const hasFiles = attachedFiles.some((f) => f.parsedContent);
      const hasChart = !!attachedChartContext;

      if (!trimmed && !hasFiles && !hasChart) return;

      let messageText = trimmed;

      const contextParts: string[] = [];
      const filesToSave = hasFiles
        ? attachedFiles.filter((f) => f.parsedContent)
        : [];
      if (hasFiles) {
        const fileParts = filesToSave.map(
          (f) => `[Attached file: ${f.name}]\n${f.parsedContent}`
        );
        contextParts.push(...fileParts);
      }
      if (hasChart) {
        const chartCtx = `[Attached chart: ${attachedChartContext.title}]\nChart type: ${attachedChartContext.chartType}\nData:\n${JSON.stringify(attachedChartContext.data, null, 2)}`;
        contextParts.push(chartCtx);
      }
      if (contextParts.length > 0) {
        const combined = contextParts.join("\n\n");
        messageText = messageText ? `${messageText}\n\n---\n${combined}` : combined;
      }

      // Auto-save attached files to Convex when Save documents on DB is enabled
      if (saveDocumentsOnDb && filesToSave.length > 0) {
        for (const af of filesToSave) {
          try {
            const uploadUrl = await generateUploadUrl();
            const res = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": af.file.type || "application/octet-stream" },
              body: af.file,
            });
            if (!res.ok) continue;
            const { storageId } = await res.json();
            await documentsCreate({
              name: af.name,
              size: af.file.size,
              mimeType: af.file.type || "application/octet-stream",
              content: af.parsedContent!,
              storageId,
            });
          } catch {
            // Ignore per-file errors; chat continues
          }
        }
      }

      const chartKey = selectedChartKey ?? (hasChart ? attachedChartContext!.chartType : undefined);
      chat.sendMessage(
        { text: messageText },
        chartKey ? { body: { selectedChartKey: chartKey } } : undefined,
      );
      setInput("");
      clearFiles();
      setAttachedChartContext(null);
    },
    [
      input,
      chat,
      attachedFiles,
      attachedChartContext,
      setInput,
      clearFiles,
      selectedChartKey,
      setAttachedChartContext,
      saveDocumentsOnDb,
      documentsCreate,
      generateUploadUrl,
    ],
  );

  const startNewChat = useCallback(() => {
    chat.setMessages([]);
    chat.clearError();
    clearConversation();
    setInput("");
    clearFiles();
    setAttachedChartContext(null);
    syncedMessageIds.current.clear();
  }, [chat, clearConversation, setInput, clearFiles, setAttachedChartContext]);

  return (
    <ChatContext.Provider
      value={{
        messages: chat.messages,
        status: chat.status,
        error: chat.error,
        sendMessage: chat.sendMessage,
        stop: chat.stop,
        input,
        setInput,
        handleSubmit,
        startNewChat,
        attachedFiles,
        addFiles,
        removeFile,
        clearFiles,
        attachedChartContext,
        setAttachedChartContext,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}
