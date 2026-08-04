"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const MENTOR_TECHS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "Go",
  "Rust",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Power Automate",
  "RPA",
  "LLMs",
  "AI/ML",
];

interface MentorApplyProps {
  onApplied?: () => void;
}

export default function MentorOptIn({ onApplied }: MentorApplyProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    professionalExperience: "",
    pricePerSession: "",
    technologies: [] as string[],
  });

  const loadStatus = () => {
    fetch("/api/v1/mentors/apply", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setStatus(d.status ?? null);
        setReason(d.rejection_reason ?? null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // Only show for students who aren't yet mentors.
  if (!user || !user.is_aluno || user.is_mentor) return null;

  const submit = async () => {
    setError("");
    if (!form.title) return setError("Cargo é obrigatório");
    if (!form.description || form.description.length < 30)
      return setError("Descrição deve ter no mínimo 30 caracteres");
    if (!form.pricePerSession || Number(form.pricePerSession) < 0)
      return setError("Preço inválido");
    if (form.technologies.length === 0) return setError("Selecione ao menos uma tecnologia");

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/mentors/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          company: form.company || undefined,
          description: form.description,
          professionalExperience: form.professionalExperience || undefined,
          pricePerSession: Number(form.pricePerSession),
          technologies: form.technologies,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao enviar");
        return;
      }
      setShowForm(false);
      loadStatus();
      onApplied?.();
    } catch {
      setError("Erro de conexão");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-outline-variant/40 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <span className="material-symbols-outlined text-[22px] text-orange-500">person_add</span>
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-primary">Tornar-se Mentor</h3>
          <p className="text-[12px] text-on-surface-variant">
            Compartilhe seu conhecimento ajudando outros profissionais
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : status === "pending" ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-amber-600">schedule</span>
          <p className="text-[13px] text-amber-700">
            Solicitação em análise. Pode levar até <strong>3 dias úteis</strong>.
          </p>
        </div>
      ) : status === "approved" ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-green-600">check_circle</span>
          <p className="text-[13px] text-green-700">
            Você foi aprovado como mentor! Acesse a área de mentor.
          </p>
        </div>
      ) : status === "rejected" ? (
        <div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 mb-3">
            <span className="material-symbols-outlined text-[18px] text-red-500">cancel</span>
            <div>
              <p className="text-[13px] text-red-700 font-medium">Sua solicitação foi recusada.</p>
              {reason && <p className="text-[12px] text-red-600/80 mt-0.5">Motivo: {reason}</p>}
            </div>
          </div>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-[14px] transition-colors"
            >
              Reenviar solicitação
            </button>
          ) : (
            <MentorForm
              form={form}
              setForm={setForm}
              error={error}
              submitting={submitting}
              onSubmit={submit}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      ) : !showForm ? (
        <div className="text-[12px] text-on-surface-variant/70 mb-3">
          Ao se candidatar, seu perfil passará por análise do administrador (até 3 dias úteis).
        </div>
      ) : null}

      {status === null && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-[14px] transition-colors"
        >
          Candidatar-se
        </button>
      )}

      {showForm && (status === null || status === "rejected") && (
        <MentorForm
          form={form}
          setForm={setForm}
          error={error}
          submitting={submitting}
          onSubmit={submit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function MentorForm({
  form,
  setForm,
  error,
  submitting,
  onSubmit,
  onCancel,
}: {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  error: string;
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-3 mt-3">
      <div>
        <label className="block text-[12px] font-medium text-on-surface-variant mb-1">
          Cargo / Especialidade
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((p: any) => ({ ...p, title: e.target.value }))}
          className="w-full px-3 py-2 border border-outline-variant/40 rounded-lg text-[13px] outline-none focus:border-orange-500"
          placeholder="ex: Senior Frontend Engineer"
        />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-on-surface-variant mb-1">
          Empresa (opcional)
        </label>
        <input
          type="text"
          value={form.company}
          onChange={(e) => setForm((p: any) => ({ ...p, company: e.target.value }))}
          className="w-full px-3 py-2 border border-outline-variant/40 rounded-lg text-[13px] outline-none focus:border-orange-500"
        />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-on-surface-variant mb-1">
          Descrição (mín. 30 caracteres)
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p: any) => ({ ...p, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-outline-variant/40 rounded-lg text-[13px] outline-none focus:border-orange-500 resize-none"
        />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-on-surface-variant mb-1">
          Preço por sessão (R$)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.pricePerSession}
          onChange={(e) => setForm((p: any) => ({ ...p, pricePerSession: e.target.value }))}
          className="w-full px-3 py-2 border border-outline-variant/40 rounded-lg text-[13px] outline-none focus:border-orange-500"
        />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-on-surface-variant mb-2">
          Tecnologias
        </label>
        <div className="flex flex-wrap gap-1.5">
          {MENTOR_TECHS.map((tech) => (
            <button
              key={tech}
              type="button"
              onClick={() =>
                setForm((p: any) => ({
                  ...p,
                  technologies: p.technologies.includes(tech)
                    ? p.technologies.filter((t: string) => t !== tech)
                    : [...p.technologies, tech],
                }))
              }
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                form.technologies.includes(tech)
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-outline-variant/40 bg-white text-on-surface-variant"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-red-500 text-[12px]">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-[13px] font-medium border border-outline-variant/40 text-on-surface-variant"
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg text-[13px] disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar solicitação"}
        </button>
      </div>
    </div>
  );
}
