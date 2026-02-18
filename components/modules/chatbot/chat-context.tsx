"use client";

import { createContext, useContext, useCallback, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { generateChartImageUrl } from "@/lib/chart-image-utils";
import type {
  AttachedChartContext,
  LoadedDocument,
} from "@/stores/chatbot-store";
import { useChatbotStore } from "@/stores/chatbot-store";
import { useChartsStore } from "@/stores/charts-store";
import { fromChartKey } from "@/lib/chart-keys";

type UseChatReturn = ReturnType<typeof useChat>;

/** Chart context that will be sent with the next message — from explicit attach or current AI Builds selection */
export interface EffectiveChartContext extends AttachedChartContext {
  /** True when from AI Builds history (no explicit attach) */
  fromHistory?: boolean;
}

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
  /** Chart that will be sent with next message (explicit attach or current from AI Builds) */
  effectiveChartContext: EffectiveChartContext | null;
  loadedDocuments: LoadedDocument[];
  addLoadedDocument: (doc: LoadedDocument) => void;
  removeLoadedDocument: (id: string) => void;
  clearLoadedDocuments: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export interface SerializedChatResult {
  clientMessageId?: string;
  chartLibrary: "shadcn" | "rosencharts";
  chartType: string;
  chartTitle: string;
  chartData: unknown;
  feedback: "liked" | "disliked" | "nofeedback";
}

interface TokenUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

interface SerializedMessage {
  role: string;
  content: string;
  chartType?: string;
  chartTitle?: string;
  chartData?: unknown;
  feedback?: "liked" | "disliked";
  tokenUsage?: TokenUsage;
}

/** Parse structured output from text (JSON with message, chartType, title, data) */
function parseStructuredOutput(
  text: string,
): { message?: string; chartType?: string; title?: string; data?: unknown } | null {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    /* partial/invalid JSON during streaming */
  }
  return null;
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
    metadata?: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
    };
  },
  feedbackMap: Record<string, "liked" | "disliked">,
): { message: SerializedMessage; result?: SerializedChatResult } {
  let content = "";
  let chartType: string | undefined;
  let chartTitle: string | undefined;
  let chartData: unknown;
  if (msg.parts) {
    const combinedText = msg.parts
      .filter((p) => p?.type === "text" && p.text)
      .map((p) => p.text as string)
      .join("");
    const structured = parseStructuredOutput(combinedText);
    if (structured) {
      content = (structured.message as string) ?? "";
      if (structured.chartType && structured.data !== undefined) {
        chartType = structured.chartType;
        chartTitle = (structured.title as string) ?? "Chart";
        chartData = structured.data;
      }
    } else {
      content = combinedText;
    }
  }
  const feedback = msg.id ? feedbackMap[msg.id] : undefined;
  const hasTokenUsage =
    msg.metadata &&
    (msg.metadata.totalTokens != null ||
      msg.metadata.inputTokens != null ||
      msg.metadata.outputTokens != null);
  const tokenUsage: TokenUsage | undefined = hasTokenUsage
    ? {
        inputTokens: msg.metadata!.inputTokens,
        outputTokens: msg.metadata!.outputTokens,
        totalTokens: msg.metadata!.totalTokens,
      }
    : undefined;

  const message: SerializedMessage = {
    role: msg.role ?? "user",
    content: content.slice(0, 8000),
    ...(chartType && { chartType }),
    ...(chartTitle && { chartTitle }),
    ...(chartData !== undefined && { chartData }),
    ...(feedback && { feedback }),
    ...(tokenUsage && { tokenUsage }),
  };
  const result: SerializedChatResult | undefined =
    msg.role === "assistant" && chartType && chartTitle !== undefined
      ? (() => {
          const { chartLibrary, chartType: type } = fromChartKey(chartType);
          return {
            clientMessageId: msg.id,
            chartLibrary,
            chartType: type,
            chartTitle,
            chartData: chartData ?? [],
            feedback: feedback ?? "nofeedback",
          };
        })()
      : undefined;
  return { message, result };
}

/** Process chart data: inject image/logo URLs for image-style charts */
function processChartData(
  chartType: string,
  data: unknown,
): Array<Record<string, unknown>> {
  let processed = (data as Array<Record<string, unknown>>) ?? [];
  if (chartType === "horizontal-bar-image") {
    processed = processed.map((item) => {
      const key = (item.key as string) ?? (item.name as string) ?? "";
      return {
        ...item,
        image: (item.image as string) ?? generateChartImageUrl(key),
      };
    });
  } else if (chartType === "pie-image") {
    processed = processed.map((item) => {
      const name = (item.name as string) ?? (item.key as string) ?? "";
      return {
        ...item,
        logo: (item.logo as string) ?? generateChartImageUrl(name),
      };
    });
  }
  return processed;
}

/** Extract chart from structured output in a message */
function extractChartFromMessage(msg: {
  parts?: Array<{ type?: string; text?: string }>;
}): { chartType: string; title: string; data: unknown } | null {
  if (!msg.parts) return null;
  const combinedText = msg.parts
    .filter((p) => p?.type === "text" && p.text)
    .map((p) => p.text as string)
    .join("");
  const structured = parseStructuredOutput(combinedText);
  if (structured?.chartType && structured.data !== undefined) {
    const processedData = processChartData(
      structured.chartType,
      structured.data,
    );
    return {
      chartType: structured.chartType,
      title: (structured.title as string) ?? "Chart",
      data: processedData,
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
    markFileSavedToDb,
    attachedChartContext,
    setAttachedChartContext,
    loadedDocuments,
    addLoadedDocument,
    removeLoadedDocument,
    clearLoadedDocuments,
    selectedChartKey,
    chartFeedbackMap,
    conversationId,
    setConversationId,
    clearConversation,
    saveDocumentsOnDb,
  } = useChatbotStore();
  const addChartFromTool = useChartsStore((s) => s.addChartFromTool);
  const previewChartId = useChartsStore((s) => s.previewChartId);
  const unsavedCharts = useChartsStore((s) => s.unsavedCharts);
  const processedMessageIds = useRef<Set<string>>(new Set());

  /** Current chart from AI Builds history — the one user has selected (or latest). Used when no explicit attachedChartContext. */
  const currentChartFromHistory =
    previewChartId
      ? unsavedCharts.find((c) => c.id === previewChartId)
      : unsavedCharts[unsavedCharts.length - 1] ?? null;
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

  // Extract chart from structured output (streamText with Output.object) and add to charts store
  useEffect(() => {
    for (const msg of chat.messages) {
      if (msg.role !== "assistant" || !msg.id) continue;
      if (processedMessageIds.current.has(msg.id)) continue;
      const chart = extractChartFromMessage(msg);
      if (chart) {
        processedMessageIds.current.add(msg.id);
        addChartFromTool(chart);
      }
    }
  }, [chat.messages, addChartFromTool]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = input.trim();
      const hasFiles = attachedFiles.some((f) => f.parsedContent);
      const chartContext = attachedChartContext ?? (currentChartFromHistory
        ? { title: currentChartFromHistory.title, chartType: currentChartFromHistory.chartType, data: currentChartFromHistory.data }
        : null);
      const hasChart = !!chartContext;
      const hasLoadedDocs = loadedDocuments.length > 0;

      if (!trimmed && !hasFiles && !hasChart && !hasLoadedDocs) return;

      let messageText = trimmed;

      const contextParts: string[] = [];
      const filesToSave = hasFiles
        ? attachedFiles.filter((f) => f.parsedContent && !f.savedToDb)
        : [];
      if (hasFiles) {
        const fileParts = attachedFiles
          .filter((f) => f.parsedContent)
          .map((f) => `[Attached file: ${f.name}]\n${f.parsedContent}`);
        contextParts.push(...fileParts);
      }
      if (hasLoadedDocs) {
        const docParts = loadedDocuments.map(
          (d) => `[Loaded document: ${d.name}]\n${d.content}`
        );
        contextParts.push(...docParts);
      }
      if (hasChart && chartContext) {
        const chartCtx = `[Attached chart: ${chartContext.title}]\nChart type: ${chartContext.chartType}\nData:\n${JSON.stringify(chartContext.data, null, 2)}`;
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
            markFileSavedToDb(af.file);
          } catch {
            // Ignore per-file errors; chat continues
          }
        }
      }

      const chartKey = selectedChartKey ?? (hasChart ? chartContext!.chartType : undefined);
      chat.sendMessage(
        { text: messageText },
        chartKey ? { body: { selectedChartKey: chartKey } } : undefined,
      );
      setInput("");
      setAttachedChartContext(null);
      // Keep attachedFiles and loadedDocuments for subsequent messages; only clear when user removes or starts new chat
    },
    [
      input,
      chat,
      attachedFiles,
      attachedChartContext,
      currentChartFromHistory,
      loadedDocuments,
      setInput,
      selectedChartKey,
      setAttachedChartContext,
      saveDocumentsOnDb,
      documentsCreate,
      generateUploadUrl,
      markFileSavedToDb,
    ],
  );

  const startNewChat = useCallback(() => {
    chat.setMessages([]);
    chat.clearError();
    clearConversation();
    clearLoadedDocuments();
    setInput("");
    clearFiles();
    setAttachedChartContext(null);
    syncedMessageIds.current.clear();
    processedMessageIds.current.clear();
  }, [chat, clearConversation, clearLoadedDocuments, setInput, clearFiles, setAttachedChartContext]);

  const effectiveChartContext: EffectiveChartContext | null = (() => {
    const ctx = attachedChartContext ?? (currentChartFromHistory
      ? { title: currentChartFromHistory.title, chartType: currentChartFromHistory.chartType, data: currentChartFromHistory.data }
      : null);
    if (!ctx) return null;
    return {
      ...ctx,
      fromHistory: !attachedChartContext && !!currentChartFromHistory,
    };
  })();

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
        effectiveChartContext,
        loadedDocuments,
        addLoadedDocument,
        removeLoadedDocument,
        clearLoadedDocuments,
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
