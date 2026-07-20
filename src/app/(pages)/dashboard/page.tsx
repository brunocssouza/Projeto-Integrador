"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const performanceData = [
  { name: "Sem 1", react: 45, automacao: 30, postgres: 55 },
  { name: "Sem 2", react: 60, automacao: 45, postgres: 65 },
  { name: "Sem 3", react: 75, automacao: 55, postgres: 75 },
  { name: "Sem 4", react: 92, automacao: 80, postgres: 85 },
];

const recommendedMentors = [
  {
    id: 1,
    name: "Ana Carolina",
    role: "Tech Lead @ GlobalSoft",
    tags: ["React", "Next.js"],
    avatarUrl: "https://placecats.com/502/502",
  },
  {
    id: 2,
    name: "Marcos Oliveira",
    role: "Data Engineer @ CloudMasters",
    tags: ["PostgreSQL", "AWS"],
    avatarUrl: "https://placecats.com/510/510",
  },
  {
    id: 3,
    name: "Beatriz Lima",
    role: "AI & RPA Specialist",
    tags: ["Power Automate", "LLMs"],
    avatarUrl: "https://placecats.com/511/511",
  },
];

const recentActivities = [
  {
    id: 1,
    time: "Hoje, 09:15",
    content: "Relatorio de Feedback apos o simulado de Arquitetura de Software.",
    link: "Ver Detalhes",
    isPrimary: true,
  },
  {
    id: 2,
    time: "Ontem, 16:40",
    content: 'Voce atingiu 92% de proficiencia no modulo "React & Next.js".',
    isPrimary: false,
  },
  {
    id: 3,
    time: "02 Out, 11:20",
    content: "Nova integracao de LLMs concluida no seu projeto pratico.",
    isPrimary: false,
  },
];

export default function Dashboard() {
  return (
    <div className="p-8 sm:p-12 lg:p-16 w-full max-w-[1200px] mx-auto min-h-screen">
      {/* ================= HEADER ================= */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12">
        <div>
          <h1 className="font-headline-lg text-[28px] lg:text-[32px] text-primary font-bold mb-1">
            Bem-vindo, Bruno.
          </h1>
          <p className="text-on-surface-variant text-[14px]">
            Seu progresso esta semana esta 12% acima da media.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors relative">
            <span className="material-symbols-outlined text-on-surface-variant/60 text-[20px]">
              notifications
            </span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
          </button>
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 relative">
            <Image
              src="https://placecats.com/550/550"
              alt="Avatar"
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
        </div>
      </header>

      {/* ================= PROXIMO AGENDAMENTO ================= */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 mb-10 relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-block bg-[#50d9fe] text-[#001f27] font-bold text-[11px] px-2.5 py-1 rounded-full mb-4">
            Proximo Agendamento
          </span>
          <h2 className="font-headline-md text-[22px] sm:text-[26px] font-bold mb-1.5">
            Simulado: Arquitetura Full-Stack
          </h2>
          <p className="text-[#a8c8ff] text-[14px] mb-5">
            Com o mentor Carlos Mendes &middot; AI Engineer
          </p>
          <div className="flex flex-wrap items-center gap-5 text-[13px] font-medium text-white/80">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                calendar_month
              </span>
              Amanha, 14:00
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                videocam
              </span>
              Google Meet
            </div>
          </div>
        </div>
        <button className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 bg-white text-primary font-semibold px-5 py-2.5 rounded-full text-[13px] flex items-center gap-2 hover:bg-gray-100 transition-colors z-10">
          Ingressar
          <span className="material-symbols-outlined text-[16px]">
            arrow_forward
          </span>
        </button>
        <div className="absolute right-0 top-0 w-56 h-56 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      </section>

      {/* ================= STATS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-6">
          <p className="text-[12px] font-medium text-on-surface-variant/60 uppercase tracking-wider mb-3">
            Tempo de Estudo
          </p>
          <p className="text-[28px] font-bold text-primary">18h 45m</p>
          <p className="text-[12px] text-orange-500 font-medium mt-1">
            +2.4h hoje
          </p>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-2xl p-6">
          <p className="text-[12px] font-medium text-on-surface-variant/60 uppercase tracking-wider mb-3">
            Entrevistas Practicadas
          </p>
          <p className="text-[28px] font-bold text-primary">12</p>
          <p className="text-[12px] text-orange-500 font-medium mt-1">
            +2 nesta semana
          </p>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-2xl p-6">
          <p className="text-[12px] font-medium text-on-surface-variant/60 uppercase tracking-wider mb-3">
            Aluno Nota
          </p>
          <p className="text-[28px] font-bold text-primary">
            10{" "}
            <span className="text-[14px] font-normal text-on-surface-variant/50">
              Excelente
            </span>
          </p>
          <p className="text-[12px] text-orange-500 font-medium mt-1">
            Top 10%
          </p>
        </div>
      </section>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          {/* Chart */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-semibold text-primary">
                Evolucao de Habilidades
              </h2>
              <span className="text-[13px] text-on-surface-variant/50 font-medium">
                Ultimas 4 semanas
              </span>
            </div>

            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e1e3e4"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#737780", fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#737780", fontSize: 11 }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #e1e3e4",
                      boxShadow: "none",
                      fontSize: "13px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="react"
                    name="React & Next.js"
                    stroke="#191c1d"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="automacao"
                    name="RPA & Automacao"
                    stroke="#ea580c"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="postgres"
                    name="PostgreSQL"
                    stroke="#a8c8ff"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Recommended Mentors */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-semibold text-primary">
                Mentores Recomendados
              </h2>
              <Link
                href="/explore"
                className="text-[13px] font-medium text-orange-500 hover:opacity-60 transition-opacity"
              >
                Ver todos
              </Link>
            </div>

            <div className="divide-y divide-outline-variant/30">
              {recommendedMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="flex items-center gap-4 py-5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    <Image
                      src={mentor.avatarUrl}
                      alt={mentor.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-semibold text-primary group-hover:text-orange-500 transition-colors truncate">
                      {mentor.name}
                    </h4>
                    <p className="text-[13px] text-on-surface-variant">
                      {mentor.role}
                    </p>
                    <div className="flex gap-1.5 mt-1.5">
                      {mentor.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium text-on-surface-variant/50 px-2 py-0.5 bg-surface-container-low rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-on-surface/15 group-hover:text-on-surface/40 transition-colors">
                    arrow_forward
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-10">
          {/* Atividade Recente */}
          <section>
            <h2 className="text-[18px] font-semibold text-primary mb-6">
              Atividade Recente
            </h2>

            <div className="relative border-l border-outline-variant/30 ml-2 space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="relative pl-6">
                  <div
                    className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      activity.isPrimary
                        ? "bg-orange-500"
                        : "bg-outline-variant/60"
                    }`}
                  />
                  <span className="text-[11px] text-on-surface-variant/50 font-medium block mb-0.5">
                    {activity.time}
                  </span>
                  <p
                    className={`text-[13px] leading-relaxed ${
                      activity.isPrimary
                        ? "text-primary font-medium"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {activity.content}
                  </p>
                  {activity.link && (
                    <a
                      href="#"
                      className="text-[12px] font-medium text-orange-500 mt-1.5 inline-block hover:opacity-60 transition-opacity"
                    >
                      {activity.link}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Desafio */}
          <section className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6">
            <span className="material-symbols-outlined text-[24px] text-on-surface/20 mb-3 block">
              lightbulb
            </span>
            <h3 className="text-[15px] font-semibold text-primary mb-1.5">
              Novo Desafio
            </h3>
            <p className="text-[13px] text-on-surface-variant leading-relaxed mb-4">
              Complete o simulado de arquitetura de software para desbloquear
              recompensas exclusivas.
            </p>
            <button className="text-[13px] font-semibold text-orange-500 hover:opacity-60 transition-opacity">
              Comecar Agora &rarr;
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
