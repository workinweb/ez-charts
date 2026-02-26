"use client";

import { LandingNavbar } from "@/components/landing/sections/navbar-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  CATEGORY_LABELS,
  OPINION_CATEGORIES,
  type OpinionCategory,
} from "@/convex/opinions/opinions";
import { usePagination } from "@/hooks/use-pagination";
import { authClient } from "@/lib/(auth)/auth-client";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { Loader2, MessageSquare, Plus, Search, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const LEGACY_CATEGORY_LABELS: Record<string, string> = {
  feature: "New idea or suggestion",
  bug: "Something isn't working",
  ui: "Looks and layout",
  general: "General feedback",
};

function getCategoryDisplay(category: string, categoryCustom?: string): string {
  if (category === "other" && categoryCustom?.trim()) {
    return categoryCustom.trim();
  }
  return (
    CATEGORY_LABELS[category as OpinionCategory] ??
    LEGACY_CATEGORY_LABELS[category] ??
    category
  );
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function OpinionCard({
  id,
  userId,
  userName,
  userImage,
  content,
  category,
  categoryCustom,
  upvoteCount,
  createdAt,
  isUpvoted,
  onUpvote,
  isUpvoting,
}: {
  id: Id<"opinions">;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  category: string;
  categoryCustom?: string;
  upvoteCount: number;
  createdAt: number;
  isUpvoted: boolean;
  onUpvote: () => void;
  isUpvoting: boolean;
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-[#E0E0E0]/80 bg-white p-4 transition-shadow sm:p-5",
        "hover:shadow-md hover:shadow-black/5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={userImage} alt="" />
            <AvatarFallback className="bg-[#BCBDEA]/30 text-[13px] font-medium text-[#3D4035]">
              {userName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-[#3D4035]">
              {userName}
            </p>
            <div className="flex items-center gap-2 text-[12px] text-[#3D4035]/50">
              <span>{formatDate(createdAt)}</span>
              <span>•</span>
              <span>{getCategoryDisplay(category, categoryCustom)}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUpvote}
            disabled={isUpvoting}
            className={cn(
              "gap-1.5 rounded-xl h-8 px-3 text-[13px] font-medium",
              isUpvoted
                ? "bg-[#6C5DD3]/10 text-[#6C5DD3] hover:bg-[#6C5DD3]/20"
                : "text-[#3D4035]/60 hover:bg-[#E9EEF0]/60 hover:text-[#3D4035]",
            )}
          >
            {isUpvoting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ThumbsUp
                className={cn("size-3.5", isUpvoted && "fill-current")}
              />
            )}
            <span>{upvoteCount}</span>
          </Button>
        </div>
      </div>
      <p className="line-clamp-4 text-[14px] text-[#3D4035]/90 leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </p>
    </article>
  );
}

export default function OpinionsPage() {
  const { data: session } = authClient.useSession();
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<"newest" | "top">("newest");
  const [category, setCategory] = useState<OpinionCategory | "all">("all");
  const [upvotingId, setUpvotingId] = useState<Id<"opinions"> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState<OpinionCategory>("feedback");
  const [formCategoryCustom, setFormCategoryCustom] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [formError, setFormError] = useState("");

  const opinions = useQuery(api.opinions.opinions.list, {
    category: category === "all" ? undefined : category,
    limit: 150,
    orderBy,
  });
  const myUpvotes = useQuery(
    api.opinions.opinions.listMyUpvotes,
    session?.user ? {} : "skip",
  );
  const toggleUpvote = useMutation(api.opinions.opinions.toggleUpvote);

  const filtered = useMemo(() => {
    if (!opinions) return [];
    if (!search.trim()) return opinions;
    const q = search.toLowerCase().trim();
    return opinions.filter(
      (o) =>
        o.content.toLowerCase().includes(q) ||
        o.userName.toLowerCase().includes(q) ||
        (o.categoryCustom?.toLowerCase().includes(q) ?? false),
    );
  }, [opinions, search]);

  const { paginatedItems, page, setPage, totalPages } = usePagination(
    filtered,
    12,
  );

  const handleUpvote = async (id: Id<"opinions">) => {
    if (!session?.user) return;
    setUpvotingId(id);
    try {
      await toggleUpvote({ opinionId: id });
    } finally {
      setUpvotingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    setFormStatus("loading");
    setFormError("");
    try {
      const res = await fetch("/api/opinions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: formContent.trim(),
          category: formCategory,
          categoryCustom:
            formCategory === "other" ? formCategoryCustom.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to submit.");
      }
      setFormContent("");
      setFormCategory("feedback");
      setFormCategoryCustom("");
      setDialogOpen(false);
      setFormStatus("idle");
    } catch (err) {
      setFormStatus("error");
      setFormError(err instanceof Error ? err.message : "Failed to submit.");
    }
  };

  const isUpvoted = (id: Id<"opinions">) => myUpvotes?.includes(id) ?? false;

  return (
    <div className="min-h-screen bg-[#F2F4F7] text-[#1A1A1A] antialiased">
      <LandingNavbar />

      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Compact header + CTA */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[22px] font-semibold text-[#3D4035]">
                Opinions & Feedback
              </h1>
              <p className="mt-1 text-[14px] text-[#3D4035]/60">
                Share ideas and upvote what matters.
              </p>
            </div>
            {session?.user ? (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 rounded-xl bg-[#6C5DD3] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#5a4dbf]">
                    <Plus className="size-4" />
                    New feedback
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="max-h-[90dvh] gap-0 overflow-y-auto overflow-x-hidden rounded-3xl border-0 bg-gradient-to-b from-white to-[#F8F7FF] p-0 shadow-2xl shadow-[#6C5DD3]/10 ring-1 ring-[#6C5DD3]/10"
                  style={{ maxWidth: "min(896px, 90vw)" }}
                >
                  <div className="px-10 pt-10 pb-8">
                    <DialogHeader>
                      <DialogTitle className="text-[24px] font-semibold text-[#3D4035]">
                        Share your feedback
                      </DialogTitle>
                      <DialogDescription className="mt-3 text-[15px] text-[#3D4035]/70 leading-relaxed">
                        Suggest a feature, report a bug, or share your thoughts.
                        Your voice helps shape EZ Charts.
                      </DialogDescription>
                      <p className="mt-4 flex items-center gap-2 rounded-xl bg-[#6C5DD3]/8 px-4 py-2.5 text-[13px] font-medium text-[#6C5DD3] ring-1 ring-[#6C5DD3]/15">
                        You can submit up to 3 feedbacks per day.
                      </p>
                    </DialogHeader>
                  </div>
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col px-10 pb-10"
                  >
                    <div className="flex flex-col gap-4">
                      <label className="text-[14px] font-medium text-[#3D4035]">
                        What best describes your feedback?
                      </label>
                      <Select
                        value={formCategory}
                        onValueChange={(v) =>
                          setFormCategory(v as OpinionCategory)
                        }
                      >
                        <SelectTrigger className="h-12 rounded-xl border-[#E0E0E0] bg-white/80 px-4 text-[14px] shadow-sm">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {OPINION_CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {CATEGORY_LABELS[c]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formCategory === "other" && (
                        <Input
                          placeholder="Describe your category (e.g. Mobile & tablets)"
                          value={formCategoryCustom}
                          onChange={(e) =>
                            setFormCategoryCustom(e.target.value)
                          }
                          maxLength={60}
                          className="h-12 rounded-xl border-[#E0E0E0] bg-white/80 px-4 text-[14px] shadow-sm placeholder:text-[#3D4035]/40"
                        />
                      )}
                    </div>
                    <div className="mt-8 flex flex-col gap-4">
                      <label className="text-[14px] font-medium text-[#3D4035]">
                        Your feedback
                      </label>
                      <Textarea
                        placeholder="Share your idea, report a bug, or suggest an improvement…"
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        required
                        rows={8}
                        maxLength={2000}
                        className="min-h-[200px] rounded-xl border-[#E0E0E0] bg-white/80 px-4 py-4 text-[15px] shadow-sm placeholder:text-[#3D4035]/40"
                      />
                      <p className="text-[13px] text-[#3D4035]/50">
                        {formContent.length}/2000
                      </p>
                    </div>
                    {formError && (
                      <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600 ring-1 ring-red-100">
                        {formError}
                      </p>
                    )}
                    <DialogFooter className="mt-10 gap-3 sm:gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        className="h-11 rounded-xl border-[#E0E0E0] px-5 font-medium"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={formStatus === "loading"}
                        className="h-11 rounded-xl bg-[#6C5DD3] px-6 font-semibold text-white shadow-md hover:bg-[#5a4dbf] disabled:opacity-50"
                      >
                        {formStatus === "loading" ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Submit feedback"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <Button asChild className="rounded-xl bg-[#6C5DD3]">
                <Link href="/sign-in" className="gap-2">
                  <Plus className="size-4" />
                  Sign in to share feedback
                </Link>
              </Button>
            )}
          </div>

          {/* Tabs: Newest / Top */}
          <div className="flex gap-1 mb-2 rounded-xl border border-[#E0E0E0]/80 bg-white/60 p-1 sm:w-fit">
            <button
              type="button"
              onClick={() => {
                setOrderBy("newest");
                setPage(1);
              }}
              className={cn(
                "flex-1 rounded-lg px-4 py-2.5 text-[14px] font-medium transition-colors sm:flex-none",
                orderBy === "newest"
                  ? "bg-[#6C5DD3] text-white shadow-sm"
                  : "text-[#3D4035]/70 hover:bg-[#E9EEF0]/60 hover:text-[#3D4035]",
              )}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderBy("top");
                setPage(1);
              }}
              className={cn(
                "flex-1 rounded-lg px-4 py-2.5 text-[14px] font-medium transition-colors sm:flex-none",
                orderBy === "top"
                  ? "bg-[#6C5DD3] text-white shadow-sm"
                  : "text-[#3D4035]/70 hover:bg-[#E9EEF0]/60 hover:text-[#3D4035]",
              )}
            >
              Top
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex flex-1">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#3D4035]/40" />
              <Input
                type="search"
                placeholder="Search feedback…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-xl border-[#E0E0E0] pl-10 text-[14px]"
              />
            </div>
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v as OpinionCategory | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-[#E0E0E0] sm:w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {OPINION_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* List - more space */}
          {opinions === undefined ? (
            <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-white py-20 text-center">
              <Loader2 className="size-10 animate-spin text-[#3D4035]/30" />
              <p className="text-[15px] text-[#3D4035]/60">Loading feedback…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-white py-20 text-center">
              <MessageSquare className="size-12 text-[#3D4035]/20" />
              <p className="text-[15px] font-medium text-[#3D4035]/70">
                {search.trim() || category !== "all"
                  ? "No matching feedback"
                  : "No feedback yet"}
              </p>
              <p className="max-w-sm text-[13px] text-[#3D4035]/50">
                {search.trim() || category !== "all"
                  ? "Try a different search or category."
                  : "Be the first to share your thoughts."}
              </p>
              {session?.user && (
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="mt-1 rounded-xl bg-[#6C5DD3]"
                >
                  <Plus className="size-4 mr-2" />
                  Share feedback
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedItems.map((opinion) => (
                  <OpinionCard
                    key={opinion._id}
                    id={opinion._id}
                    userId={opinion.userId}
                    userName={opinion.userName}
                    userImage={opinion.userImage}
                    content={opinion.content}
                    category={opinion.category}
                    categoryCustom={opinion.categoryCustom}
                    upvoteCount={opinion.upvoteCount}
                    createdAt={opinion.createdAt}
                    isUpvoted={isUpvoted(opinion._id)}
                    onUpvote={() => handleUpvote(opinion._id)}
                    isUpvoting={upvotingId === opinion._id}
                  />
                ))}
              </div>
              <PaginationControls
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}

          <p className="mt-10 text-center text-[14px] text-[#3D4035]/50">
            <Link
              href="/"
              className="font-medium text-[#6C5DD3] hover:underline"
            >
              Back to home
            </Link>
            {session?.user && (
              <>
                {" · "}
                <Link
                  href="/ezcharts"
                  className="font-medium text-[#6C5DD3] hover:underline"
                >
                  Go to dashboard
                </Link>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
