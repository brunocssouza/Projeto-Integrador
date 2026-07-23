"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/v1/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setLoading(false);
    }
    load();
  }, []);

  async function markAllRead() {
    await fetch("/api/v1/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
  }

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-md text-foreground">Notificações</h1>
        {notifications.some((n) => !n.read_at) && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="Nenhuma notificação" description="Você está em dia!" />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={!n.read_at ? "border-primary" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                  </div>
                  {!n.read_at && <Badge variant="secondary">Nova</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
