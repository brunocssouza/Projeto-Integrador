"use client";

import { useState, useEffect } from "react";

interface MentorStats {
  profile: {
    cargo: string;
    empresa: string;
    descricao: string;
    experiencia: string;
    precoPorSessao: number;
    videoApresentacaoUrl: string | null;
  };
  stats: {
    total: number;
    concluidas: number;
    rating: number;
    reviewCount: number;
  };
  canRecordVideo: boolean;
}

export default function MentorConfiguracoesPage() {
  const [data, setData] = useState<MentorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [cargo, setCargo] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [descricao, setDescricao] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [preco, setPreco] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    fetch("/api/mentors/stats", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const d = await res.json();
          setData(d);
          setCargo(d.profile.cargo || "");
          setEmpresa(d.profile.empresa || "");
          setDescricao(d.profile.descricao || "");
          setExperiencia(d.profile.experiencia || "");
          setPreco(String(d.profile.precoPorSessao || ""));
          setVideoUrl(d.profile.videoApresentacaoUrl || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveMsg("");

    const body: Record<string, string | number | null> = {};
    if (cargo !== data?.profile.cargo) body.cargo = cargo;
    if (empresa !== data?.profile.empresa) body.empresa = empresa;
    if (descricao !== data?.profile.descricao) body.descricao = descricao;
    if (experiencia !== data?.profile.experiencia) body.experiencia = experiencia;
    if (Number(preco) !== data?.profile.precoPorSessao) body.precoPorSessao = Number(preco);
    if (videoUrl !== (data?.profile.videoApresentacaoUrl || "")) body.videoApresentacao = videoUrl || null;

    if (Object.keys(body).length === 0) {
      setSaveMsg("Nenhuma alteração para salvar.");
      setTimeout(() => setSaveMsg(""), 3000);
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/mentors/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSaveMsg("Perfil atualizado com sucesso!");
        setData((prev) =>
          prev
            ? {
                ...prev,
                profile: {
                  ...prev.profile,
                  cargo,
                  empresa,
                  descricao,
                  experiencia,
                  precoPorSessao: Number(preco),
                  videoApresentacaoUrl: videoUrl || null,
                },
              }
            : prev
        );
        setTimeout(() => setSaveMsg(""), 3000);
      } else {
        const err = await res.json();
        setSaveMsg(err.error || "Erro ao salvar");
      }
    } catch {
      setSaveMsg("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-16 w-full max-w-[1200px] mx-auto min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 sm:p-12 lg:p-16 w-full max-w-[1200px] mx-auto min-h-screen">
      <header className="mb-10">
        <h1 className="text-[28px] lg:text-[32px] text-primary font-bold mb-1">
          Configurações do Mentor
        </h1>
        <p className="text-on-surface-variant text-[14px]">
          Gerencie seu perfil profissional e configurações de sessão
        </p>
      </header>

      {/* Profile Stats */}
      <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 mb-8">
        <h2 className="text-[17px] font-semibold text-primary mb-6">
          Resumo do Perfil
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface-container-low rounded-xl p-4">
            <p className="text-[12px] text-on-surface-variant/60 mb-1">Sessões totais</p>
            <p className="text-[22px] font-bold text-primary">{data?.stats.total || 0}</p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-4">
            <p className="text-[12px] text-on-surface-variant/60 mb-1">Concluídas</p>
            <p className="text-[22px] font-bold text-primary">{data?.stats.concluidas || 0}</p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-4">
            <p className="text-[12px] text-on-surface-variant/60 mb-1">Avaliação</p>
            <p className="text-[22px] font-bold text-orange-500">
              {data?.stats.rating || 0}
              <span className="text-[13px] text-on-surface-variant/50 ml-1">
                ({data?.stats.reviewCount || 0})
              </span>
            </p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-4">
            <p className="text-[12px] text-on-surface-variant/60 mb-1">Preço/sessão</p>
            <p className="text-[22px] font-bold text-primary">
              R$ {data?.profile.precoPorSessao || 0}
            </p>
          </div>
        </div>
      </section>

      {/* Professional Data */}
      <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 mb-8">
        <h2 className="text-[17px] font-semibold text-primary mb-6">
          Dados Profissionais
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
              Cargo / Especialidade
            </label>
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ex: Engenheiro de Software"
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/30 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
              Empresa / Organização
            </label>
            <input
              type="text"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              placeholder="Ex: Google, Meta, startups"
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/30 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
              Preço por sessão (R$)
            </label>
            <input
              type="number"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="Ex: 80"
              min="0"
              step="5"
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/30 transition-colors"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
            Sobre mim
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Conte um pouco sobre sua trajetória profissional e áreas de especialização..."
            rows={4}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/30 transition-colors resize-y min-h-[100px]"
          />
        </div>

        <div className="mt-6">
          <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
            Experiência Profissional
          </label>
          <textarea
            value={experiencia}
            onChange={(e) => setExperiencia(e.target.value)}
            placeholder="Descreva suas experiências anteriores, empresas onde trabalhou, projetos relevantes..."
            rows={5}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/30 transition-colors resize-y min-h-[120px]"
          />
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
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

      {/* Video Introduction */}
      <section className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-[17px] font-semibold text-primary">
            Vídeo de Apresentação
          </h2>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              data?.canRecordVideo
                ? "bg-green-50 text-green-600"
                : "bg-surface-container-low text-on-surface-variant/50"
            }`}
          >
            {data?.canRecordVideo ? "Disponível" : `${20 - (data?.stats.concluidas || 0)} sessões para desbloquear`}
          </span>
        </div>

        {data?.canRecordVideo ? (
          <p className="text-[13px] text-on-surface-variant/60 mb-6">
            Adicione um vídeo curto (30-60s) apresentando-se como mentor. Alunos
            que veem vídeos de mentores conversam 40% mais.
          </p>
        ) : (
          <p className="text-[13px] text-on-surface-variant/60 mb-6">
            Complete {20 - (data?.stats.concluidas || 0)} sessão(ões) para desbloquear
            a gravação de vídeo de apresentação. Mantenha um bom desempenho para
            atrair mais alunos.
          </p>
        )}

        <div>
          <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
            URL do vídeo (YouTube, Vimeo ou link direto)
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            disabled={!data?.canRecordVideo}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-primary placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {data?.canRecordVideo && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 px-6 py-2.5 bg-orange-500 text-white rounded-xl text-[13px] font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar vídeo"}
          </button>
        )}
      </section>
    </div>
  );
}
