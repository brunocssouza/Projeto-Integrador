import Image from "next/image";
import Link from "next/link";

// Prévia de mentores para atrair o usuário não logado
const previewMentors = [
  {
    id: 1,
    name: "Mariana Silva",
    role: "Backend Engineer",
    company: "Google Brasil",
    rating: "4.9",
    tags: ["Java", "System Design"],
    avatarUrl: "https://placecats.com/500/500",
    isPopular: true,
  },
  {
    id: 2,
    name: "Ricardo Oliveira",
    role: "Frontend Developer",
    company: "Nubank",
    rating: "5.0",
    tags: ["React", "Tailwind CSS"],
    avatarUrl: "https://placecats.com/501/501",
    isPopular: false,
  },
  {
    id: 4,
    name: "Dr. Roberto Almeida",
    role: "Direito Digital",
    company: "Almeida & Assoc.",
    rating: "4.9",
    tags: ["LGPD", "Startups"],
    avatarUrl: "https://placecats.com/505/505",
    isPopular: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-body-md text-on-surface">
      {/* ================= NAVBAR PÚBLICA ================= */}
      <header className="w-full bg-white border-b border-outline-variant/60 fixed top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-xl h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px]">
                rocket_launch
              </span>
            </div>
            <span className="font-headline-md font-bold text-primary text-[24px]">
              Mock Mentor
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#como-funciona"
              className="text-on-surface-variant font-medium hover:text-primary transition-colors"
            >
              Como Funciona
            </Link>
            <Link
              href="#mentores"
              className="text-on-surface-variant font-medium hover:text-primary transition-colors"
            >
              Nossos Mentores
            </Link>
            <Link
              href="#depoimentos"
              className="text-on-surface-variant font-medium hover:text-primary transition-colors"
            >
              Depoimentos
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-primary font-bold hover:text-orange-600 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/dashboard"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-sm hover:shadow-md"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <main className="flex-1 pt-20">
        <section className="relative w-full bg-[#001a3a] overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#00677d] rounded-full blur-[120px] opacity-40"></div>

          <div className="max-w-[1440px] mx-auto px-4 lg:px-xl py-24 lg:py-32 relative z-10 flex flex-col items-center text-center">
            <span className="inline-block bg-[#002f5f] border border-[#004e5f] text-[#50d9fe] font-bold text-[13px] px-4 py-1.5 rounded-full mb-6">
              Acelere sua carreira e fique à frente no mercado de trabalho
            </span>
            <h1 className="font-headline-lg text-4xl lg:text-6xl text-white font-black max-w-4xl leading-tight mb-6">
              Domine sua próxima entrevista com profissionais de{" "}
              <span className="text-orange-500">alto nível</span>.
            </h1>
            <p className="text-lg lg:text-xl text-outline-variant max-w-2xl mb-10">
              Pratique simulados reais, receba feedback detalhado e aprenda os
              segredos dos processos seletivos do Google, Nubank, AWS e grandes
              bancas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/dashboard"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Agendar Primeira Mentoria
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                href="#mentores"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center"
              >
                Conhecer Especialistas
              </Link>
            </div>
          </div>
        </section>

        {/* ================= FEATURES SECTION ================= */}
        <section
          id="como-funciona"
          className="py-24 bg-surface-container-lowest"
        >
          <div className="max-w-[1440px] mx-auto px-4 lg:px-xl">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-[32px] text-primary font-bold mb-4">
                Como o Mock Mentor ajuda você?
              </h2>
              <p className="text-on-surface-variant text-lg">
                Uma metodologia focada em resultados reais e evolução contínua.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white border border-outline-variant/50 p-8 rounded-2xl shadow-sm text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-[32px]">
                    psychology
                  </span>
                </div>
                <h3 className="font-headline-sm text-primary font-bold mb-3">
                  Simulados Realistas
                </h3>
                <p className="text-on-surface-variant">
                  Passe por entrevistas técnicas e comportamentais idênticas às
                  aplicadas pelas maiores empresas do mercado.
                </p>
              </div>
              <div className="bg-white border border-outline-variant/50 p-8 rounded-2xl shadow-sm text-center">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-[32px]">
                    fact_check
                  </span>
                </div>
                <h3 className="font-headline-sm text-primary font-bold mb-3">
                  Feedback Detalhado
                </h3>
                <p className="text-on-surface-variant">
                  Receba um mapa claro dos seus pontos fortes e do que precisa
                  melhorar para garantir sua aprovação.
                </p>
              </div>
              <div className="bg-white border border-outline-variant/50 p-8 rounded-2xl shadow-sm text-center">
                <div className="w-16 h-16 bg-[#b3ebff] text-[#00677d] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-[32px]">
                    trending_up
                  </span>
                </div>
                <h3 className="font-headline-sm text-primary font-bold mb-3">
                  Evolução Mensurável
                </h3>
                <p className="text-on-surface-variant">
                  Acompanhe seu progresso através de um dashboard intuitivo que
                  mede seu nível de habilidade técnica.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PREVIEW MENTORES ================= */}
        <section
          id="mentores"
          className="py-24 bg-background border-t border-outline-variant/30"
        >
          <div className="max-w-[1440px] mx-auto px-4 lg:px-xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <h2 className="font-headline-lg text-[32px] text-primary font-bold mb-2">
                  Aprenda com quem já chegou lá
                </h2>
                <p className="text-on-surface-variant text-lg">
                  Profissionais experientes que conhecem o caminho das pedras.
                </p>
              </div>
              <Link
                href="/explore"
                className="text-orange-600 font-bold hover:underline flex items-center gap-1"
              >
                Ver todos os mentores
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {previewMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-white border border-outline-variant/60 rounded-2xl p-6 hover:border-orange-500 transition-colors shadow-sm relative overflow-hidden group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={mentor.avatarUrl}
                        alt={mentor.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-primary text-[16px]">
                          {mentor.name}
                        </h4>
                        <div className="flex items-center gap-1 bg-[#fff8e6] text-[#b38000] px-2 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-[14px] fill-icon">
                            star
                          </span>
                          <span className="text-[12px] font-bold">
                            {mentor.rating}
                          </span>
                        </div>
                      </div>
                      <p className="text-[13px] text-on-surface-variant font-medium">
                        {mentor.role}
                      </p>
                      <p className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px]">
                          apartment
                        </span>
                        {mentor.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-outline-variant/30">
                    {mentor.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-bold bg-surface text-on-surface-variant px-2.5 py-1 rounded-full border border-outline-variant/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {mentor.isPopular && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black uppercase px-6 py-1 rotate-45 translate-x-[30%] translate-y-3 shadow-sm">
                      Popular
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CTA FINAL ================= */}
        <section className="bg-orange-500 py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
            <h2 className="font-headline-lg text-3xl md:text-5xl font-black mb-6">
              Pronto para conquistar sua vaga dos sonhos?
            </h2>
            <p className="text-lg md:text-xl text-orange-100 mb-10">
              Junte-se a centenas de profissionais que aceleraram suas carreiras
              através da simulação prática.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-gray-50 px-10 py-4 rounded-full font-black text-lg transition-transform hover:scale-105 shadow-xl"
            >
              Criar Conta Gratuitamente
            </Link>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-outline-variant/60 py-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[14px]">
                rocket_launch
              </span>
            </div>
            <span className="font-bold text-primary text-[16px]">
              Mock Mentor
            </span>
          </div>
          <p className="text-on-surface-variant text-[13px]">
            &copy; {new Date().getFullYear()} Mock Mentor. Todos os direitos
            reservados.
          </p>
          <div className="flex gap-4 text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors">
              <span className="material-symbols-outlined">link</span>
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              <span className="material-symbols-outlined">share</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
