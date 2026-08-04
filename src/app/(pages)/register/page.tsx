"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  validateEmail,
  validatePhone,
  validateName,
  formatPhone,
  validateCpf,
  formatCpf,
  validatePassword,
} from "@/lib/validation";

const AVAILABLE_LANGUAGES = [
  { id: 1, name: "Português", sigla: "PT" },
  { id: 2, name: "Inglês", sigla: "EN" },
  { id: 3, name: "Espanhol", sigla: "ES" },
  { id: 4, name: "Francês", sigla: "FR" },
  { id: 5, name: "Alemão", sigla: "DE" },
  { id: 6, name: "Italiano", sigla: "IT" },
  { id: 7, name: "Japonês", sigla: "JA" },
  { id: 8, name: "Mandarim", sigla: "ZH" },
];

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

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    email: "",
    cpf: "",
    name: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "",
    languages: [] as string[],
  });
  const [mentorProfile, setMentorProfile] = useState({
    title: "",
    company: "",
    description: "",
    professionalExperience: "",
    pricePerSession: "",
    technologies: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

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

  const isMentorApplicant = userData.role === "mentor";
  const steps = [
    { title: "Criar conta", subtitle: "Comece com seu e-mail", fields: ["email"] },
    { title: "Seus dados", subtitle: "Informações pessoais", fields: ["cpf", "name", "phone"] },
    {
      title: "Seu perfil",
      subtitle: "Escolha seu modo de participação",
      fields: ["role", "languages"],
    },
    { title: "Definir senha", subtitle: "Último passo", fields: ["password", "confirmPassword"] },
    ...(isMentorApplicant
      ? [
          {
            title: "Perfil de Mentor",
            subtitle: "Conte sobre sua atuação",
            fields: ["mentorProfile"],
          },
        ]
      : []),
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === "phone") finalValue = formatPhone(value);
    else if (name === "cpf") finalValue = formatCpf(value);
    setUserData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const toggleLanguage = (sigla: string) => {
    setUserData((prev) => {
      const langs = prev.languages.includes(sigla)
        ? prev.languages.filter((l) => l !== sigla)
        : [...prev.languages, sigla];
      return { ...prev, languages: langs };
    });
    if (errors.languages) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.languages;
        return next;
      });
    }
  };

  const validateStep = async () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0:
        if (!userData.email) {
          newErrors.email = "Email é obrigatório";
        } else if (!validateEmail(userData.email)) {
          newErrors.email = "Email inválido";
        } else {
          // Email validation happens at final submit via the register API
        }
        break;
      case 1:
        if (!userData.cpf) {
          newErrors.cpf = "CPF é obrigatório";
        } else if (!validateCpf(userData.cpf)) {
          newErrors.cpf = "CPF inválido";
        }
        if (!userData.name) {
          newErrors.name = "Nome é obrigatório";
        } else if (!validateName(userData.name)) {
          newErrors.name = "Nome inválido (mínimo 2 caracteres, sem números)";
        }
        if (!userData.phone) {
          newErrors.phone = "Telefone é obrigatório";
        } else if (!validatePhone(userData.phone)) {
          newErrors.phone = "Formato: (DDD) 99999-9999";
        }
        break;
      case 2:
        if (!userData.role) newErrors.role = "Selecione um modo de participação";
        if (userData.languages.length === 0) newErrors.languages = "Selecione pelo menos um idioma";
        break;
      case 3:
        const passwordError = validatePassword(userData.password);
        if (passwordError) {
          newErrors.password = passwordError;
        }
        if (userData.password !== userData.confirmPassword) {
          newErrors.confirmPassword = "Senhas não coincidem";
        }
        break;
      case 4:
        if (!mentorProfile.title) newErrors["mentorProfile.title"] = "Cargo é obrigatório";
        if (!mentorProfile.description || mentorProfile.description.length < 30)
          newErrors["mentorProfile.description"] = "Descrição obrigatória (mín. 30 caracteres)";
        if (!mentorProfile.pricePerSession || Number(mentorProfile.pricePerSession) < 0)
          newErrors["mentorProfile.pricePerSession"] = "Preço inválido";
        if (mentorProfile.technologies.length === 0)
          newErrors["mentorProfile.technologies"] = "Selecione ao menos uma tecnologia";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const isValid = await validateStep();
    if (!isValid) return;

    setIsLoading(true);
    setServerError("");
    setErrors({});
    try {
      const isStudent = userData.role === "aluno";
      const isMentor = userData.role === "mentor";
      const body: Record<string, unknown> = {
        email: userData.email,
        cpf: userData.cpf,
        name: userData.name,
        phone: userData.phone,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        isStudent,
        isMentor,
        languages: userData.languages,
      };
      if (isMentor) {
        body.mentorProfile = {
          title: mentorProfile.title,
          company: mentorProfile.company || undefined,
          description: mentorProfile.description,
          professionalExperience: mentorProfile.professionalExperience || undefined,
          pricePerSession: Number(mentorProfile.pricePerSession),
          technologies: mentorProfile.technologies,
        };
      }
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "VALIDATION_ERROR" && data.details) {
          const fieldLabels: Record<string, string> = {
            email: "Email",
            cpf: "CPF",
            name: "Nome",
            phone: "Telefone",
            password: "Senha",
            confirmPassword: "Confirmar senha",
            isStudent: "Tipo de conta",
            isMentor: "Tipo de conta",
            languages: "Idiomas",
            "mentorProfile.title": "Cargo",
            "mentorProfile.description": "Descrição",
            "mentorProfile.pricePerSession": "Preço",
            "mentorProfile.technologies": "Tecnologias",
            mentorProfile: "Perfil do mentor",
          };
          const fieldErrors: Record<string, string> = {};
          const messages: string[] = [];
          for (const [field, msgs] of Object.entries(data.details as Record<string, unknown>)) {
            const msg = Array.isArray(msgs) ? msgs[0] : String(msgs);
            if (msg) {
              fieldErrors[field] = msg;
              const label = fieldLabels[field] || field;
              messages.push(`${label}: ${msg}`);
            }
          }
          setErrors(fieldErrors);
          setServerError(messages.length ? messages.join(" · ") : "Dados inválidos");
        } else {
          setServerError(data.error || "Erro ao registrar");
        }
        return;
      }

      if (isMentor && !isStudent) {
        setSuccessMessage(
          "Cadastro enviado! Seu perfil de mentor está em análise (até 3 dias úteis). Você receberá a resposta por e-mail."
        );
      } else {
        setSuccessMessage("Cadastro realizado com sucesso! Redirecionando para o login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setServerError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    setErrors({});
    setServerError("");
    const isValid = await validateStep();
    if (!isValid) return;
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else handleSubmit();
  };

  const handlePrevious = () => {
    setErrors({});
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center px-6">
      <div ref={containerRef} className="w-full max-w-[380px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline mb-12 mx-auto w-fit">
          <span className="text-[16px] font-semibold text-primary">Mock Mentor</span>
        </Link>

        {/* Progress */}
        <div className="flex justify-center mb-10">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-[3px] w-8 rounded-full transition-colors duration-300 ${
                  index <= currentStep ? "bg-orange-500" : "bg-outline-variant/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-headline-lg text-[28px] text-primary font-bold mb-1.5">
            {currentStepData.title}
          </h1>
          <p className="text-on-surface-variant text-[14px]">{currentStepData.subtitle}</p>
        </div>

        {successMessage ? (
          <div className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-green-600 text-[32px]">
                check_circle
              </span>
            </div>
            <h2 className="text-[20px] font-bold text-primary mb-2">Cadastro realizado!</h2>
            <p className="text-green-700 text-[14px]">Redirecionando para o login...</p>
          </div>
        ) : (
          <>
            {/* Form Steps */}
            <div className="min-h-[200px]">
              {currentStep === 0 && (
                <div>
                  <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] text-on-surface focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 ${
                      errors.email ? "border-red-400" : "border-outline-variant/40"
                    }`}
                    placeholder="seu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[12px] mt-1.5">{errors.email}</p>
                  )}
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                      CPF
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={userData.cpf}
                      onChange={handleInputChange}
                      maxLength={14}
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] text-on-surface focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 ${
                        errors.cpf ? "border-red-400" : "border-outline-variant/40"
                      }`}
                      placeholder="000.000.000-00"
                    />
                    {errors.cpf && <p className="text-red-500 text-[12px] mt-1.5">{errors.cpf}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={userData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] text-on-surface focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 ${
                        errors.name ? "border-red-400" : "border-outline-variant/40"
                      }`}
                      placeholder="Seu nome"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-[12px] mt-1.5">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      maxLength={16}
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] text-on-surface focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 ${
                        errors.phone ? "border-red-400" : "border-outline-variant/40"
                      }`}
                      placeholder="(11) 99999-0000"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-[12px] mt-1.5">{errors.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
                      Como você quer participar?
                    </label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        {
                          value: "aluno",
                          label: "Aluno",
                          desc: "Praticar entrevistas com mentores experientes",
                        },
                        {
                          value: "mentor",
                          label: "Mentor",
                          desc: "Ajudar outros profissionais a se prepararem",
                        },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setUserData((prev) => ({ ...prev, role: option.value }));
                            if (errors.role) {
                              setErrors((prev) => {
                                const next = { ...prev };
                                delete next.role;
                                return next;
                              });
                            }
                          }}
                          className={`w-full text-left px-4 py-3.5 border rounded-xl text-[14px] transition-all ${
                            userData.role === option.value
                              ? "border-orange-500 bg-orange-500/5 text-on-surface"
                              : "border-outline-variant/40 bg-white text-on-surface-variant hover:border-outline-variant"
                          }`}
                        >
                          <span className="font-medium block">{option.label}</span>
                          <span className="text-[12px] text-on-surface-variant/70 mt-0.5 block">
                            {option.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                    {errors.role && (
                      <p className="text-red-500 text-[12px] mt-1.5">{errors.role}</p>
                    )}
                    {userData.role === "aluno" && (
                      <p className="text-[12px] text-on-surface-variant/60 mt-2 flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-orange-500">
                          info
                        </span>
                        <span>
                          Você poderá se tornar mentor depois, nas configurações da sua conta.
                        </span>
                      </p>
                    )}
                    {userData.role === "mentor" && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-amber-600">
                          schedule
                        </span>
                        <p className="text-[12px] text-amber-700">
                          Seu cadastro passará por análise do administrador e pode levar até
                          <strong> 3 dias úteis</strong>. Você não poderá acessar a plataforma até a
                          aprovação.
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
                      Idiomas que você domina
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_LANGUAGES.map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => toggleLanguage(lang.sigla)}
                          className={`px-3.5 py-2 rounded-full text-[13px] font-medium border transition-all ${
                            userData.languages.includes(lang.sigla)
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-outline-variant/40 bg-white text-on-surface-variant hover:border-outline-variant"
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                    {errors.languages && (
                      <p className="text-red-500 text-[12px] mt-1.5">{errors.languages}</p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                      Senha
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={userData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] text-on-surface focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 ${
                        errors.password ? "border-red-400" : "border-outline-variant/40"
                      }`}
                      placeholder="Mín. 6 caracteres, 1 letra e 1 número"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-[12px] mt-1.5">{errors.password}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                      Confirmar senha
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={userData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] text-on-surface focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all placeholder:text-on-surface-variant/30 ${
                        errors.confirmPassword ? "border-red-400" : "border-outline-variant/40"
                      }`}
                      placeholder="Repita a senha"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-[12px] mt-1.5">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 mb-1">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">
                      schedule
                    </span>
                    <p className="text-[12px] text-amber-700">
                      Este perfil será analisado pelo administrador (até 3 dias úteis) antes de você
                      poder acessar a plataforma.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                      Cargo / Especialidade
                    </label>
                    <input
                      type="text"
                      value={mentorProfile.title}
                      onChange={(e) => setMentorProfile((p) => ({ ...p, title: e.target.value }))}
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] outline-none focus:border-orange-500 ${errors["mentorProfile.title"] ? "border-red-400" : "border-outline-variant/40"}`}
                      placeholder="ex: Senior Frontend Engineer"
                    />
                    {errors["mentorProfile.title"] && (
                      <p className="text-red-500 text-[12px] mt-1.5">
                        {errors["mentorProfile.title"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                      Empresa (opcional)
                    </label>
                    <input
                      type="text"
                      value={mentorProfile.company}
                      onChange={(e) => setMentorProfile((p) => ({ ...p, company: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-outline-variant/40 rounded-xl text-[14px] outline-none focus:border-orange-500"
                      placeholder="ex: Acme Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                      Descrição
                    </label>
                    <textarea
                      value={mentorProfile.description}
                      onChange={(e) =>
                        setMentorProfile((p) => ({ ...p, description: e.target.value }))
                      }
                      rows={4}
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] outline-none focus:border-orange-500 resize-none ${errors["mentorProfile.description"] ? "border-red-400" : "border-outline-variant/40"}`}
                      placeholder="Conte sua experiência e abordagem como mentor (mín. 30 caracteres)"
                    />
                    {errors["mentorProfile.description"] && (
                      <p className="text-red-500 text-[12px] mt-1.5">
                        {errors["mentorProfile.description"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                      Preço por sessão (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={mentorProfile.pricePerSession}
                      onChange={(e) =>
                        setMentorProfile((p) => ({ ...p, pricePerSession: e.target.value }))
                      }
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] outline-none focus:border-orange-500 ${errors["mentorProfile.pricePerSession"] ? "border-red-400" : "border-outline-variant/40"}`}
                      placeholder="ex: 150.00"
                    />
                    {errors["mentorProfile.pricePerSession"] && (
                      <p className="text-red-500 text-[12px] mt-1.5">
                        {errors["mentorProfile.pricePerSession"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-on-surface-variant mb-2">
                      Tecnologias
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {MENTOR_TECHS.map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() =>
                            setMentorProfile((p) => ({
                              ...p,
                              technologies: p.technologies.includes(tech)
                                ? p.technologies.filter((t) => t !== tech)
                                : [...p.technologies, tech],
                            }))
                          }
                          className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
                            mentorProfile.technologies.includes(tech)
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-outline-variant/40 bg-white text-on-surface-variant"
                          }`}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                    {errors["mentorProfile.technologies"] && (
                      <p className="text-red-500 text-[12px] mt-1.5">
                        {errors["mentorProfile.technologies"]}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {serverError && (
              <p className="text-red-500 text-[12px] text-center mt-4">{serverError}</p>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
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
                    Processando...
                  </>
                ) : currentStep === steps.length - 1 ? (
                  "Finalizar"
                ) : (
                  "Continuar"
                )}
              </button>
            </div>

            {/* Footer */}
            <p className="text-center mt-8 text-[13px] text-on-surface-variant">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="text-orange-500 font-semibold hover:opacity-60 transition-opacity"
              >
                Faça login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
