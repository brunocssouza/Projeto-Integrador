"use client";

import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Base de Dados Simulada (Coesa e contextualizada) ---
const performanceData = [
  { name: "Semana 1", react: 45, automacao: 30, postgres: 55 },
  { name: "Semana 2", react: 60, automacao: 45, postgres: 65 },
  { name: "Semana 3", react: 75, automacao: 55, postgres: 75 },
  { name: "Semana 4", react: 92, automacao: 80, postgres: 85 },
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
    content: (
      <>
        Relatório de Feedback recebido após o simulado de{" "}
        <strong>Arquitetura de Software</strong>.
      </>
    ),
    link: "Ver Detalhes",
    isPrimary: true,
  },
  {
    id: 2,
    time: "Ontem, 16:40",
    content:
      'Você atingiu 92% de proficiência no módulo "React & Next.js Avançado".',
    isPrimary: false,
  },
  {
    id: 3,
    time: "02 Out, 11:20",
    content: "Nova integração de LLMs concluída no seu projeto prático.",
    isPrimary: false,
  },
];

export default function Dashboard() {
  return (
    <div className="p-4 sm:p-6 md:p-8 w-full max-w-[1440px] mx-auto min-h-screen relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${Math.random() * 80 + 20}px`,
              height: `${Math.random() * 80 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse ${Math.random() * 5 + 5}s infinite`
            }}
          />
        ))}
      </div>
      
      {/* Header Local do Dashboard */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 pt-4 relative z-10">
        <div>
          <h2 className="font-headline-lg text-[28px] sm:text-[32px] text-primary font-bold">
            Bem-vindo, Bruno!
          </h2>
          <p className="text-on-surface-variant text-[14px] sm:text-[16px] mt-1">
            Seu progresso esta semana está 12% acima da média.
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-0">
          <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors relative">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
              notifications
            </span>
            <span className="absolute top-1 right-1 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-outline-variant bg-gray-200 relative">
            <Image
              src="https://placecats.com/550/550"
              alt="Avatar Bruno"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
        </div>
      </header>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 pb-8 sm:pb-12 relative z-10">
        {/* Coluna Esquerda (Destaques e Gráfico) */}
        <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8">
          {/* Hero Card - Próximo Agendamento */}
          <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-md">
            <div className="relative z-10">
              <span className="inline-block bg-[#50d9fe] text-[#001f27] font-bold text-[10px] sm:text-[12px] px-2.5 py-1 rounded-full mb-3 sm:mb-4">
                Próximo Agendamento
              </span>
              <h3 className="font-headline-md text-[24px] sm:text-[28px] font-bold mb-2">
                Simulado: Arquitetura Full-Stack
              </h3>
              <p className="text-[#a8c8ff] mb-4 sm:mb-6 text-[14px] sm:text-[15px]">
                Com o mentor Carlos Mendes • AI Engineer
              </p>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[13px] sm:text-[14px] font-medium">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                    calendar_month
                  </span>
                  Amanhã, 14:00
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                    videocam
                  </span>
                  Google Meet
                </div>
              </div>
            </div>
            <button className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 bg-white text-primary font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg z-10 text-[14px]">
              Ingressar Agora
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <div className="absolute right-0 top-0 w-48 sm:w-64 h-48 sm:h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          </section>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-outline-variant/60 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary-fixed-dim/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">timer</span>
                </div>
                <span className="text-secondary font-bold text-[12px] sm:text-[14px]">
                  +2.4h hoje
                </span>
              </div>
              <div>
                <p className="text-on-surface-variant text-[12px] sm:text-[13px] font-medium mb-1">
                  Tempo de Estudo
                </p>
                <p className="font-headline-md text-primary font-bold text-[20px] sm:text-[24px]">
                  18h 45m{" "}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-outline-variant/60 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <span className="material-symbols-outlined">checklist</span>
                </div>
                <span className="text-orange-600 font-bold text-[12px] sm:text-[14px]">
                  +2 nesta semana
                </span>
              </div>
              <div>
                <p className="text-on-surface-variant text-[12px] sm:text-[13px] font-medium mb-1">
                  Entrevistas Praticadas
                </p>
                <p className="font-headline-md text-primary font-bold text-[20px] sm:text-[24px]">
                  12{" "}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-outline-variant/60 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <span className="text-primary font-bold text-[12px] sm:text-[14px]">
                  Top 10%
                </span>
              </div>
              <div>
                <p className="text-on-surface-variant text-[12px] sm:text-[13px] font-medium mb-1">
                  Aluno Nota
                </p>
                <p className="font-headline-md text-primary font-bold text-[20px] sm:text-[24px]">
                  10{" "}
                  <span className="text-xs sm:text-sm font-normal text-on-surface-variant">
                    Excelente!
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Gráfico de Evolução Funcional (Recharts) */}
          <section className="bg-white border border-outline-variant/60 rounded-2xl p-4 sm:p-6 shadow-sm flex-1 min-h-[320px] sm:min-h-[380px] flex flex-col">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="font-headline-sm text-primary font-bold text-[18px] sm:text-[20px]">
                Evolução de Habilidades
              </h3>
              <button className="flex items-center gap-1 text-[12px] sm:text-[13px] text-on-surface-variant font-medium bg-surface-container-low px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-surface-variant transition-colors">
                Últimas 4 Semanas
                <span className="material-symbols-outlined text-[14px] sm:text-[16px]">
                  expand_more
                </span>
              </button>
            </div>

            <div className="flex-1 w-full h-full min-h-[200px] sm:min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
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
                    tick={{ fill: "#737780", fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#737780", fontSize: 10 }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #c3c6d0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                    itemStyle={{ fontWeight: "bold" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="react"
                    name="React & Next.js"
                    stroke="#00677d"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="automacao"
                    name="RPA & Automação"
                    stroke="#ea580c" /* orange-600 */
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="postgres"
                    name="PostgreSQL"
                    stroke="#3b82f6" /* blue-500 */
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Coluna Direita (Widgets) */}
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Mentores Recomendados */}
          <section className="bg-white border border-outline-variant/60 rounded-2xl p-4 sm:p-6 shadow-sm transform hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-end mb-4 sm:mb-6">
              <h3 className="font-headline-sm text-primary font-bold leading-tight text-[18px] sm:text-[20px]">
                Mentores
                <br />
                Recomendados
              </h3>
              <a
                href="#"
                className="text-[#00677d] text-[12px] sm:text-[13px] font-bold hover:underline mb-1"
              >
                Ver todos
              </a>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {recommendedMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="flex items-center gap-3 sm:gap-4 group cursor-pointer transform hover:translate-x-1 transition-transform duration-200"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    <Image
                      src={mentor.avatarUrl}
                      alt={mentor.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[13px] sm:text-[14px] font-bold text-primary group-hover:text-[#00677d] transition-colors">
                      {mentor.name}
                    </h4>
                    <p className="text-[11px] sm:text-[12px] text-on-surface-variant mb-1">
                      {mentor.role}
                    </p>
                    <div className="flex gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-[#00677d] font-medium">
                      {mentor.tags.join(" • ")}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-[18px]">
                    chevron_right
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Atividade Recente */}
          <section className="bg-white border border-outline-variant/60 rounded-2xl p-4 sm:p-6 shadow-sm flex-1 transform hover:shadow-lg transition-shadow duration-300">
            <h3 className="font-headline-sm text-primary font-bold mb-4 sm:mb-6 text-[18px] sm:text-[20px]">
              Atividade Recente
            </h3>

            <div className="relative border-l-2 border-outline-variant/30 ml-2.5 sm:ml-3 space-y-6 pb-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="relative pl-5 sm:pl-6 transform hover:translate-x-1 transition-transform duration-200">
                  <div
                    className={`absolute -left-[7px] top-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white ${
                      activity.isPrimary ? "bg-[#00677d]" : "bg-outline-variant"
                    }`}
                  ></div>

                  <span className="text-[10px] sm:text-[11px] font-label-md text-on-surface-variant block mb-1">
                    {activity.time}
                  </span>
                  <p
                    className={`text-[13px] sm:text-[14px] mt-1 ${
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
                      className="text-[#00677d] text-[11px] sm:text-[12px] font-bold mt-2 inline-block hover:underline"
                    >
                      {activity.link}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
          
          {/* Call to Action Card */}
          <section className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-4 sm:p-6 shadow-lg transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-xl sm:text-2xl">lightbulb</span>
              </div>
              <div>
                <h3 className="font-headline-sm font-bold mb-2 text-[16px] sm:text-[18px]">Novo Desafio Disponível!</h3>
                <p className="text-[13px] sm:text-[14px] mb-3 sm:mb-4 opacity-90">
                  Complete o simulado de arquitetura de software para desbloquear recompensas exclusivas.
                </p>
                <button className="bg-white text-emerald-600 font-bold px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-gray-100 transition-colors">
                  Começar Agora
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
