"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  is_aluno: boolean;
  is_mentor: boolean;
  is_admin: boolean;
  perfil_mentor_completo: boolean;
  criado_em: string;
  mentor_cargo: string | null;
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = () => {
    fetch("/api/v1/admin/users", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/v1/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      load();
    } finally {
      setDeleting(null);
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
      <h1 className="text-[28px] font-bold text-primary mb-1">Usuários</h1>
      <p className="text-on-surface-variant text-[14px] mb-8">
        {users.length} usuário(s) cadastrado(s).
      </p>

      <div className="bg-white border border-outline-variant/40 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/20 text-[12px] font-semibold text-on-surface-variant/60 uppercase tracking-wider">
                <th className="px-6 py-3">Usuário</th>
                <th className="px-6 py-3">Papéis</th>
                <th className="px-6 py-3">Cadastro</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-lowest">
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-medium text-primary">{u.nome}</p>
                    <p className="text-[12px] text-on-surface-variant/60">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {u.is_admin && (
                        <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                      {u.is_mentor && (
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          Mentor
                        </span>
                      )}
                      {u.is_aluno && (
                        <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                          Aluno
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[12px] text-on-surface-variant/60">
                    {new Date(u.criado_em).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={deleting === u.id}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                      title="Excluir"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
