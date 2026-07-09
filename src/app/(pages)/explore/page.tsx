"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

// --- Definição do Esquema de Filtros ---
const FILTER_SCHEMA = {
  Tecnologia: {
    Cargos: [
      "Backend Engineer",
      "Frontend Developer",
      "Full-Stack",
      "AI Engineer",
      "Cloud Architect",
    ],
    Ferramentas: [
      "React",
      "Java",
      "Python",
      "Laravel",
      "AWS",
      "Power Automate",
    ],
  },
  Direito: {
    "Áreas de Atuação": [
      "Direito Digital",
      "Tributário",
      "Trabalhista",
      "Corporativo",
    ],
    Foco: ["LGPD", "Compliance", "Contratos", "Startups"],
  },
};

// --- Base de Dados de Mentores ---
const mentorsData = [
  {
    id: 1,
    name: "Mariana Silva",
    role: "Backend Engineer",
    company: "Google Brasil",
    rating: "4.9",
    price: 150,
    tags: ["Tecnologia", "Java", "System Design"],
    isPopular: true,
    avatarUrl: "https://placecats.com/500/500",
    description:
      "Especialista em arquitetura de microserviços e Java. Ajudo alunos a dominarem testes técnicos complexos.",
  },
  {
    id: 2,
    name: "Ricardo Oliveira",
    role: "Frontend Developer",
    company: "Nubank",
    rating: "5.0",
    price: 180,
    tags: ["Tecnologia", "React", "Tailwind CSS"],
    isPopular: false,
    avatarUrl: "https://placecats.com/501/501",
    description:
      "Focado no ecossistema front-end moderno. Com mais de 10 anos de experiência liderando times de alta performance.",
  },
  {
    id: 3,
    name: "Ana Carolina",
    role: "Full-Stack",
    company: "EduTech Solutions",
    rating: "4.8",
    price: 130,
    tags: ["Tecnologia", "Laravel", "React"],
    isPopular: true,
    avatarUrl: "https://placecats.com/500/520",
    description:
      "Mentoria focada em arquitetura MVC com Laravel e modelagem avançada de bancos de dados relacionais.",
  },
  {
    id: 4,
    name: "Dr. Roberto Almeida",
    role: "Direito Digital",
    company: "Almeida & Associados",
    rating: "4.9",
    price: 220,
    tags: ["Direito", "LGPD", "Startups"],
    isPopular: true,
    avatarUrl: "https://placecats.com/505/505",
    description:
      "Adequação de empresas de tecnologia à LGPD e estruturação jurídica de startups em early-stage.",
  },
  {
    id: 5,
    name: "Camila Vasconcelos",
    role: "Corporativo",
    company: "Machado Meyer",
    rating: "4.7",
    price: 190,
    tags: ["Direito", "Compliance", "Contratos"],
    isPopular: false,
    avatarUrl: "https://placecats.com/555/600",
    description:
      "Revisão e mentoria em contratos complexos de software e estruturação de programas de compliance.",
  },
  {
    id: 6,
    name: "Carlos Mendes",
    role: "AI Engineer",
    company: "DataCorp",
    rating: "4.9",
    price: 160,
    tags: ["Tecnologia", "Python", "Power Automate"],
    isPopular: false,
    avatarUrl: "https://placecats.com/503/503",
    description:
      "Te ajudo a integrar APIs de IA em seus projetos e criar pipelines de automação para tarefas repetitivas.",
  },
];

export default function ExploreMentors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recommended");

  // Novo estado para controlar se o painel superior de filtros está aberto
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleFilter = (filterItem: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterItem)
        ? prev.filter((f) => f !== filterItem)
        : [...prev, filterItem],
    );
  };

  const filteredMentors = useMemo(() => {
    let result = [...mentorsData];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q)) ||
          m.company.toLowerCase().includes(q),
      );
    }

    if (selectedFilters.length > 0) {
      result = result.filter((m) => {
        const mentorAttributes = [m.role, ...m.tags];
        return selectedFilters.some((filter) =>
          mentorAttributes.includes(filter),
        );
      });
    }

    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case "recommended":
      default:
        result.sort((a, b) =>
          a.isPopular === b.isPopular ? 0 : a.isPopular ? -1 : 1,
        );
        break;
    }

    return result;
  }, [searchQuery, selectedFilters, sortBy]);

  return (
    <div className="p-xl w-full max-w-[1440px] mx-auto min-h-screen flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-lg pt-4">
        <div>
          <h1 className="font-headline-lg text-primary font-bold text-[32px]">
            Explore Mentores
          </h1>
          <p className="text-on-surface-variant text-[16px] mt-1">
            Conecte-se com especialistas das maiores empresas para acelerar sua
            carreira.
          </p>
        </div>

        <div className="flex items-center gap-md">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              className="pl-10 pr-4 py-2 bg-white border border-outline-variant/60 rounded-full focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-64 text-label-md transition-all outline-none shadow-sm"
              placeholder="Buscar mentor, cargo..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="w-10 h-10 hidden sm:flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors relative">
            <span className="material-symbols-outlined text-on-surface-variant">
              notifications
            </span>
          </button>
          <div className="w-10 h-10 hidden sm:block rounded-full overflow-hidden border-2 border-outline-variant bg-gray-200">
            <div className="w-full h-full bg-surface-tint"></div>
          </div>
        </div>
      </header>

      {/* ================= BARRA DE AÇÕES (FILTROS E ORDENAÇÃO) ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-lg bg-surface-container-lowest border border-outline-variant/60 p-2 rounded-2xl shadow-sm">
        {/* Botão de Toggle do Painel de Filtros */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-label-md transition-all ${
            isFilterOpen || selectedFilters.length > 0
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-transparent text-primary hover:bg-surface-variant/50"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isFilterOpen ? "close" : "tune"}
          </span>
          Filtros {selectedFilters.length > 0 && `(${selectedFilters.length})`}
        </button>

        {/* Dropdown de Ordenação */}
        <div className="relative w-full sm:w-auto">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant pointer-events-none">
            sort
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto bg-transparent border-none pl-10 pr-8 py-2 rounded-xl text-label-md font-bold hover:bg-surface-variant/50 focus:ring-0 transition-colors appearance-none cursor-pointer outline-none"
          >
            <option value="recommended">Recomendados</option>
            <option value="rating">Maior Avaliação</option>
            <option value="price_asc">Menor Preço</option>
            <option value="price_desc">Maior Preço</option>
          </select>
        </div>
      </div>

      {/* ================= PAINEL EXPANSÍVEL DE FILTROS ================= */}
      {isFilterOpen && (
        <div className="bg-white border border-outline-variant/60 rounded-2xl p-lg shadow-sm mb-lg animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
            <h2 className="font-headline-sm text-primary">Filtrar por</h2>
            {selectedFilters.length > 0 && (
              <button
                onClick={() => setSelectedFilters([])}
                className="text-orange-600 font-bold text-label-md hover:underline"
              >
                Limpar todos
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(FILTER_SCHEMA).map(
              ([mainCategory, subCategories]) => (
                <div
                  key={mainCategory}
                  className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:border-r lg:last:border-0 border-outline-variant/30 lg:pr-8"
                >
                  <div className="sm:col-span-2">
                    <h3 className="font-headline-sm text-[18px] text-primary font-bold">
                      {mainCategory}
                    </h3>
                  </div>

                  {Object.entries(subCategories).map(
                    ([subCategoryName, items]) => (
                      <div key={subCategoryName}>
                        <h4 className="font-label-md text-on-surface-variant font-bold mb-3 uppercase text-[11px] tracking-wider">
                          {subCategoryName}
                        </h4>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <label
                              key={item}
                              className="flex items-center gap-sm cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={selectedFilters.includes(item)}
                                onChange={() => toggleFilter(item)}
                                className="rounded border-outline-variant text-orange-500 focus:ring-orange-500 h-4 w-4 cursor-pointer transition-colors"
                              />
                              <span className="text-body-md text-on-surface-variant group-hover:text-primary transition-colors text-[14px]">
                                {item}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* ================= GRID DE RESULTADOS ================= */}
      <section className="flex-1 pb-12">
        {filteredMentors.length === 0 ? (
          <div className="bg-white border border-outline-variant/60 rounded-xl p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">
              search_off
            </span>
            <h3 className="font-headline-sm text-primary mb-2">
              Nenhum mentor encontrado
            </h3>
            <p className="text-on-surface-variant">
              Tente ajustar seus filtros ou remover o termo da busca.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-lg">
            {filteredMentors.map((mentor) => (
              <article
                key={mentor.id}
                className="bg-white border border-outline-variant/60 rounded-xl p-md mentor-card-shadow flex flex-col group hover:border-orange-500 transition-all duration-300 active:scale-[0.98]"
              >
                <div className="flex gap-md mb-md items-start">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm relative bg-gray-100">
                      <Image
                        src={mentor.avatarUrl}
                        alt={`Retrato de ${mentor.name}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    {mentor.isPopular && (
                      <span className="absolute -bottom-2 -right-2 bg-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm z-10">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-headline-sm text-primary group-hover:text-orange-600 transition-colors text-[18px] leading-tight mb-1">
                        {mentor.name}
                      </h3>
                      <div className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px] text-[#ffb800] fill-icon">
                          star
                        </span>
                        <span className="text-label-md font-bold text-on-surface">
                          {mentor.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-label-md font-bold text-on-surface-variant">
                      {mentor.role}
                    </p>
                    <div className="flex items-center gap-xs mt-1">
                      <span className="material-symbols-outlined text-[14px] text-outline">
                        apartment
                      </span>
                      <span className="text-label-sm text-on-surface-variant">
                        {mentor.company}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-body-md text-on-surface-variant line-clamp-2 mb-md text-[14px] leading-relaxed">
                  {mentor.description}
                </p>

                <div className="flex flex-wrap gap-xs mb-lg mt-auto">
                  {mentor.tags
                    .filter((t) => t !== "Tecnologia" && t !== "Direito")
                    .map((tag) => (
                      <span
                        key={tag}
                        className="bg-surface text-on-surface-variant px-sm py-1 rounded-full text-label-sm border border-outline-variant/30"
                      >
                        {tag}
                      </span>
                    ))}
                </div>

                <div className="pt-md border-t border-outline-variant/60 flex items-center justify-between">
                  <div className="text-label-md font-bold text-primary">
                    R$ {mentor.price}{" "}
                    <span className="text-on-surface-variant font-normal">
                      / sessão
                    </span>
                  </div>
                  <button className="bg-primary hover:bg-primary/90 text-white px-lg py-2 rounded-full font-bold text-label-md transition-colors group-hover:bg-orange-500">
                    Ver Perfil
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Floating Action Button */}
      <button className="fixed bottom-xl right-xl w-16 h-16 rounded-full bg-orange-500 text-white shadow-xl flex items-center justify-center hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all z-40 group">
        <span className="material-symbols-outlined text-[32px] fill-icon">
          support_agent
        </span>
        <span className="absolute right-full mr-md bg-gray-800 text-white px-md py-2 rounded-lg text-label-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
          Ajuda com mentoria
        </span>
      </button>
    </div>
  );
}
