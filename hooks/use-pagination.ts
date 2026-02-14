"use client";

import { useCallback, useMemo, useState } from "react";

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export function usePagination<T>(
  items: T[],
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  const [page, setPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex],
  );

  const goToPage = useCallback(
    (p: number) => {
      setPage((prev) => Math.max(1, Math.min(p, totalPages)));
    },
    [totalPages],
  );

  const canPreviousPage = page > 1;
  const canNextPage = page < totalPages;

  return {
    paginatedItems,
    page,
    setPage: goToPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    canPreviousPage,
    canNextPage,
    pageSize,
  };
}
