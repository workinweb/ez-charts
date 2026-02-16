"use client";

import Link from "next/link";
import { Heart, Trash2, Copy, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChartRowItem {
  id: string;
  title: string;
  source: string;
  date: string;
  favorited?: boolean;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconBg: string;
  iconColor: string;
}

interface ChartRowProps {
  chart: ChartRowItem;
  /** Show the edit (pencil) button — default true */
  showEdit?: boolean;
  onDuplicate?: (id: string) => void;
  onDelete?: (chart: { id: string; title: string }) => void;
  onToggleFavorite?: (id: string) => void;
}

export function ChartRow({
  chart,
  showEdit = true,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}: ChartRowProps) {
  const Icon = chart.icon;

  const controlButtonClass =
    "shrink-0 rounded-full p-2 text-[#3D4035]/30 transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[28px] p-3 transition-colors hover:bg-black/[0.02] sm:gap-6">
      <div
        className={cn(
          "flex size-16 shrink-0 items-center justify-center rounded-[24px]",
          chart.iconBg,
        )}
      >
        <Icon className={cn("size-7", chart.iconColor)} strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1 basis-32">
        <p className="text-[17px] font-medium text-[#3D4035]">{chart.title}</p>
        <p className="text-[13px] text-[#3D4035]/50">{chart.source}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex items-center gap-0.5 sm:gap-1">
          {showEdit && (
            <Link
              href={`/ezcharts/edit?chart=${chart.id}`}
              className={cn(
                controlButtonClass,
                "hover:bg-[#6C5DD3]/10 hover:text-[#6C5DD3]",
              )}
              aria-label="Edit chart"
              title="Edit chart"
            >
              <Pencil className="size-4" />
            </Link>
          )}

          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(chart.id)}
              className={cn(controlButtonClass, "hover:bg-black/[0.04] hover:text-[#3D4035]/70")}
              aria-label="Duplicate chart"
              title="Duplicate chart"
            >
              <Copy className="size-4" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete({ id: chart.id, title: chart.title })}
              className={cn(
                controlButtonClass,
                "hover:bg-red-50 hover:text-red-500",
              )}
              aria-label="Delete chart"
              title="Delete chart"
            >
              <Trash2 className="size-4" />
            </button>
          )}

          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(chart.id)}
              className={cn(
                controlButtonClass,
                "text-[#3D4035]/40 hover:bg-black/[0.04] hover:text-[#3D4035]/70",
              )}
              aria-label={
                chart.favorited ? "Remove from favorites" : "Add to favorites"
              }
              title={
                chart.favorited ? "Remove from favorites" : "Add to favorites"
              }
            >
              {chart.favorited ? (
                <Heart className="size-5 fill-[#6C5DD3] text-[#6C5DD3]" />
              ) : (
                <Heart className="size-5" />
              )}
            </button>
          )}
        </div>

        <Link
          href={`/ezcharts/charts/${chart.id}`}
          className="flex flex-col items-end gap-0.5 text-right sm:flex-row sm:items-center sm:gap-2"
        >
          <p className="text-[13px] font-medium text-[#3D4035]/50">
            {chart.date}
          </p>
          <span className="text-[13px] font-semibold text-[#6C5DD3] hover:underline">
            Open →
          </span>
        </Link>
      </div>
    </div>
  );
}
