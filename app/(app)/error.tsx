"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-4 rounded-md border border-destructive/30 bg-destructive/5 p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <p className="max-w-md text-sm text-foreground">{error.message || "Algo deu errado ao processar essa ação."}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
        <Button onClick={() => reset()}>Tentar de novo</Button>
      </div>
    </div>
  );
}
