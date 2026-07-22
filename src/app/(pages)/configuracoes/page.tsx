"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface Transaction {
  id: number;
  title: string;
  area: string;
  mentorName: string;
  dateTime: string;
  duration: number;
  status: string;
  valor: number;
}

export default function ConfiguracoesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [nome, setNome] = useState(() => user?.name || "");
  const [email, setEmail] = useState(() => user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Password
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/transactions", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
          setTotalSpent(data.total || 0);
        }
      } catch {
      } finally {
        setLoadingTransactions(false);
      }
    }
    fetchTransactions();
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/auth/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.avatarUrl);
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao fazer upload");
      }
    } catch {
      alert("Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveProfile() {
    if (!nome.trim()) return;

    setSaving(true);
    setSaveMsg("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim() }),
      });

      if (res.ok) {
        setSaveMsg("Perfil atualizado com sucesso!");
        setTimeout(() => setSaveMsg(""), 3000);
      } else {
        const data = await res.json();
        setSaveMsg(data.error || "Erro ao salvar");
      }
    } catch {
      setSaveMsg("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "EXCLUIR") return;

    setDeleting(true);
    try {
      const res = await fetch("/api/auth/account", {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        logout();
        router.push("/register");
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir conta");
      }
    } catch {
      alert("Erro ao excluir conta");
    } finally {
      setDeleting(false);
    }
  }

  async function handleChangePassword() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setPasswordMsg("Preencha todos os campos");
      return;
    }
    if (novaSenha.length < 6) {
      setPasswordMsg("Nova senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setPasswordMsg("Nova senha e confirmação não coincidem");
      return;
    }

    setSavingPassword(true);
    setPasswordMsg("");

    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });

      if (res.ok) {
        setPasswordMsg("Senha alterada com sucesso!");
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmarSenha("");
        setTimeout(() => setPasswordMsg(""), 3000);
      } else {
        const data = await res.json();
        setPasswordMsg(data.error || "Erro ao alterar senha");
      }
    } catch {
      setPasswordMsg("Erro ao alterar senha");
    } finally {
      setSavingPassword(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const STATUS_MAP: Record<string, string> = {
    concluida: "Concluída",
    agendada: "Agendada",
    em_andamento: "Em Andamento",
    cancelada: "Cancelada",
  };

  return (
    <div className="p-8 sm:p-12 lg:p-16 w-full max-w-[1200px] mx-auto min-h-screen">
      <header className="mb-10">
        <h1 className="text-[28px] lg:text-[32px] text-primary font-bold mb-1">
          Configurações
        </h1>
        <p className="text-on-surface-variant text-[14px]">
          Gerencie seu perfil e preferências
        </p>
      </header>

      {/* Profile Section */}
      <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 mb-8">
        <h2 className="text-[17px] font-semibold text-primary mb-6">Perfil</h2>

        <div className="flex items-center gap-6 mb-8">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center overflow-hidden">
              {avatarUrl || user?.avatar_url ? (
                <img
                  src={avatarUrl || user?.avatar_url || ""}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[24px] font-bold text-primary">
                  {nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-[20px]">
                {uploading ? "progress_activity" : "photo_camera"}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="flex-1">
            <p className="text-[14px] font-medium text-primary mb-1">
              Foto de perfil
            </p>
            <p className="text-[12px] text-on-surface-variant/60">
              JPG, PNG ou WebP. Máximo 5MB.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
              Nome completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-primary focus:outline-none focus:border-primary/30 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-primary focus:outline-none focus:border-primary/30 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleSaveProfile}
            disabled={saving || !nome.trim()}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-xl text-[13px] font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
          {saveMsg && (
            <span
              className={`text-[13px] ${
                saveMsg.includes("sucesso") ? "text-green-600" : "text-red-500"
              }`}
            >
              {saveMsg}
            </span>
          )}
        </div>
      </section>

      {/* Password Section */}
      <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 mb-8">
        <h2 className="text-[17px] font-semibold text-primary mb-6">Alterar Senha</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
              Senha atual
            </label>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/30 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
              Nova senha
            </label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/30 transition-colors"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
            Confirmar nova senha
          </label>
          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            placeholder="Repita a nova senha"
            className="w-full max-w-xs px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleChangePassword}
            disabled={savingPassword || !senhaAtual || !novaSenha || !confirmarSenha}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-xl text-[13px] font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {savingPassword ? "Alterando..." : "Alterar senha"}
          </button>
          {passwordMsg && (
            <span
              className={`text-[13px] ${
                passwordMsg.includes("sucesso") ? "text-green-600" : "text-red-500"
              }`}
            >
              {passwordMsg}
            </span>
          )}
        </div>
      </section>

      {/* Transactions Section */}
      <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[17px] font-semibold text-primary">
            Histórico de Transações
          </h2>
          <span className="text-[13px] font-medium text-on-surface-variant">
            Total: R$ {totalSpent.toFixed(2)}
          </span>
        </div>

        {loadingTransactions ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-[13px] text-on-surface-variant/50 py-8 text-center">
            Nenhuma transação registrada.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left text-[12px] font-medium text-on-surface-variant/60 pb-3">
                    Sessão
                  </th>
                  <th className="text-left text-[12px] font-medium text-on-surface-variant/60 pb-3">
                    Mentor
                  </th>
                  <th className="text-left text-[12px] font-medium text-on-surface-variant/60 pb-3">
                    Data
                  </th>
                  <th className="text-left text-[12px] font-medium text-on-surface-variant/60 pb-3">
                    Status
                  </th>
                  <th className="text-right text-[12px] font-medium text-on-surface-variant/60 pb-3">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-outline-variant/10 last:border-0">
                    <td className="py-3">
                      <p className="text-[13px] font-medium text-primary">{t.title}</p>
                      <p className="text-[11px] text-on-surface-variant/50">{t.area}</p>
                    </td>
                    <td className="py-3 text-[13px] text-on-surface-variant">
                      {t.mentorName}
                    </td>
                    <td className="py-3 text-[13px] text-on-surface-variant">
                      {formatDate(t.dateTime)}
                    </td>
                    <td className="py-3">
                      <span className="text-[12px] font-medium text-on-surface-variant/70">
                        {STATUS_MAP[t.status] || t.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-[13px] font-medium text-primary">
                      R$ {t.valor.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Danger Zone */}
      <section className="border border-red-200 rounded-2xl p-6 sm:p-8">
        <h2 className="text-[17px] font-semibold text-red-600 mb-2">
          Zona de Perigo
        </h2>
        <p className="text-[13px] text-on-surface-variant/60 mb-6">
          Excluir sua conta é uma ação irreversível. Todos os seus dados, sessões
          e histórico serão permanentemente removidos.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-2.5 border border-red-300 text-red-600 rounded-xl text-[13px] font-semibold hover:bg-red-50 transition-colors"
          >
            Excluir minha conta
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-[13px] text-on-surface-variant">
              Digite <span className="font-bold text-red-600">EXCLUIR</span> para
              confirmar:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="EXCLUIR"
              className="w-full max-w-xs px-4 py-3 bg-surface-container-low border border-red-200 rounded-xl text-[14px] text-primary focus:outline-none focus:border-red-400 transition-colors"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "EXCLUIR" || deleting}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Excluindo..." : "Confirmar exclusão"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="px-6 py-2.5 text-on-surface-variant text-[13px] font-medium hover:opacity-60 transition-opacity"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
