"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Max number of page buttons to show (excluding prev/next). Default 5 */
  siblingCount?: number;
}

/**
 * Renders shadcn Pagination with page numbers, ellipsis, and prev/next.
 * Uses client-side navigation via onClick.
 */
export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  siblingCount = 2,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show: 1 ... 4 5 6 ... 10
  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const totalPageNumbers = siblingCount + 5; // siblingCount * 2 + 1 + 2 (first + last)

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }

    const leftSibling = Math.max(page - siblingCount, 1);
    const rightSibling = Math.min(page + siblingCount, totalPages);
    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;

    if (!showLeftEllipsis && showRightEllipsis) {
      return [...range(1, 3 + siblingCount * 2), "ellipsis", totalPages];
    }
    if (showLeftEllipsis && !showRightEllipsis) {
      return [
        1,
        "ellipsis",
        ...range(totalPages - (2 + siblingCount * 2), totalPages),
      ];
    }
    if (showLeftEllipsis && showRightEllipsis) {
      return [
        1,
        "ellipsis",
        ...range(leftSibling, rightSibling),
        "ellipsis",
        totalPages,
      ];
    }
    return range(1, totalPages);
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
            className={
              page <= 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            aria-disabled={page <= 1}
          />
        </PaginationItem>

        {pageNumbers.map((value, idx) =>
          value === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={value}>
              <PaginationLink
                href="#"
                isActive={page === value}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(value);
                }}
                className="cursor-pointer"
              >
                {value}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) onPageChange(page + 1);
            }}
            className={
              page >= totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            aria-disabled={page >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
