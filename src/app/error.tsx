"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-headline-lg text-foreground">Algo deu errado</h2>
      <p className="mt-2 text-body-md text-muted-foreground">
        {error.message || "Ocorreu um erro inesperado. Tente novamente."}
      </p>
      <Button onClick={reset} className="mt-6">
        Tentar novamente
      </Button>
    </div>
  );
}
