"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Referências para o GSAP
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    // gsap.context garante o cleanup automático das animações no React
    const ctx = gsap.context(() => {
      // 1. Animação do Container Principal (Surgindo de baixo)
      gsap.from(containerRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      // 2. Efeito de Zoom-out suave na imagem
      gsap.from(imageRef.current, {
        scale: 1.1,
        opacity: 0,
        duration: 1.5,
        ease: "power2.out",
        delay: 0.2,
      });

      // 3. Efeito Stagger (Cascata) nos itens do formulário
      gsap.from(".gsap-form-item", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.4,
      });
      
      // 4. Animação adicional do formulário
      gsap.from(formRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)",
        delay: 0.8,
      });
    }, containerRef);

    return () => ctx.revert(); // Cleanup no unmount
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de chamada assíncrona
    setTimeout(() => {
      setIsLoading(false);
      // window.location.href = "/dashboard";
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    // Simulação do login social
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 p-4 sm:p-6 md:p-8 font-body-md text-on-surface relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse ${Math.random() * 5 + 5}s infinite`
            }}
          />
        ))}
      </div>
      
      {/* Container Principal (Split Layout) */}
      <div
        ref={containerRef}
        className="flex w-full max-w-[1024px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden min-h-[500px] sm:min-h-[550px] border border-outline-variant/30 relative z-10"
      >
        {/* ================= LADO ESQUERDO: IMAGEM ================= */}
        <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-blue-900 to-indigo-900 overflow-hidden">
          <div ref={imageRef} className="absolute inset-0 w-full h-full">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1470&auto=format&fit=crop"
              alt="Estudante de TI focado programando em seu setup"
              fill
              className="object-cover opacity-90"
              sizes="(max-width: 1024px) 0vw, 50vw"
              priority
            />
            {/* Overlay sutil para dar contraste */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#001a3a]/80 via-transparent to-transparent"></div>
          </div>

          {/* Texto sobreposto na imagem (Opcional, dá um ar mais premium) */}
          <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 text-white z-10">
            <h2 className="font-headline-md font-bold text-[24px] mb-2 leading-tight">
              Acelere sua carreira na Tecnologia.
            </h2>
            <p className="text-white/80 text-[14px]">
              Simule entrevistas reais, em inglês, com profissionais de mercado
              e esteja pronto para as melhores vagas.
            </p>
          </div>
        </div>

        {/* ================= LADO DIREITO: FORMULÁRIO ================= */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white relative">
          {/* Header do Formulário */}
          <div className="text-center mb-8 flex justify-center flex-col items-center">
            <div className="relative mb-3 sm:mb-4">
              <Image src={"/Titulo Deslocado.png"} height={250} width={250} alt="" className="w-48 h-auto"></Image>
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <p className="gsap-form-item text-on-surface-variant text-[15px] mt-1 font-medium">
              Onde tudo começa
            </p>
          </div>

          <div ref={formRef} className="w-full max-w-[360px] sm:max-w-[380px] mx-auto space-y-5 sm:space-y-6">

            {/* Social Login Buttons */}
            <div className="gsap-form-item space-y-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 sm:py-3 px-4 bg-white border border-outline-variant rounded-xl hover:bg-gray-50 transition-all shadow-sm text-[14px] sm:text-[15px]"
              >
                <span className="material-symbols-outlined text-[20px] text-red-500">google</span>
                <span className="font-medium text-on-surface">Entrar com Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("github")}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 sm:py-3 px-4 bg-white border border-outline-variant rounded-xl hover:bg-gray-50 transition-all shadow-sm text-[14px] sm:text-[15px]"
              >
                <span className="material-symbols-outlined text-[20px] text-gray-800">github</span>
                <span className="font-medium text-on-surface">Entrar com GitHub</span>
              </button>
            </div>

            {/* Formulário Email/Senha */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Divisor */}
              <div className="gsap-form-item flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-outline-variant/40"></div>
                <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
                  Login
                </span>
                <div className="flex-1 h-px bg-outline-variant/40"></div>
              </div>
              <div className="gsap-form-item space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-[13px] font-bold text-primary"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 sm:py-3 bg-[#f3f4f6] border border-transparent rounded-xl text-on-surface focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-[13px] sm:text-[14px] placeholder:text-outline/60"
                  placeholder="aluno@senac.edu.br"
                  required
                />
              </div>

              <div className="gsap-form-item space-y-1.5">
                <div className="flex justify-between items-end">
                  <label
                    htmlFor="password"
                    className="block text-[13px] font-bold text-primary"
                  >
                    Senha
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[12px] text-outline hover:text-primary font-medium transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-[#f3f4f6] border border-transparent rounded-xl text-on-surface focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-[13px] sm:text-[14px] placeholder:text-outline/60"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none rounded-full p-1"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="gsap-form-item w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Authenticating...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Footer do Card */}
            <div className="gsap-form-item mt-6 text-center">
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-outline-variant/40"></div>
                <Link
                  href="/register"
                  className="text-[11px] font-bold text-outline hover:text-primary uppercase tracking-wider transition-colors"
                >
                  Cadastre-se aqui
                </Link>
                <div className="flex-1 h-px bg-outline-variant/40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
