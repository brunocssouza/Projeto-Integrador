"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { validateEmail, validatePhone, validateName, formatPhone, validateCpf, formatCpf, validatePassword } from "@/lib/validation";

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

  const steps = [
    { title: "Criar conta", subtitle: "Comece com seu e-mail", fields: ["email"] },
    { title: "Seus dados", subtitle: "Informações pessoais", fields: ["cpf", "name", "phone"] },
    { title: "Seu perfil", subtitle: "Escolha seu modo de participação", fields: ["role", "languages"] },
    { title: "Definir senha", subtitle: "Último passo", fields: ["password", "confirmPassword"] },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const isValid = await validateStep();
    if (!isValid) return;

    setIsLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          cpf: userData.cpf.replace(/\D/g, ""),
          name: userData.name,
          phone: userData.phone,
          password: userData.password,
          role: userData.role,
          languages: userData.languages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Erro ao registrar");
        return;
      }

      setSuccessMessage("Cadastro realizado com sucesso! Redirecionando para o login...");
      setTimeout(() => router.push("/login"), 2000);
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
        <Link
          href="/"
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
          <p className="text-on-surface-variant text-[14px]">
            {currentStepData.subtitle}
          </p>
        </div>

        {successMessage ? (
          <div className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-green-600 text-[32px]">check_circle</span>
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
                  errors.email
                    ? "border-red-400"
                    : "border-outline-variant/40"
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
                    errors.cpf
                      ? "border-red-400"
                      : "border-outline-variant/40"
                  }`}
                  placeholder="000.000.000-00"
                />
                {errors.cpf && (
                  <p className="text-red-500 text-[12px] mt-1.5">{errors.cpf}</p>
                )}
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
                    errors.name
                      ? "border-red-400"
                      : "border-outline-variant/40"
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
                    errors.phone
                      ? "border-red-400"
                      : "border-outline-variant/40"
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
                    { value: "aluno", label: "Aluno", desc: "Praticar entrevistas com mentores experientes" },
                    { value: "mentor", label: "Mentor", desc: "Ajudar outros profissionais a se prepararem" },
                    { value: "ambos", label: "Ambos", desc: "Ser aluno e mentor ao mesmo tempo" },
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
                    errors.password
                      ? "border-red-400"
                      : "border-outline-variant/40"
                  }`}
                  placeholder="Mín. 6 caracteres, 1 letra e 1 número"
                />
                {errors.password && (
                  <p className="text-red-500 text-[12px] mt-1.5">
                    {errors.password}
                  </p>
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
                    errors.confirmPassword
                      ? "border-red-400"
                      : "border-outline-variant/40"
                  }`}
                  placeholder="Repita a senha"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-[12px] mt-1.5">
                    {errors.confirmPassword}
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
