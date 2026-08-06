"use client";

import { useEffect, useState } from "react";

interface Payment {
  id: number;
  sessao_id: number;
  pagador_nome: string;
  mentor_nome: string;
  valor: number;
  metodo: string;
  status: string;
  provider_id: string | null;
  criado_em: string;
}

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-50 text-green-600",
  pending: "bg-amber-50 text-amber-600",
  rejected: "bg-red-50 text-red-500",
  refunded: "bg-purple-50 text-purple-600",
};
const STATUS_LABELS: Record<string, string> = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Rejeitado",
  refunded: "Reembolsado",
};

export default function AdminPagamentosPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/payments", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPayments(d.payments || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const total = payments.filter((p) => p.status === "approved").reduce((s, p) => s + p.valor, 0);

  return (
    <div className="p-8 sm:p-12 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-primary mb-1">Pagamentos</h1>
          <p className="text-on-surface-variant text-[14px]">{payments.length} transação(ões).</p>
        </div>
        <div className="bg-white border border-outline-variant/40 rounded-2xl px-6 py-4">
          <p className="text-[12px] text-on-surface-variant">Receita aprovada</p>
          <p className="text-[24px] font-bold text-emerald-600">R$ {total.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/40 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/20 text-[12px] font-semibold text-on-surface-variant/60 uppercase tracking-wider">
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Pagador</th>
                <th className="px-6 py-3">Mentor</th>
                <th className="px-6 py-3">Valor</th>
                <th className="px-6 py-3">Método</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-on-surface-variant/50 text-[14px]"
                  >
                    Nenhuma transação registrada.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-lowest">
                    <td className="px-6 py-4 text-[13px] font-medium text-primary">#{p.id}</td>
                    <td className="px-6 py-4 text-[13px] text-on-surface-variant">
                      {p.pagador_nome || "—"}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-on-surface-variant">
                      {p.mentor_nome || "—"}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-primary">
                      R$ {Number(p.valor).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-[12px] text-on-surface-variant uppercase">
                      {p.metodo}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status] || "bg-gray-50 text-gray-600"}`}
                      >
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[12px] text-on-surface-variant/60">
                      {new Date(p.criado_em).toLocaleDateString("pt-BR")}
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
