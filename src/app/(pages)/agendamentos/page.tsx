"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Session {
  sessao_id: number;
  titulo: string;
  area: string;
  data_hora: string;
  duracao_min: number;
  status: string;
  status_reserva: string;
  plataforma_video: string | null;
  link_reuniao: string | null;
  mentor_nome: string;
  mentor_cargo: string;
  mentor_empresa: string | null;
  joined_aluno_at: string | null;
  joined_mentor_at: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  agendada: { label: "Agendada", color: "bg-blue-50 text-blue-600" },
  em_andamento: { label: "Em Andamento", color: "bg-amber-50 text-amber-600" },
  concluida: { label: "Concluída", color: "bg-green-50 text-green-600" },
  cancelada: { label: "Cancelada", color: "bg-red-50 text-red-500" },
};

const RESERVA_LABELS: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-50 text-yellow-600" },
  aprovada: { label: "Aprovada", color: "bg-green-50 text-green-600" },
  recusada: { label: "Recusada", color: "bg-red-50 text-red-500" },
};

const PLATFORM_LABELS: Record<string, string> = {
  google_meet: "Google Meet",
  microsoft_teams: "Microsoft Teams",
  zoom: "Zoom",
  discord: "Discord",
};

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function AgendamentosPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "agendada" | "concluida" | "cancelada">("all");

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  useEffect(() => {
    fetch("/api/sessions", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sessionsByDate: Record<string, Session[]> = {};
  sessions.forEach((s) => {
    const d = new Date(s.data_hora);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!sessionsByDate[key]) sessionsByDate[key] = [];
    sessionsByDate[key].push(s);
  });

  const filteredSessions = sessions.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const selectedDateKey = formatDateKey(currentYear, currentMonth, selectedDay);
  const selectedDaySessions = filteredSessions.filter((s) => {
    const d = new Date(s.data_hora);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return key === selectedDateKey;
  });

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const isToday = (day: number) => {
    return (
      day === now.getDate() &&
      currentMonth === now.getMonth() &&
      currentYear === now.getFullYear()
    );
  };

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div className="p-8 sm:p-12 lg:p-16 w-full max-w-[1200px] mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-primary mb-1">
          Meus Agendamentos
        </h1>
        <p className="text-on-surface-variant text-[14px]">
          Gerencie suas sessões de mentoria, {user?.name?.split(" ")[0]}.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendar */}
        <div className="lg:w-[480px] shrink-0">
          <div className="bg-white border border-outline-variant/40 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPrevMonth}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                  chevron_left
                </span>
              </button>
              <h2 className="text-[16px] font-semibold text-primary">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={goToNextMonth}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                  chevron_right
                </span>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="text-center text-[11px] font-semibold text-on-surface-variant/50 uppercase py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (day === null) {
                  return <div key={`empty-${i}`} className="h-10" />;
                }
                const dateKey = formatDateKey(currentYear, currentMonth, day);
                const hasSessions = (sessionsByDate[dateKey]?.length || 0) > 0;
                const isSelected = day === selectedDay;
                const today = isToday(day);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`h-10 flex flex-col items-center justify-center rounded-xl text-[14px] font-medium transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-primary text-white"
                        : today
                          ? "bg-orange-50 text-orange-600 font-bold"
                          : "text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    {day}
                    {hasSessions && (
                      <div className="flex gap-0.5 mt-0.5">
                        {sessionsByDate[dateKey]!.slice(0, 3).map((_, j) => (
                          <div
                            key={j}
                            className={`w-1 h-1 rounded-full ${
                              isSelected ? "bg-white/80" : "bg-orange-400"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-semibold text-primary">
              {new Date(currentYear, currentMonth, selectedDay).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </h3>
          </div>

          <div className="flex gap-2 mb-6">
            {(
              [
                { key: "all", label: "Todos" },
                { key: "agendada", label: "Agendadas" },
                { key: "concluida", label: "Concluídas" },
                { key: "cancelada", label: "Canceladas" },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-colors cursor-pointer ${
                  filter === f.key
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-on-surface-variant border-outline-variant/40 hover:border-outline-variant"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[14px] text-on-surface-variant">Carregando sessões...</p>
            </div>
          ) : selectedDaySessions.length === 0 ? (
            <div className="text-center py-16 bg-white border border-outline-variant/30 rounded-2xl">
              <span className="material-symbols-outlined text-[48px] text-on-surface/10 mb-4 block">
                event_available
              </span>
              <p className="text-[14px] text-on-surface-variant">
                Nenhuma sessão para este dia.
              </p>
              <p className="text-[13px] text-on-surface-variant/50 mt-1">
                Selecione outro dia no calendário ou agende uma nova sessão.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDaySessions.map((session) => {
                const status = STATUS_LABELS[session.status] || STATUS_LABELS.agendada;
                const reserva = RESERVA_LABELS[session.status_reserva];
                const sessionTime = new Date(session.data_hora);
                const timeStr = sessionTime.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={session.sessao_id}
                    className="bg-white border border-outline-variant/40 rounded-2xl p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-surface-container-low flex items-center justify-center text-[13px] font-bold text-primary shrink-0">
                        {session.mentor_nome
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-[15px] font-semibold text-primary truncate">
                            {session.mentor_nome}
                          </h4>
                          {reserva && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${reserva.color}`}
                            >
                              {reserva.label}
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-on-surface-variant">
                          {session.titulo}
                          {session.mentor_cargo && ` · ${session.mentor_cargo}`}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-[12px] text-on-surface-variant">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {timeStr} · {session.duracao_min}min
                          </span>
                          {session.plataforma_video && (
                            <span className="flex items-center gap-1 text-[12px] text-on-surface-variant">
                              <span className="material-symbols-outlined text-[14px]">videocam</span>
                              {PLATFORM_LABELS[session.plataforma_video] || session.plataforma_video}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className={`px-3 py-1 rounded-full text-[12px] font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                        {session.status === "agendada" && session.status_reserva === "aprovada" && session.link_reuniao && (
                          <a
                            href={session.link_reuniao}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[12px] font-medium text-orange-500 hover:opacity-60 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-[14px]">call</span>
                            Entrar na Call
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
