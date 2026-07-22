"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const performanceData = [
  { name: "Sem 1", react: 45, automacao: 30, postgres: 55 },
  { name: "Sem 2", react: 60, automacao: 45, postgres: 65 },
  { name: "Sem 3", react: 75, automacao: 55, postgres: 75 },
  { name: "Sem 4", react: 92, automacao: 80, postgres: 85 },
];

interface NextSession {
  id: number;
  title: string;
  area: string;
  dateTime: string;
  duration: number;
  platform: string | null;
  mentorName: string;
  mentorRole: string;
  link: string | null;
}

interface Mentor {
  id: number;
  name: string;
  role: string;
  tags: string[];
  price: number;
  rating: number;
}

interface DashboardData {
  user: { name: string };
  nextSession: NextSession | null;
  stats: { totalSessoes: number; concluidas: number; horasPratica: number };
  recentSessions: { id: number; title: string; dateTime: string; status: string; mentorName: string }[];
  mentors: Mentor[];
}

const PLATFORM_LABELS: Record<string, string> = {
  google_meet: "Google Meet",
  microsoft_teams: "Microsoft Teams",
  zoom: "Zoom",
  discord: "Discord",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  agendada: { label: "Agendada", color: "text-blue-600" },
  em_andamento: { label: "Em Andamento", color: "text-amber-600" },
  concluida: { label: "Concluída", color: "text-green-600" },
  cancelada: { label: "Cancelada", color: "text-red-500" },
};

function formatSessionDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  if (isToday) return `Hoje, ${time}`;
  if (isTomorrow) return `Amanhã, ${time}`;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  }) + `, ${time}`;
}

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-16 w-full max-w-[1200px] mx-auto min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = data?.user?.name?.split(" ")[0] || "Usuário";
  const nextSession = data?.nextSession;
  const stats = data?.stats || { totalSessoes: 0, concluidas: 0, horasPratica: 0 };
  const mentors = data?.mentors || [];
  const recentSessions = data?.recentSessions || [];

  return (
    <div className="p-8 sm:p-12 lg:p-16 w-full max-w-[1200px] mx-auto min-h-screen">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-[28px] lg:text-[32px] text-primary font-bold mb-1">
          Bem-vindo, {firstName}.
        </h1>
        <p className="text-on-surface-variant text-[14px]">
          {stats.concluidas > 0
            ? `Você já completou ${stats.concluidas} sessão${stats.concluidas > 1 ? "ões" : ""}. Continue assim!`
            : "Comece agendando sua primeira sessão de mentoria."}
        </p>
      </header>

      {/* Proximo Agendamento */}
      {nextSession ? (
        <section className="bg-gradient-to-br from-[#0a1628] via-[#0d2240] to-[#091a36] text-white rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-[#50d9fe]/15 text-[#50d9fe] font-semibold text-[11px] px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#50d9fe] animate-pulse" />
              Próximo Agendamento
            </span>
            <h2 className="text-[22px] sm:text-[26px] font-bold mb-1.5">
              {nextSession.title}
            </h2>
            <p className="text-white/50 text-[14px] mb-5">
              Com {nextSession.mentorName} · {nextSession.mentorRole}
            </p>
            <div className="flex flex-wrap items-center gap-5 text-[13px] font-medium text-white/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">
                  calendar_month
                </span>
                {formatSessionDate(nextSession.dateTime)}
              </div>
              {nextSession.platform && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">
                    videocam
                  </span>
                  {PLATFORM_LABELS[nextSession.platform] || nextSession.platform}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">
                  schedule
                </span>
                {nextSession.duration}min
              </div>
            </div>
          </div>
          <Link
            href="/agendamentos"
            className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 bg-white text-primary font-semibold px-5 py-2.5 rounded-full text-[13px] flex items-center gap-2 hover:bg-gray-100 transition-colors z-10 no-underline"
          >
            Ver Detalhes
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </Link>
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-[#50d9fe]/5 rounded-full blur-3xl" />
          <div className="absolute right-40 -bottom-32 w-96 h-96 bg-[#50d9fe]/3 rounded-full blur-3xl" />
        </section>
      ) : (
        <section className="bg-gradient-to-br from-[#0a1628] via-[#0d2240] to-[#091a36] text-white rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-[22px] sm:text-[26px] font-bold mb-2">
              Nenhuma sessão agendada
            </h2>
            <p className="text-white/50 text-[14px] mb-5">
              Explore nossos mentores e agende sua primeira sessão.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-full text-[13px] hover:bg-orange-600 transition-colors no-underline"
            >
              <span className="material-symbols-outlined text-[16px]">explore</span>
              Explorar Mentores
            </Link>
          </div>
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-[#50d9fe]/5 rounded-full blur-3xl" />
        </section>
      )}

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">
                schedule
              </span>
            </div>
            <span className="text-[13px] font-medium text-on-surface-variant">
              Tempo de Prática
            </span>
          </div>
          <p className="text-[26px] font-bold text-primary">
            {stats.horasPratica}h
          </p>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-500 text-[20px]">
                target
              </span>
            </div>
            <span className="text-[13px] font-medium text-on-surface-variant">
              Sessões Realizadas
            </span>
          </div>
          <p className="text-[26px] font-bold text-primary">{stats.concluidas}</p>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                calendar_month
              </span>
            </div>
            <span className="text-[13px] font-medium text-on-surface-variant">
              Total de Agendamentos
            </span>
          </div>
          <p className="text-[26px] font-bold text-primary">{stats.totalSessoes}</p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Chart */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[17px] font-semibold text-primary">
                Evolução de Habilidades
              </h2>
              <span className="text-[12px] text-on-surface-variant/50 font-medium">
                Últimas 4 semanas
              </span>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e3e4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#737780", fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#737780", fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e1e3e4",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      fontSize: "13px",
                      padding: "10px 14px",
                    }}
                  />
                  <Line type="monotone" dataKey="react" name="React & Next.js" stroke="#191c1d" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="automacao" name="RPA & Automação" stroke="#ea580c" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="postgres" name="PostgreSQL" stroke="#a8c8ff" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Mentors */}
          {mentors.length > 0 && (
            <section>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-[17px] font-semibold text-primary">
                  Mentores Recomendados
                </h2>
                <Link
                  href="/explore"
                  className="text-[13px] font-medium text-orange-500 hover:opacity-60 transition-opacity"
                >
                  Ver todos
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {mentors.map((mentor) => (
                  <Link
                    key={mentor.id}
                    href={`/mentor/${mentor.id}`}
                    className="bg-white border border-outline-variant/30 rounded-2xl p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow no-underline block group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center flex-shrink-0">
                        <span className="text-[13px] font-bold text-primary">
                          {mentor.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[14px] font-semibold text-primary truncate group-hover:text-orange-500 transition-colors">
                          {mentor.name}
                        </h4>
                        <p className="text-[12px] text-on-surface-variant truncate">
                          {mentor.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[12px] font-medium text-orange-500">
                        {mentor.rating > 0 ? mentor.rating.toFixed(1) : "Novo"}
                      </span>
                      {mentor.rating > 0 && (
                        <span className="material-symbols-outlined text-[12px] text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      )}
                      <span className="text-[12px] text-on-surface-variant/50 ml-auto">
                        R$ {mentor.price}/sessão
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {mentor.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium text-on-surface-variant/50 px-2 py-0.5 bg-surface-container-low rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col gap-8">
          {/* Recent Sessions */}
          <section className="bg-white border border-outline-variant/30 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[17px] font-semibold text-primary">
                Sessões Recentes
              </h2>
              <Link
                href="/agendamentos"
                className="text-[12px] font-medium text-orange-500 hover:opacity-60 transition-opacity"
              >
                Ver todas
              </Link>
            </div>

            {recentSessions.length === 0 ? (
              <p className="text-[13px] text-on-surface-variant/50">
                Nenhuma sessão registrada ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {recentSessions.map((session) => {
                  const status = STATUS_LABELS[session.status] || STATUS_LABELS.agendada;
                  return (
                    <div key={session.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[13px] font-medium text-primary truncate">
                            {session.title}
                          </p>
                          <span className={`text-[11px] font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant/50">
                          {session.mentorName} · {formatRelativeDate(session.dateTime)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className="bg-surface-container-low rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-orange-500 text-[20px]">
                bolt
              </span>
              <h3 className="text-[15px] font-semibold text-primary">
                Ações Rápidas
              </h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/explore"
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-outline-variant/20 hover:border-orange-500/30 transition-colors no-underline group"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant/40 group-hover:text-orange-500 transition-colors">
                  search
                </span>
                <span className="text-[13px] font-medium text-primary">
                  Explorar novos mentores
                </span>
              </Link>
              <Link
                href="/agendamentos"
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-outline-variant/20 hover:border-orange-500/30 transition-colors no-underline group"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant/40 group-hover:text-orange-500 transition-colors">
                  calendar_month
                </span>
                <span className="text-[13px] font-medium text-primary">
                  Ver meus agendamentos
                </span>
              </Link>
              <Link
                href="/relatorios"
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-outline-variant/20 hover:border-orange-500/30 transition-colors no-underline group"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant/40 group-hover:text-orange-500 transition-colors">
                  bar_chart
                </span>
                <span className="text-[13px] font-medium text-primary">
                  Acessar relatórios
                </span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
