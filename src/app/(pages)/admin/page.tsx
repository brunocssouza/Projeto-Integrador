"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalUsuarios: number;
  totalMentores: number;
  mentoresPendentes: number;
  totalAlunos: number;
  totalSessoes: number;
  receitaTotal: number;
}

interface PendingMentor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  is_aluno: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<PendingMentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/admin/stats", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/v1/admin/mentors/pending", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([s, p]) => {
        setStats(s.stats);
        setPending(p.mentors || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    {
      label: "Usuários",
      value: stats?.totalUsuarios ?? 0,
      icon: "group",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Mentores",
      value: stats?.totalMentores ?? 0,
      icon: "person_check",
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Alunos",
      value: stats?.totalAlunos ?? 0,
      icon: "school",
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Sessões",
      value: stats?.totalSessoes ?? 0,
      icon: "event",
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Receita",
      value: `R$ ${Number(stats?.receitaTotal ?? 0).toFixed(2)}`,
      icon: "payments",
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="p-8 sm:p-12 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-primary mb-1">Visão Geral</h1>
        <p className="text-on-surface-variant text-[14px]">Bem-vindo ao painel de administração.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-outline-variant/40 rounded-2xl p-5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}
            >
              <span className="material-symbols-outlined text-[22px]">{c.icon}</span>
            </div>
            <p className="text-[22px] font-bold text-primary">{c.value}</p>
            <p className="text-[12px] text-on-surface-variant">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-outline-variant/40 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-primary">Mentores Pendentes</h2>
            {pending.length > 0 && (
              <span className="text-[11px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </div>
          <Link
            href="/admin/mentores"
            className="text-[13px] text-orange-500 font-medium hover:opacity-60"
          >
            Ver todos
          </Link>
        </div>
        {pending.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface/10 mb-3 block">
              check_circle
            </span>
            <p className="text-[14px] text-on-surface-variant">Nenhuma aprovação pendente.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {pending.map((m) => (
              <div key={m.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-[13px] font-bold text-primary">
                  {m.nome
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-primary truncate">{m.nome}</p>
                  <p className="text-[12px] text-on-surface-variant">{m.email}</p>
                </div>
                <Link
                  href="/admin/mentores"
                  className="text-[13px] font-medium text-orange-500 hover:opacity-60"
                >
                  Analisar
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
