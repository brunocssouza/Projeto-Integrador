"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function RelatoriosPage() {
  const { user } = useAuth();

  return (
    <div className="p-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-primary mb-1">
          Meus Relatórios
        </h1>
        <p className="text-on-surface-variant text-[14px]">
          Acompanhe seu progresso e desempenho, {user?.name?.split(" ")[0]}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        {[
          {
            label: "Sessões Realizadas",
            value: "12",
            icon: "check_circle",
            color: "text-green-600",
          },
          {
            label: "Horas de Prática",
            value: "18h",
            icon: "schedule",
            color: "text-blue-600",
          },
          {
            label: "Nota Média",
            value: "4.7",
            icon: "star",
            color: "text-orange-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-outline-variant/40 rounded-2xl p-6"
          >
            <span
              className={`material-symbols-outlined text-[28px] ${stat.color} mb-3 block`}
            >
              {stat.icon}
            </span>
            <p className="text-[28px] font-bold text-primary">{stat.value}</p>
            <p className="text-[13px] text-on-surface-variant mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Skills Progress */}
      <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 mb-6">
        <h2 className="text-[16px] font-semibold text-primary mb-5">
          Habilidades Avaliadas
        </h2>
        <div className="space-y-4">
          {[
            { skill: "Comunicação", progress: 85 },
            { skill: "Resolução de Problemas", progress: 72 },
            { skill: "Conhecimento Técnico", progress: 68 },
            { skill: "Pensamento Crítico", progress: 78 },
            { skill: "Trabalho em Equipe", progress: 90 },
          ].map((item) => (
            <div key={item.skill}>
              <div className="flex justify-between mb-1.5">
                <span className="text-[13px] font-medium text-on-surface">
                  {item.skill}
                </span>
                <span className="text-[13px] text-on-surface-variant">
                  {item.progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-outline-variant/40 rounded-2xl p-6">
        <h2 className="text-[16px] font-semibold text-primary mb-5">
          Atividade Recente
        </h2>
        <div className="space-y-4">
          {[
            {
              icon: "play_circle",
              text: "Sessão concluída com Ana Beatriz",
              date: "Há 2 dias",
            },
            {
              icon: "quiz",
              text: "Simulado de React respondido — nota 8/10",
              date: "Há 4 dias",
            },
            {
              icon: "emoji_events",
              text: "Insígnia Desbloqueada: 10 sessões concluídas",
              date: "Há 1 semana",
            },
            {
              icon: "play_circle",
              text: "Sessão concluída com Carlos Eduardo",
              date: "Há 1 semana",
            },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant/50">
                {activity.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-on-surface truncate">
                  {activity.text}
                </p>
              </div>
              <span className="text-[12px] text-on-surface-variant shrink-0">
                {activity.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
