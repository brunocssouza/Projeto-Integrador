"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { useAuth } from "@/contexts/AuthContext";

const AVAILABLE_TECHNOLOGIES = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js",
  "Python", "Java", "C#", "Go", "Rust",
  "PostgreSQL", "MySQL", "MongoDB", "Redis",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes",
  "Power Automate", "RPA", "LLMs", "AI/ML",
];

export default function MentorSetupPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [setupData, setSetupData] = useState({
    cargo: "",
    empresa: "",
    descricao: "",
    experiencia: "",
    preco: "",
    tecnologias: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
      });
    });
    return () => ctx.revert();
  }, []);

  const steps = [
    { title: "Informações Profissionais", subtitle: "Seu cargo e empresa atual" },
    { title: "Sobre Você", subtitle: "Conte sua experiência e abordagem" },
    { title: "Preço e Tecnologias", subtitle: "Valores e suas especialidades" },
  ];

  const toggleTecnologia = (tech: string) => {
    setSetupData((prev) => {
      const techs = prev.tecnologias.includes(tech)
        ? prev.tecnologias.filter((t) => t !== tech)
        : [...prev.tecnologias, tech];
      return { ...prev, tecnologias: techs };
    });
    if (errors.tecnologias) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.tecnologias;
        return next;
      });
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 0:
        if (!setupData.cargo) newErrors.cargo = "Cargo é obrigatório";
        break;
      case 1:
        if (!setupData.descricao) newErrors.descricao = "Descrição é obrigatória";
        if (setupData.descricao.length > 0 && setupData.descricao.length < 30)
          newErrors.descricao = "Mínimo de 30 caracteres";
        break;
      case 2:
        if (!setupData.preco) newErrors.preco = "Preço é obrigatório";
        if (setupData.preco && parseFloat(setupData.preco) < 0)
          newErrors.preco = "Preço deve ser positivo";
        if (setupData.tecnologias.length === 0)
          newErrors.tecnologias = "Selecione pelo menos uma tecnologia";
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/v1/mentors/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(setupData),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Erro ao salvar");
        return;
      }

      updateUser({ perfil_mentor_completo: true });
      router.push("/dashboard");
    } catch {
      setServerError("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center px-6">
      <div ref={containerRef} className="w-full max-w-[480px]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 no-underline mb-12 mx-auto w-fit"
        >
          <div className="w-8 h-8 border border-primary rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[14px]">
              rocket_launch
            </span>
          </div>
          <span className="text-[16px] font-semibold text-primary">
            Mock Mentor
          </span>
        </Link>

        <div className="flex justify-center mb-10">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-[3px] w-8 rounded-full transition-colors duration-300 ${
                  index <= step ? "bg-orange-500" : "bg-outline-variant/40"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="font-headline-lg text-[28px] text-primary font-bold mb-1.5">
            {steps[step].title}
          </h1>
          <p className="text-on-surface-variant text-[14px]">
            {steps[step].subtitle}
          </p>
        </div>

        <div className="min-h-[200px]">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                  Cargo
                </label>
                <input
                  type="text"
                  value={setupData.cargo}
                  onChange={(e) => setSetupData((p) => ({ ...p, cargo: e.target.value }))}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] text-on-surface focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 ${
                    errors.cargo ? "border-red-400" : "border-outline-variant/40"
                  }`}
                  placeholder="ex: Backend Engineer"
                />
                {errors.cargo && <p className="text-red-500 text-[12px] mt-1.5">{errors.cargo}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                  Empresa <span className="text-on-surface-variant/40">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={setupData.empresa}
                  onChange={(e) => setSetupData((p) => ({ ...p, empresa: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-outline-variant/40 rounded-xl text-[14px] text-on-surface focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all placeholder:text-on-surface-variant/30"
                  placeholder="ex: Google Brasil"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                  Sobre você
                </label>
                <textarea
                  value={setupData.descricao}
                  onChange={(e) => setSetupData((p) => ({ ...p, descricao: e.target.value }))}
                  rows={4}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] text-on-surface focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 resize-none ${
                    errors.descricao ? "border-red-400" : "border-outline-variant/40"
                  }`}
                  placeholder="Conte sua abordagem de mentoria e o que os alunos podem esperar..."
                />
                {errors.descricao && <p className="text-red-500 text-[12px] mt-1.5">{errors.descricao}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                  Experiência profissional <span className="text-on-surface-variant/40">(opcional)</span>
                </label>
                <textarea
                  value={setupData.experiencia}
                  onChange={(e) => setSetupData((p) => ({ ...p, experiencia: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-outline-variant/40 rounded-xl text-[14px] text-on-surface focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 resize-none"
                  placeholder="Ex: 10 anos de experiência em desenvolvimento full-stack..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                  Preço por sessão (BRL)
                </label>
                <input
                  type="number"
                  value={setupData.preco}
                  onChange={(e) => setSetupData((p) => ({ ...p, preco: e.target.value }))}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] text-on-surface focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 ${
                    errors.preco ? "border-red-400" : "border-outline-variant/40"
                  }`}
                  placeholder="ex: 150"
                  min="0"
                  step="0.01"
                />
                {errors.preco && <p className="text-red-500 text-[12px] mt-1.5">{errors.preco}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
                  Tecnologias
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TECHNOLOGIES.map((tech) => (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTecnologia(tech)}
                      className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-all ${
                        setupData.tecnologias.includes(tech)
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-outline-variant/40 bg-white text-on-surface-variant hover:border-outline-variant"
                      }`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
                {errors.tecnologias && <p className="text-red-500 text-[12px] mt-1.5">{errors.tecnologias}</p>}
              </div>
            </div>
          )}
        </div>

        {serverError && (
          <p className="text-red-500 text-[12px] text-center mt-4">{serverError}</p>
        )}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-3 border border-outline-variant/40 rounded-full text-[14px] font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              Voltar
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-full text-[14px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : step === steps.length - 1 ? (
              "Finalizar"
            ) : (
              "Continuar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
