"use client";

import { useEffect, useState } from "react";

interface Session {
  id: number;
  titulo: string;
  area: string;
  data_hora: string;
  duracao_min: number;
  status: string;
  status_reserva: string;
  status_pagamento: string;
  aluno_nome: string;
  mentor_nome: string;
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-600",
  in_progress: "bg-amber-50 text-amber-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-500",
};
const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  in_progress: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
};

export default function AdminSessoesPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/sessions", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 sm:p-12 max-w-[1200px] mx-auto">
      <h1 className="text-[28px] font-bold text-primary mb-1">Sessões</h1>
      <p className="text-on-surface-variant text-[14px] mb-8">
        {sessions.length} sessão(ões) registrada(s).
      </p>

      <div className="bg-white border border-outline-variant/40 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/20 text-[12px] font-semibold text-on-surface-variant/60 uppercase tracking-wider">
                <th className="px-6 py-3">Sessão</th>
                <th className="px-6 py-3">Aluno</th>
                <th className="px-6 py-3">Mentor</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-on-surface-variant/50 text-[14px]"
                  >
                    Nenhuma sessão registrada.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-container-lowest">
                    <td className="px-6 py-4">
                      <p className="text-[14px] font-medium text-primary">{s.titulo}</p>
                      <p className="text-[12px] text-on-surface-variant/60">{s.area}</p>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-on-surface-variant">
                      {s.aluno_nome}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-on-surface-variant">
                      {s.mentor_nome}
                    </td>
                    <td className="px-6 py-4 text-[12px] text-on-surface-variant/60">
                      {new Date(s.data_hora).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      <br />
                      {new Date(s.data_hora).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[s.status] || "bg-gray-50 text-gray-600"}`}
                      >
                        {STATUS_LABELS[s.status] || s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[12px] text-on-surface-variant">
                      {s.status_pagamento}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
