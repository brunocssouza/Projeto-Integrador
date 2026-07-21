"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  sessions: number;
  lastSession: string;
}

const MOCK_STUDENTS: Student[] = [
  {
    id: "1",
    name: "Lucas Fernandes",
    initials: "LF",
    specialty: "React & TypeScript",
    sessions: 4,
    lastSession: "2026-07-18",
  },
  {
    id: "2",
    name: "Juliana Costa",
    initials: "JC",
    specialty: "System Design",
    sessions: 2,
    lastSession: "2026-07-15",
  },
  {
    id: "3",
    name: "Rafael Santos",
    initials: "RS",
    specialty: "Entrevista Comportamental",
    sessions: 6,
    lastSession: "2026-07-20",
  },
];

export default function MentorAlunosPage() {
  const { user } = useAuth();

  return (
    <div className="p-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-primary mb-1">Meus Alunos</h1>
        <p className="text-on-surface-variant text-[14px]">
          Acompanhe os alunos que estão com você, {user?.name?.split(" ")[0]}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        {[
          { label: "Alunos Ativos", value: "3", icon: "groups" },
          { label: "Sessões Este Mês", value: "8", icon: "event" },
          { label: "Avaliação Média", value: "4.8", icon: "star" },
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

      {/* Student List */}
      <div className="bg-white border border-outline-variant/40 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/20">
          <h2 className="text-[15px] font-semibold text-primary">
            Alunos Recentes
          </h2>
        </div>
        <div className="divide-y divide-outline-variant/20">
          {MOCK_STUDENTS.map((student) => (
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
                  {student.sessions} sessões
                </p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Última:{" "}
                  {new Date(
                    student.lastSession + "T00:00:00"
                  ).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
