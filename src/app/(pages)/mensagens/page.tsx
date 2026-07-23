"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";

interface Conversation {
  id: string;
  mentor_id: number;
  aluno_id: number;
  last_message_at: string | null;
}

interface Message {
  id: string;
  sender_id: number;
  content: string;
  created_at: string;
}

export default function MensagensPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadConversations() {
      const res = await fetch("/api/v1/conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
      setLoading(false);
    }
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    async function loadMessages() {
      const res = await fetch(`/api/v1/conversations/${selectedId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    }
    loadMessages();

    // Poll for new messages (no Redis/SSE)
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !selectedId) return;

    const tempMessage: Message = {
      id: crypto.randomUUID(),
      sender_id: 0,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    setContent("");

    try {
      await fetch(`/api/v1/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedId, content }),
      });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    }
  }

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-headline-md text-foreground mb-6">Mensagens</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
        {/* Conversation list */}
        <div className="md:col-span-1 space-y-2 overflow-y-auto">
          {conversations.length === 0 ? (
            <EmptyState
              title="Sem conversas"
              description="Agende uma sessão para começar a conversar."
            />
          ) : (
            conversations.map((c) => (
              <Card
                key={c.id}
                className={`cursor-pointer transition-colors ${selectedId === c.id ? "border-primary" : ""}`}
                onClick={() => setSelectedId(c.id)}
              >
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-foreground">
                    Conversa #{c.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {c.last_message_at
                      ? new Date(c.last_message_at).toLocaleString("pt-BR")
                      : "Sem mensagens"}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Message view */}
        <div className="md:col-span-2 flex flex-col">
          {selectedId ? (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 p-4 border border-border rounded-lg">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_id === 0 ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                        m.sender_id === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="flex gap-2 mt-3">
                <Input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                />
                <Button type="submit">Enviar</Button>
              </form>
            </>
          ) : (
            <EmptyState
              title="Selecione uma conversa"
              description="Escolha uma conversa à esquerda para ver as mensagens."
            />
          )}
        </div>
      </div>
    </div>
  );
}
