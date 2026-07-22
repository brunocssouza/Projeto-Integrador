"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

interface ReportsData {
  stats: {
    completedSessions: number;
    practiceHours: number;
    avgRating: number;
  };
  skills: { name: string; progress: number }[];
  recentActivity: { icon: string; text: string; date: string }[];
}

export default function RelatoriosPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports", { credentials: "include" })
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
        <h1 className="text-[28px] font-bold text-primary mb-1">
          Meus Relatórios
        </h1>
        <p className="text-on-surface-variant text-[14px]">
          Acompanhe seu progresso e desempenho, {user?.name?.split(" ")[0]}.
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
              {
                label: "Sessões Realizadas",
                value: String(data?.stats.completedSessions ?? 0),
                icon: "check_circle",
                color: "text-green-600",
              },
              {
                label: "Horas de Prática",
                value: `${data?.stats.practiceHours ?? 0}h`,
                icon: "schedule",
                color: "text-blue-600",
              },
              {
                label: "Nota Média",
                value: data?.stats.avgRating ? String(data.stats.avgRating) : "—",
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

          <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 mb-6">
            <h2 className="text-[16px] font-semibold text-primary mb-5">
              Habilidades Avaliadas
            </h2>
            <div className="space-y-4">
              {(data?.skills ?? []).map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px] font-medium text-on-surface">
                      {item.name}
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

          <div className="bg-white border border-outline-variant/40 rounded-2xl p-6">
            <h2 className="text-[16px] font-semibold text-primary mb-5">
              Atividade Recente
            </h2>
            <div className="space-y-4">
              {(data?.recentActivity ?? []).map((activity, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant/50">
                    {activity.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-on-surface truncate">
                      {activity.text}
                    </p>
                  </div>
                  {activity.date && (
                    <span className="text-[12px] text-on-surface-variant shrink-0">
                      {activity.date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
