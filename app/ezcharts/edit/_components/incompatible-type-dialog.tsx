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

interface IncompatibleTypeDialogProps {
  target: string | null;
  onCancel: () => void;
  onConfirm: (target: string) => void;
}

export function IncompatibleTypeDialog({
  target,
  onCancel,
  onConfirm,
}: IncompatibleTypeDialogProps) {
  return (
    <AlertDialog
      open={!!target}
      onOpenChange={(open) => !open && onCancel()}
    >
      <AlertDialogContent className="rounded-2xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Switch chart type?</AlertDialogTitle>
          <AlertDialogDescription>
            This chart type uses different data. Your current data will be
            removed and replaced with defaults. Continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => target && onConfirm(target)}
            className="bg-[#6C5DD3] text-white hover:bg-[#5a4dbf]"
          >
            Switch
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
