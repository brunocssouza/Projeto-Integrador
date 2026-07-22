"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

interface Student {
  id: number;
  name: string;
  initials: string;
  specialty: string;
  sessions: number;
  lastSession: string;
}

interface AlunosData {
  stats: { alunosAtivos: number; sessoesMes: number; mediaAvaliacao: number };
  students: Student[];
}

export default function MentorAlunosPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AlunosData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/mentors/students", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 sm:p-12 lg:p-16 w-full max-w-[1200px] mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-primary mb-1">Meus Alunos</h1>
        <p className="text-on-surface-variant text-[14px]">
          Acompanhe os alunos que estão com você, {user?.name?.split(" ")[0]}.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {[
              { label: "Alunos Ativos", value: String(data?.stats.alunosAtivos ?? 0), icon: "groups" },
              { label: "Sessões Concluídas", value: String(data?.stats.sessoesMes ?? 0), icon: "event" },
              { label: "Avaliação Média", value: data?.stats.mediaAvaliacao ? String(data.stats.mediaAvaliacao) : "—", icon: "star" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-outline-variant/40 rounded-2xl p-5 flex items-center gap-4"
              >
                <span className="material-symbols-outlined text-[24px] text-orange-500">
                  {stat.icon}
                </span>
                <div>
                  <p className="text-[24px] font-bold text-primary">{stat.value}</p>
                  <p className="text-[13px] text-on-surface-variant">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-outline-variant/40 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/20">
              <h2 className="text-[15px] font-semibold text-primary">Alunos Recentes</h2>
            </div>
            {(data?.students ?? []).length === 0 ? (
              <div className="px-6 py-12 text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface/10 mb-4 block">group_off</span>
                <p className="text-[14px] text-on-surface-variant">Nenhum aluno ainda.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/20">
                {(data?.students ?? []).map((student) => (
                  <div
                    key={student.id}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-surface-container-lowest transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-[13px] font-bold text-primary shrink-0">
                      {student.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-on-surface truncate">
                        {student.name}
                      </p>
                      <p className="text-[12px] text-on-surface-variant mt-0.5">
                        {student.specialty}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-medium text-on-surface">
                        {student.sessions} sessão{student.sessions > 1 ? "ões" : ""}
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Última:{" "}
                        {new Date(student.lastSession + (student.lastSession.includes("T") ? "" : "T00:00:00")).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
