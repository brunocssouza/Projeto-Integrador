"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { canJoinSession } from "@/lib/session-join";

interface MentorSession {
  id: number;
  title: string;
  area: string;
  scheduled_at: string;
  duration_min: number;
  status: string;
  reservation_status: string;
  video_platform: string | null;
  meeting_link: string | null;
  student_name: string;
  student_email: string;
  joined_student_at: string | null;
  joined_mentor_at: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Agendada", color: "bg-blue-50 text-blue-600" },
  in_progress: { label: "Em Andamento", color: "bg-amber-50 text-amber-600" },
  completed: { label: "Concluída", color: "bg-green-50 text-green-600" },
  cancelled: { label: "Cancelada", color: "bg-red-50 text-red-500" },
};

const RESERVA_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-50 text-yellow-600" },
  approved: { label: "Aprovada", color: "bg-green-50 text-green-600" },
  rejected: { label: "Recusada", color: "bg-red-50 text-red-500" },
};

const PLATFORM_LABELS: Record<string, string> = {
  google_meet: "Google Meet",
  microsoft_teams: "Microsoft Teams",
  zoom: "Zoom",
  discord: "Discord",
};

type TabFilter = "all" | "pending" | "scheduled" | "completed";

export default function MentorAgendamentosPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [linkInputs, setLinkInputs] = useState<Record<number, string>>({});
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const loadSessions = () => {
    fetch("/api/v1/sessions", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const filtered =
    activeTab === "all"
      ? sessions
      : sessions.filter((s) => {
          if (activeTab === "pending") return s.reservation_status === "pending";
          return s.status === activeTab;
        });

  const pendingCount = sessions.filter((s) => s.reservation_status === "pending").length;

  const handleAction = async (sessaoId: number, action: string, extra?: Record<string, string>) => {
    setActionLoading(sessaoId);
    try {
      await fetch(`/api/v1/sessions/${sessaoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action, ...extra }),
      });
      loadSessions();
    } catch {
    } finally {
      setActionLoading(null);
    }
  };

  const handleJoin = async (sessaoId: number) => {
    setActionLoading(sessaoId);
    try {
      await fetch(`/api/v1/sessions/${sessaoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "join" }),
      });
      loadSessions();
    } catch {
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-8 sm:p-12 lg:p-16 w-full max-w-[1000px] mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-primary mb-1">Agendamentos</h1>
        <p className="text-on-surface-variant text-[14px]">
          Gerencie suas sessões como mentor, {user?.name?.split(" ")[0]}.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {(
          [
            { key: "all", label: "Todos" },
            { key: "pending", label: "Pendentes", count: pendingCount },
            { key: "scheduled", label: "Agendados" },
            { key: "completed", label: "Concluídos" },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveTab(f.key)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === f.key
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-on-surface-variant border-outline-variant/40 hover:border-outline-variant"
            }`}
          >
            {f.label}
            {"count" in f && f.count > 0 && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === f.key ? "bg-white/20" : "bg-orange-50 text-orange-600"
                }`}
              >
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-on-surface-variant">Carregando sessões...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block">
            event_busy
          </span>
          <p className="text-on-surface-variant text-[14px]">Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((session) => {
            const status = STATUS_LABELS[session.status] || STATUS_LABELS.scheduled;
            const reserva = RESERVA_LABELS[session.reservation_status];
            const sessionDate = new Date(session.scheduled_at);
            const timeStr = sessionDate.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const dateStr = sessionDate.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            });
            const isLoading = actionLoading === session.id;

            return (
              <div
                key={session.id}
                className="bg-white border border-outline-variant/40 rounded-2xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-surface-container-low flex items-center justify-center text-[13px] font-bold text-primary shrink-0">
                    {session.student_name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-[15px] font-semibold text-primary truncate">
                        {session.student_name}
                      </h3>
                      {reserva && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${reserva.color}`}
                        >
                          {reserva.label}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-[13px] text-on-surface-variant">
                      {session.title} · {session.area}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[12px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px]">
                          calendar_today
                        </span>
                        {dateStr}
                      </span>
                      <span className="flex items-center gap-1 text-[12px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {timeStr} · {session.duration_min}min
                      </span>
                      {session.video_platform && (
                        <span className="flex items-center gap-1 text-[12px] text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">videocam</span>
                          {PLATFORM_LABELS[session.video_platform] || session.video_platform}
                        </span>
                      )}
                    </div>

                    {/* Link display */}
                    {session.meeting_link && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-green-600">
                          link
                        </span>
                        <a
                          href={session.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] text-orange-500 hover:opacity-60 transition-opacity truncate max-w-[300px]"
                        >
                          {session.meeting_link}
                        </a>
                      </div>
                    )}

                    {/* Attendance info */}
                    {session.status === "completed" && (
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-on-surface-variant/60">
                        {session.joined_student_at && (
                          <span>
                            Aluno entrou:{" "}
                            {new Date(session.joined_student_at).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                        {session.joined_mentor_at && (
                          <span>
                            Mentor entrou:{" "}
                            {new Date(session.joined_mentor_at).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Pending: Approve/Decline */}
                    {session.reservation_status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(session.id, "approve")}
                          disabled={isLoading}
                          className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[12px] font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {isLoading ? (
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          )}
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleAction(session.id, "decline")}
                          disabled={isLoading}
                          className="border border-red-300 text-red-500 px-4 py-1.5 rounded-full text-[12px] font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Recusar
                        </button>
                      </>
                    )}

                    {/* Approved: Add link / Start / Join */}
                    {session.reservation_status === "approved" &&
                      session.status === "scheduled" && (
                        <>
                          {!session.meeting_link ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="url"
                                value={linkInputs[session.id] || ""}
                                onChange={(e) =>
                                  setLinkInputs((prev) => ({
                                    ...prev,
                                    [session.id]: e.target.value,
                                  }))
                                }
                                placeholder="Link da reunião"
                                className="w-[180px] px-3 py-1.5 border border-outline-variant/40 rounded-lg text-[12px] outline-none focus:border-orange-500"
                              />
                              <button
                                onClick={() => {
                                  const link = linkInputs[session.id];
                                  if (link)
                                    handleAction(session.id, "update_link", { meeting_link: link });
                                }}
                                disabled={!linkInputs[session.id] || isLoading}
                                className="bg-primary text-white px-3 py-1.5 rounded-lg text-[12px] font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
                              >
                                Salvar
                              </button>
                            </div>
                          ) : (
                            (() => {
                              const { ok, minutesToStart } = canJoinSession(session.scheduled_at);
                              if (ok) {
                                return (
                                  <button
                                    onClick={() => handleAction(session.id, "start")}
                                    disabled={isLoading}
                                    className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[12px] font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">
                                      play_arrow
                                    </span>
                                    Iniciar Sessão
                                  </button>
                                );
                              }
                              return (
                                <div className="text-right">
                                  <span className="flex items-center gap-1 text-[11px] text-on-surface-variant/50 justify-end">
                                    <span className="material-symbols-outlined text-[14px]">
                                      lock
                                    </span>
                                    Libera em ~{Math.ceil(minutesToStart)} min
                                  </span>
                                  <span className="text-[10px] text-on-surface-variant/40">
                                    30 min antes do início
                                  </span>
                                </div>
                              );
                            })()
                          )}
                        </>
                      )}

                    {/* In progress: Join / Complete */}
                    {session.status === "in_progress" && (
                      <>
                        {session.meeting_link && (
                          <a
                            href={session.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleJoin(session.id)}
                            className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[12px] font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1 no-underline"
                          >
                            <span className="material-symbols-outlined text-[14px]">call</span>
                            Entrar na Call
                          </a>
                        )}
                        <button
                          onClick={() => handleAction(session.id, "complete")}
                          disabled={isLoading}
                          className="border border-green-300 text-green-600 px-4 py-1.5 rounded-full text-[12px] font-semibold hover:bg-green-50 transition-colors disabled:opacity-50"
                        >
                          Concluir
                        </button>
                      </>
                    )}

                    {/* Approved: Join (for mentor) */}
                    {session.reservation_status === "approved" &&
                      session.status !== "in_progress" &&
                      session.status !== "scheduled" && (
                        <button
                          onClick={() => handleJoin(session.id)}
                          disabled={isLoading}
                          className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[12px] font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">call</span>
                          Entrar na Call
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
