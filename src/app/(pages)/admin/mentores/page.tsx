"use client";

import { useEffect, useState } from "react";

interface PendingMentor {
  mentor_id: number;
  user_id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  is_aluno: boolean;
  cargo: string;
  empresa: string | null;
  descricao: string;
  experiencia: string | null;
  preco: number;
  tecnologias: string[];
  idiomas: { code: string; name: string }[];
}

interface Mentor {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  empresa: string | null;
  preco: number;
  rating: number;
  total_avaliacoes: number;
  status_aprovacao: string;
  motivo_rejeicao: string | null;
  perfil_completo: boolean;
}

export default function AdminMentoresPage() {
  const [pending, setPending] = useState<PendingMentor[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = () => {
    Promise.all([
      fetch("/api/v1/admin/mentors/pending", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/v1/admin/mentors", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([p, m]) => {
        setPending(p.mentors || []);
        setMentors(m.mentors || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (mentorId: number, action: "approve" | "reject") => {
    let reason: string | undefined;
    if (action === "reject") {
      reason = prompt("Motivo da recusa (opcional):") || undefined;
    }
    setActionLoading(mentorId);
    try {
      await fetch(`/api/v1/admin/mentors/${mentorId}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(action === "reject" ? { reason } : {}),
      });
      load();
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 sm:p-12 max-w-[1200px] mx-auto">
      <h1 className="text-[28px] font-bold text-primary mb-1">Mentores</h1>
      <p className="text-on-surface-variant text-[14px] mb-8">
        Aprove cadastros de mentores e gerencie os existentes.
      </p>

      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[16px] font-semibold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-orange-500">
              pending_actions
            </span>
            Aguardando Aprovação
            <span className="text-[11px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          </h2>
          <div className="space-y-3">
            {pending.map((m) => (
              <div key={m.mentor_id} className="bg-white border border-orange-200 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center text-[13px] font-bold text-orange-600 shrink-0">
                    {m.nome
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-primary">{m.nome}</p>
                    <p className="text-[13px] text-on-surface-variant">
                      {m.email} · {m.telefone}
                    </p>
                    <p className="text-[12px] text-on-surface-variant/60 mt-0.5">
                      CPF: {m.cpf} {m.is_aluno && "· Também é aluno"}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpanded(expanded === m.mentor_id ? null : m.mentor_id)}
                    className="text-[13px] text-orange-500 font-medium hover:opacity-60 shrink-0"
                  >
                    {expanded === m.mentor_id ? "Ocultar" : "Ver perfil"}
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-medium text-primary bg-primary/5 px-2.5 py-1 rounded-full">
                    {m.cargo}
                  </span>
                  {m.empresa && (
                    <span className="text-[12px] text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-full">
                      {m.empresa}
                    </span>
                  )}
                  <span className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    R$ {Number(m.preco).toFixed(2)}/sessão
                  </span>
                </div>

                {expanded === m.mentor_id && (
                  <div className="mt-4 pt-4 border-t border-outline-variant/20 space-y-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/50 mb-1">
                        Descrição
                      </p>
                      <p className="text-[13px] text-on-surface-variant leading-relaxed">
                        {m.descricao}
                      </p>
                    </div>
                    {m.experiencia && (
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/50 mb-1">
                          Experiência
                        </p>
                        <p className="text-[13px] text-on-surface-variant leading-relaxed">
                          {m.experiencia}
                        </p>
                      </div>
                    )}
                    {m.tecnologias.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/50 mb-1.5">
                          Tecnologias
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.tecnologias.map((t) => (
                            <span
                              key={t}
                              className="text-[11px] font-medium text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {m.idiomas.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/50 mb-1.5">
                          Idiomas
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.idiomas.map((l) => (
                            <span
                              key={l.code}
                              className="text-[11px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full"
                            >
                              {l.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-4 justify-end">
                  <button
                    onClick={() => handleAction(m.mentor_id, "approve")}
                    disabled={actionLoading === m.mentor_id}
                    className="bg-orange-500 text-white px-4 py-2 rounded-full text-[13px] font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleAction(m.mentor_id, "reject")}
                    disabled={actionLoading === m.mentor_id}
                    className="border border-red-300 text-red-500 px-4 py-2 rounded-full text-[13px] font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-[16px] font-semibold text-primary mb-4">Todos os Mentores</h2>
        <div className="bg-white border border-outline-variant/40 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/20 text-[12px] font-semibold text-on-surface-variant/60 uppercase tracking-wider">
                  <th className="px-6 py-3">Mentor</th>
                  <th className="px-6 py-3">Cargo</th>
                  <th className="px-6 py-3">Preço</th>
                  <th className="px-6 py-3">Avaliação</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {mentors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-on-surface-variant/50 text-[14px]"
                    >
                      Nenhum mentor cadastrado.
                    </td>
                  </tr>
                ) : (
                  mentors.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-container-lowest">
                      <td className="px-6 py-4">
                        <p className="text-[14px] font-medium text-primary">{m.nome}</p>
                        <p className="text-[12px] text-on-surface-variant/60">{m.email}</p>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-on-surface-variant">
                        {m.cargo}
                        {m.empresa && ` · ${m.empresa}`}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-primary">
                        R$ {Number(m.preco).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-on-surface-variant">
                        {Number(m.rating).toFixed(1)} ({m.total_avaliacoes})
                      </td>
                      <td className="px-6 py-4">
                        {m.status_aprovacao === "approved" ? (
                          <span className="text-[11px] font-medium bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
                            Aprovado
                          </span>
                        ) : m.status_aprovacao === "rejected" ? (
                          <span
                            className="text-[11px] font-medium bg-red-50 text-red-500 px-2.5 py-1 rounded-full"
                            title={m.motivo_rejeicao || ""}
                          >
                            Recusado
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full">
                            Pendente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
