"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";

export function ConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg max-w-md w-full z-50">
          <AlertDialog.Title className="text-lg font-bold mb-2 text-white">
            {title}
          </AlertDialog.Title>
          {description && (
            <AlertDialog.Description className="text-sm text-gray-300 mb-4">
              {description}
            </AlertDialog.Description>
          )}
          <div className="flex justify-end gap-3">
            <AlertDialog.Cancel
              className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white transition"
            >
              İptal
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
            >
              Onayla
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
