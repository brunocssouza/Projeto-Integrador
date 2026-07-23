"use client";

import { use, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PagamentoPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [status, setStatus] = useState<string>("pending");
  const [pixQr, setPixQr] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayment() {
      const res = await fetch(`/api/v1/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: Number(sessionId), method: "pix" }),
      });
      const data = await res.json();
      if (data.pix?.qrCode) setPixQr(data.pix.qrCode);
      setStatus(data.status || "pending");
    }
    fetchPayment();

    // Poll for status updates
    const interval = setInterval(async () => {
      const res = await fetch(`/api/v1/payments/status?sessionId=${sessionId}`);
      const data = await res.json();
      if (data.status) setStatus(data.status);
      if (data.status === "approved") clearInterval(interval);
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Pagamento via Pix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "approved" ? (
            <div className="text-center py-8">
              <Badge variant="success">Pagamento Confirmado</Badge>
              <p className="mt-4 text-body-md text-muted-foreground">
                Sua sessão foi confirmada com sucesso!
              </p>
            </div>
          ) : status === "rejected" ? (
            <div className="text-center py-8">
              <Badge variant="danger">Pagamento Recusado</Badge>
              <p className="mt-4 text-body-md text-muted-foreground">
                O pagamento foi recusado. Tente novamente.
              </p>
            </div>
          ) : pixQr ? (
            <div className="text-center space-y-4">
              <img src={pixQr} alt="QR Code Pix" className="mx-auto w-64 h-64" />
              <p className="text-body-md text-muted-foreground">Escaneie o QR code para pagar</p>
              <Badge variant="warning">Aguardando pagamento...</Badge>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-body-md text-muted-foreground">Gerando pagamento...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
