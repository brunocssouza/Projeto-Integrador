"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de chamada assíncrona (Ex: autenticação via NextAuth/API)
    setTimeout(() => {
      setIsLoading(false);
      // window.location.href = "/dashboard";
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-400 p-4 relative overflow-hidden font-body-md text-on-surface">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-white border border-outline-variant/60 rounded-2xl shadow-xl p-8 sm:p-10 w-full max-w-[440px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header do Card com Contexto do Projeto */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary transition-transform hover:scale-105 hover:bg-primary/10 cursor-default">
            <span className="material-symbols-outlined text-[32px]">code</span>
          </div>
          <span className="text-orange-600 font-bold text-[12px] tracking-widest uppercase mb-1 block">
            Mock Interview Platform
          </span>
          <h1 className="font-headline-md text-primary font-bold text-[28px] tracking-tight">
            Ready to level up?
          </h1>
          <p className="text-on-surface-variant text-[15px] mt-2">
            Acesse sua conta para agendar simulações com especialistas de TI.
          </p>
        </div>

        {/* Formulário com Acessibilidade e UX */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-label-md font-bold text-primary"
            >
              Corporate E-mail
            </label>
            <div className="relative group focus-within:text-primary text-outline transition-colors">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                mail
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-label-md placeholder:text-outline/60"
                placeholder="aluno@senac.edu.br"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-label-md font-bold text-primary"
            >
              Password
            </label>
            <div className="relative group focus-within:text-primary text-outline transition-colors">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                lock
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-label-md placeholder:text-outline/60"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none rounded-full p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[13px] pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-on-surface-variant hover:text-primary transition-colors font-medium">
              <input
                type="checkbox"
                className="rounded border-outline-variant text-orange-500 focus:ring-orange-500/20 cursor-pointer w-4 h-4 transition-colors"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Authenticating...
              </>
            ) : (
              "Sign In / Entrar"
            )}
          </button>
        </form>

        {/* Footer do Card */}
        <div className="mt-8 text-center border-t border-outline-variant/30 pt-6">
          <p className="text-[14px] text-on-surface-variant">
            Aluno de TI e ainda não tem acesso?{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:text-orange-600 hover:underline transition-colors block mt-1"
            >
              Solicitar conta com seu e-mail educacional
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
