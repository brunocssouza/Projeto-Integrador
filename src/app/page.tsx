"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const previewMentors = [
  {
    id: 1,
    name: "Mariana Silva",
    role: "Backend Engineer",
    company: "Google Brasil",
    rating: "4.9",
    tags: ["Java", "System Design"],
    avatarUrl: "https://placecats.com/500/500",
  },
  {
    id: 2,
    name: "Ricardo Oliveira",
    role: "Frontend Developer",
    company: "Nubank",
    rating: "5.0",
    tags: ["React", "Tailwind CSS"],
    avatarUrl: "https://placecats.com/501/501",
  },
  {
    id: 3,
    name: "Dr. Roberto Almeida",
    role: "Direito Digital",
    company: "Almeida & Assoc.",
    rating: "4.9",
    tags: ["LGPD", "Startups"],
    avatarUrl: "https://placecats.com/505/505",
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const mentorsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(featuresRef.current?.querySelectorAll(".feature-item") ?? [], {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        },
      });

      gsap.from(
        mentorsRef.current?.querySelectorAll(".mentor-row") ?? [],
        {
          y: 30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: mentorsRef.current,
            start: "top 80%",
          },
        },
      );

      gsap.from(ctaRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 85%",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-body-md text-on-surface">
      {/* ================= HERO VIDEO ================= */}
      <div className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden text-white">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-20"
        >
          <source src="/video-landingpage.mp4" type="video/mp4" />
          Seu navegador nao suporta videos.
        </video>

        <div className="absolute inset-0 bg-black/40 -z-10" />

        {/* Navbar */}
        <header className="w-full z-10">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-xl h-20 flex justify-between items-center">
            <Link
              href="/"
              className="flex items-center gap-3 text-white no-underline"
            >
              <div className="w-9 h-9 border-2 border-white rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">
                  rocket_launch
                </span>
              </div>
              <span className="font-headline-md font-bold text-[20px]">
                Mock Mentor
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#como-funciona"
                className="text-white/80 text-[14px] font-medium hover:text-white transition-colors"
              >
                Como Funciona
              </a>
              <a
                href="#mentores"
                className="text-white/80 text-[14px] font-medium hover:text-white transition-colors"
              >
                Mentores
              </a>
              <Link
                href="/login"
                className="bg-white text-black px-6 py-2.5 rounded-full text-[14px] font-semibold hover:bg-gray-100 transition-colors"
              >
                Entrar
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Content */}
        <main
          ref={heroRef}
          className="max-w-[850px] px-6 lg:px-xl pb-32 pt-4 z-10"
        >
          <h1 className="font-headline-lg text-[2.8rem] lg:text-[3.5rem] font-black leading-[1.1] tracking-tight mb-6">
            Domine sua proxima entrevista com profissionais de{" "}
            <span className="text-orange-400">alto nivel</span>.
          </h1>

          <p className="text-[1.1rem] leading-relaxed text-white/70 max-w-[600px] mb-10">
            Pratique simulados reais, receba feedback detalhado e aprenda os
            segredos dos processos seletivos de grandes empresas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="bg-white text-black px-8 py-3.5 rounded-full font-semibold text-[15px] hover:bg-gray-100 transition-colors text-center"
            >
              Comecar Agora
            </Link>
            <Link
              href="/login"
              className="text-white px-8 py-3.5 rounded-full font-semibold text-[15px] border border-white/30 hover:bg-white/10 transition-colors text-center"
            >
              Ja tenho conta
            </Link>
          </div>
        </main>
      </div>

      {/* ================= FEATURES ================= */}
      <section id="como-funciona" ref={featuresRef} className="py-32 bg-white">
        <div className="max-w-[900px] mx-auto px-6 lg:px-xl">
          <div className="text-center mb-20">
            <p className="text-[13px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">
              Como funciona
            </p>
            <h2 className="font-headline-lg text-[36px] lg:text-[44px] text-primary font-bold leading-tight">
              Tudo o que voce precisa para
              <br />
              se destacar nas entrevistas.
            </h2>
          </div>

          <div className="space-y-16">
            <div className="feature-item flex flex-col md:flex-row gap-6 md:gap-12 items-start">
              <span className="text-[48px] font-black text-orange-500/20 leading-none select-none">
                01
              </span>
              <div>
                <h3 className="font-headline-sm text-[20px] text-primary font-bold mb-2">
                  Simulados Realistas
                </h3>
                <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-[500px]">
                  Entrevistas tecnicas e comportamentais identicas as aplicadas
                  pelas maiores empresas do mercado. Sem surpresas no dia.
                </p>
              </div>
            </div>

            <div className="feature-item flex flex-col md:flex-row gap-6 md:gap-12 items-start">
              <span className="text-[48px] font-black text-orange-500/20 leading-none select-none">
                02
              </span>
              <div>
                <h3 className="font-headline-sm text-[20px] text-primary font-bold mb-2">
                  Feedback Detalhado
                </h3>
                <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-[500px]">
                  Um mapa claro dos seus pontos fortes e do que precisa melhorar
                  para garantir sua aprovacao.
                </p>
              </div>
            </div>

            <div className="feature-item flex flex-col md:flex-row gap-6 md:gap-12 items-start">
              <span className="text-[48px] font-black text-orange-500/20 leading-none select-none">
                03
              </span>
              <div>
                <h3 className="font-headline-sm text-[20px] text-primary font-bold mb-2">
                  Evolucao Mensuravel
                </h3>
                <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-[500px]">
                  Acompanhe seu progresso com um dashboard que mede seu nivel
                  de habilidade tecnica ao longo do tempo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MENTORS ================= */}
      <section
        id="mentores"
        ref={mentorsRef}
        className="py-32 bg-surface-container-lowest"
      >
        <div className="max-w-[900px] mx-auto px-6 lg:px-xl">
          <div className="text-center mb-20">
            <p className="text-[13px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">
              Mentores
            </p>
            <h2 className="font-headline-lg text-[36px] lg:text-[44px] text-primary font-bold leading-tight">
              Aprenda com quem ja
              <br />
              chegou la.
            </h2>
          </div>

          <div className="divide-y divide-outline-variant/40">
            {previewMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="mentor-row flex items-center gap-5 py-7 group cursor-pointer"
              >
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={mentor.avatarUrl}
                    alt={mentor.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[15px] font-semibold text-primary truncate">
                      {mentor.name}
                    </h4>
                    <span className="text-[12px] text-orange-500 font-semibold">
                      {mentor.rating}
                    </span>
                  </div>
                  <p className="text-[13px] text-on-surface-variant mt-0.5">
                    {mentor.role} &middot; {mentor.company}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[18px] text-on-surface/20 group-hover:text-on-surface/60 transition-colors">
                  arrow_forward
                </span>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              href="/explore"
              className="text-[14px] font-semibold text-orange-500 hover:opacity-60 transition-opacity"
            >
              Ver todos os mentores &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section ref={ctaRef} className="py-32 bg-white">
        <div className="max-w-[700px] mx-auto px-6 lg:px-xl text-center">
          <h2 className="font-headline-lg text-[32px] lg:text-[42px] text-primary font-bold leading-tight mb-6">
            Pronto para comecar?
          </h2>
          <p className="text-on-surface-variant text-[16px] leading-relaxed mb-10 max-w-[480px] mx-auto">
            Junte-se a centenas de profissionais que aceleraram suas carreiras
            atraves da simulacao pratica.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center bg-orange-500 text-white px-8 py-3.5 rounded-full font-semibold text-[15px] hover:bg-orange-600 transition-colors"
          >
            Criar Conta Gratuita
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-10 bg-surface-container-lowest border-t border-outline-variant/30">
        <div className="max-w-[900px] mx-auto px-6 lg:px-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 border border-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[12px]">
                rocket_launch
              </span>
            </div>
            <span className="text-[14px] font-semibold text-primary">
              Mock Mentor
            </span>
          </div>
          <p className="text-on-surface-variant/50 text-[13px]">
            &copy; {new Date().getFullYear()} Mock Mentor.
          </p>
        </div>
      </footer>
    </div>
  );
}
