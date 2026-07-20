"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

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
    "Areas de Atuacao": [
      "Direito Digital",
      "Tributario",
      "Trabalhista",
      "Corporativo",
    ],
    Foco: ["LGPD", "Compliance", "Contratos", "Startups"],
  },
};

const mentorsData = [
  {
    id: 1,
    name: "Beatriz Santos",
    role: "Backend Engineer",
    company: "Google Brasil",
    rating: "4.9",
    price: 150,
    tags: ["Tecnologia", "Java", "System Design"],
    avatarUrl: "https://placecats.com/500/500",
    description:
      "Especialista em arquitetura de microservicos e Java. Ajudo alunos a dominarem testes tecnicos complexos.",
  },
  {
    id: 2,
    name: "Pedro Henrique",
    role: "Frontend Developer",
    company: "Nubank",
    rating: "5.0",
    price: 180,
    tags: ["Tecnologia", "React", "Tailwind CSS"],
    avatarUrl: "https://placecats.com/501/501",
    description:
      "Focado no ecossistema front-end moderno. Com mais de 10 anos de experiencia liderando times de alta performance.",
  },
  {
    id: 3,
    name: "Juliana Mendes",
    role: "Full-Stack",
    company: "EduTech Solutions",
    rating: "4.8",
    price: 130,
    tags: ["Tecnologia", "Laravel", "React"],
    avatarUrl: "https://placecats.com/500/520",
    description:
      "Mentoria focada em arquitetura MVC com Laravel e modelagem avancada de bancos de dados relacionais.",
  },
  {
    id: 4,
    name: "Dr. Andre Costa",
    role: "Direito Digital",
    company: "Almeida & Associados",
    rating: "4.9",
    price: 220,
    tags: ["Direito", "LGPD", "Startups"],
    avatarUrl: "https://placecats.com/505/505",
    description:
      "Adequacao de empresas de tecnologia a LGPD e estruturacao juridica de startups em early-stage.",
  },
  {
    id: 5,
    name: "Fernanda Lima",
    role: "Corporativo",
    company: "Machado Meyer",
    rating: "4.7",
    price: 190,
    tags: ["Direito", "Compliance", "Contratos"],
    avatarUrl: "https://placecats.com/555/600",
    description:
      "Revisao e mentoria em contratos complexos de software e estruturacao de programas de compliance.",
  },
  {
    id: 6,
    name: "Lucas Ribeiro",
    role: "AI Engineer",
    company: "DataCorp",
    rating: "4.9",
    price: 160,
    tags: ["Tecnologia", "Python", "Power Automate"],
    avatarUrl: "https://placecats.com/503/503",
    description:
      "Te ajudo a integrar APIs de IA em seus projetos e criar pipelines de automacao para tarefas repetitivas.",
  },
];

export default function ExploreMentors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recommended");
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
        result.sort((a, b) => (a.name < b.name ? -1 : 1));
        break;
    }

    return result;
  }, [searchQuery, selectedFilters, sortBy]);

  return (
    <div className="p-8 sm:p-12 lg:p-16 w-full max-w-[1200px] mx-auto min-h-screen">
      {/* ================= HEADER ================= */}
      <header className="mb-12">
        <h1 className="font-headline-lg text-[32px] lg:text-[40px] text-primary font-bold leading-tight mb-2">
          Explorar Mentores
        </h1>
        <p className="text-on-surface-variant text-[15px]">
          Encontre o especialista certo para acelerar sua carreira.
        </p>
      </header>

      {/* ================= TOOLBAR ================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/40">
              search
            </span>
            <input
              className="pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-full focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 w-full sm:w-72 text-[14px] transition-all outline-none"
              placeholder="Buscar mentor, cargo..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-medium transition-colors border ${
              isFilterOpen || selectedFilters.length > 0
                ? "border-orange-500/40 text-orange-500 bg-orange-50"
                : "border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isFilterOpen ? "close" : "tune"}
            </span>
            Filtros
            {selectedFilters.length > 0 && (
              <span className="text-[12px] bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center">
                {selectedFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-transparent border border-outline-variant/40 px-4 py-2.5 rounded-full text-[14px] font-medium text-on-surface-variant appearance-none cursor-pointer outline-none hover:bg-surface-container-low transition-colors pr-8"
        >
          <option value="recommended">Recomendados</option>
          <option value="rating">Maior Avaliacao</option>
          <option value="price_asc">Menor Preco</option>
          <option value="price_desc">Maior Preco</option>
        </select>
      </div>

      {/* ================= FILTER PANEL ================= */}
      {isFilterOpen && (
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 sm:p-8 mb-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[15px] font-semibold text-primary">
              Filtrar por
            </h2>
            {selectedFilters.length > 0 && (
              <button
                onClick={() => setSelectedFilters([])}
                className="text-orange-500 text-[13px] font-medium hover:opacity-60 transition-opacity"
              >
                Limpar todos
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(FILTER_SCHEMA).map(
              ([mainCategory, subCategories]) => (
                <div key={mainCategory}>
                  <h3 className="text-[14px] font-semibold text-primary mb-5 pb-3 border-b border-outline-variant/30">
                    {mainCategory}
                  </h3>
                  <div className="space-y-5">
                    {Object.entries(subCategories).map(
                      ([subCategoryName, items]) => (
                        <div key={subCategoryName}>
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/50 mb-2.5">
                            {subCategoryName}
                          </h4>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <label
                                key={item}
                                className="flex items-center gap-2.5 cursor-pointer group"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedFilters.includes(item)}
                                  onChange={() => toggleFilter(item)}
                                  className="rounded border-outline-variant/60 text-orange-500 focus:ring-orange-500/20 h-4 w-4 cursor-pointer"
                                />
                                <span className="text-[14px] text-on-surface-variant group-hover:text-primary transition-colors">
                                  {item}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* ================= ACTIVE FILTERS ================= */}
      {selectedFilters.length > 0 && !isFilterOpen && (
        <div className="flex flex-wrap gap-2 mb-8">
          {selectedFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[13px] font-medium hover:bg-orange-100 transition-colors"
            >
              {filter}
              <span className="material-symbols-outlined text-[14px]">
                close
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ================= RESULTS ================= */}
      <section>
        {filteredMentors.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-[48px] text-on-surface/10 mb-4 block">
              search_off
            </span>
            <h3 className="text-[16px] font-semibold text-primary mb-1">
              Nenhum mentor encontrado
            </h3>
            <p className="text-[14px] text-on-surface-variant">
              Tente ajustar seus filtros ou remover o termo da busca.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/30">
            {filteredMentors.map((mentor) => (
              <article
                key={mentor.id}
                className="flex flex-col sm:flex-row items-start gap-5 py-7 group cursor-pointer"
              >
                {/* Avatar */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={mentor.avatarUrl}
                    alt={mentor.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[16px] font-semibold text-primary truncate group-hover:text-orange-500 transition-colors">
                      {mentor.name}
                    </h3>
                    <span className="text-[13px] text-orange-500 font-medium">
                      {mentor.rating}
                    </span>
                  </div>
                  <p className="text-[13px] text-on-surface-variant">
                    {mentor.role} &middot; {mentor.company}
                  </p>
                  <p className="text-[13px] text-on-surface-variant/70 mt-2 line-clamp-2 max-w-[560px]">
                    {mentor.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {mentor.tags
                      .filter((t) => t !== "Tecnologia" && t !== "Direito")
                      .map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium text-on-surface-variant/60 px-2.5 py-1 bg-surface-container-low rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Price + CTA */}
                <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-3 sm:min-w-[120px]">
                  <div className="text-[15px] font-semibold text-primary">
                    R$ {mentor.price}
                    <span className="text-[12px] text-on-surface-variant/50 font-normal ml-1">
                      /sessao
                    </span>
                  </div>
                  <button className="text-[13px] font-semibold text-orange-500 hover:opacity-60 transition-opacity whitespace-nowrap">
                    Ver Perfil
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
