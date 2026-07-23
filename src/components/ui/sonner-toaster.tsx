"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group bg-surface border border-outline-variant text-on-surface rounded-lg shadow-lg",
          description: "text-outline",
        },
      }}
    />
  );
}
