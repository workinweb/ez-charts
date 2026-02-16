"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteChartDialogProps {
  target: { id: string; title: string } | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function DeleteChartDialog({
  target,
  onClose,
  onConfirm,
}: DeleteChartDialogProps) {
  return (
    <AlertDialog
      open={!!target}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent className="rounded-2xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete chart?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{target?.title}&rdquo; will be permanently removed. This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => target && onConfirm(target.id)}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
