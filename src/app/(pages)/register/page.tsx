"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
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
    { title: "Seus dados", subtitle: "Informacoes pessoais", fields: ["name", "phone"] },
    { title: "Sua area", subtitle: "Qual sua especialidade?", fields: ["role"] },
    { title: "Definir senha", subtitle: "Ultimo passo", fields: ["password", "confirmPassword"] },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const finalValue = name === "phone" ? formatPhone(value) : value;
    setUserData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 11 && digits[2] === "9") return true;
    if (digits.length === 10) return true;
    return false;
  };

  const validateName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 2) return false;
    if (/\d/.test(trimmed)) return false;
    return true;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0:
        if (!userData.email) {
          newErrors.email = "Email e obrigatorio";
        } else if (!validateEmail(userData.email)) {
          newErrors.email = "Email invalido";
        } else {
          const existingUsers: { email: string }[] = JSON.parse(
            localStorage.getItem("users") || "[]"
          );
          if (existingUsers.some((u) => u.email === userData.email)) {
            newErrors.email = "Este email ja esta cadastrado";
          }
        }
        break;
      case 1:
        if (!userData.name) {
          newErrors.name = "Nome e obrigatorio";
        } else if (!validateName(userData.name)) {
          newErrors.name = "Nome invalido (minimo 2 caracteres, sem numeros)";
        }
        if (!userData.phone) {
          newErrors.phone = "Telefone e obrigatorio";
        } else if (!validatePhone(userData.phone)) {
          newErrors.phone = "Formato: (DDD) 99999-9999";
        }
        break;
      case 2:
        if (!userData.role) newErrors.role = "Selecione uma area";
        break;
      case 3:
        if (!userData.password) {
          newErrors.password = "Senha e obrigatoria";
        } else if (userData.password.length < 6) {
          newErrors.password = "Minimo 6 caracteres";
        } else if (!/[a-zA-Z]/.test(userData.password)) {
          newErrors.password = "Deve conter pelo menos uma letra";
        } else if (!/\d/.test(userData.password)) {
          newErrors.password = "Deve conter pelo menos um numero";
        }
        if (userData.password !== userData.confirmPassword) {
          newErrors.confirmPassword = "Senhas nao coincidem";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const newUser = { ...userData, id: Date.now().toString() };
      existingUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(existingUsers));
      router.push("/login");
    } catch {
      alert("Erro ao registrar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
      else handleSubmit();
    }
  };

  const handlePrevious = () => {
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
            <div>
              <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">
                Area de atuacao
              </label>
              <select
                name="role"
                value={userData.role}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-[14px] text-on-surface focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all appearance-none ${
                  errors.role
                    ? "border-red-400"
                    : "border-outline-variant/40"
                }`}
              >
                <option value="">Selecione sua area</option>
                <option value="backend">Backend Developer</option>
                <option value="frontend">Frontend Developer</option>
                <option value="fullstack">Full Stack Developer</option>
                <option value="ai">AI Engineer</option>
                <option value="cloud">Cloud Architect</option>
                <option value="designer">UI/UX Designer</option>
                <option value="product">Product Manager</option>
                <option value="qa">QA Engineer</option>
                <option value="security">Security Specialist</option>
                <option value="legal">Especialista em Direito</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-[12px] mt-1.5">{errors.role}</p>
              )}
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
                  placeholder="Min. 6 caracteres, 1 letra e 1 numero"
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
          Ja tem uma conta?{" "}
          <Link
            href="/login"
            className="text-orange-500 font-semibold hover:opacity-60 transition-opacity"
          >
            Faca login
          </Link>
        </p>
      </div>
    </div>
  );
}
