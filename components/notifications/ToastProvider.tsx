"use client";

import * as Toast from "@radix-ui/react-toast";
import React, { createContext, useContext, useState } from "react";

type ToastVariant = "default" | "success" | "error" | "info";
type ToastOptions = { title: string; description?: string; variant?: ToastVariant; duration?: number };

const ToastContext = createContext<(opts: ToastOptions) => void>(() => {});

export function useRadixToast() {
  return useContext(ToastContext);
}

export function RadixToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ToastOptions>({ title: "", description: "", variant: "default", duration: 4000 });

  const show = (o: ToastOptions) => {
    // kapalıyı kapat, sonra aç → art arda çağrılarda içerik güncellenir
    setOpen(false);
    requestAnimationFrame(() => {
      setOpts({ duration: 3000, variant: "default", ...o });
      setOpen(true);
    });
  };

  const variantClass =
    opts.variant === "success"
      ? "border-green-500"
      : opts.variant === "error"
      ? "border-red-500"
      : opts.variant === "info"
      ? "border-blue-500"
      : "border-gray-600";

  return (
    <ToastContext.Provider value={show}>
      <Toast.Provider swipeDirection="right" duration={opts.duration ?? 4000}>
        {children}

        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          className={`bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg border ${variantClass}
                      data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]
                      data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition
                      data-[swipe=end]:translate-x-[120%] transition`}
        >
          <Toast.Title className="font-semibold">{opts.title}</Toast.Title>
          {opts.description ? (
            <Toast.Description className="text-sm text-gray-300 mt-1">
              {opts.description}
            </Toast.Description>
          ) : null}
        </Toast.Root>

        <Toast.Viewport className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)] outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
