"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

// 1. Definição do Esquema de Filtros (Fácil de escalar no futuro)
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

// 2. Base de dados atualizada com atributos consistentes
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
  // Estados
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recommended");

  // Controle de quais grandes áreas (Tecnologia, Direito) estão abertas no menu
  const [openCategories, setOpenCategories] = useState<string[]>(
    Object.keys(FILTER_SCHEMA),
  );

  // Função para abrir/fechar as categorias principais
  const toggleCategory = (category: string) => {
    setOpenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  // Função para marcar/desmarcar filtros específicos
  const toggleFilter = (filterItem: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterItem)
        ? prev.filter((f) => f !== filterItem)
        : [...prev, filterItem],
    );
  };

  // Motor principal de busca e filtragem
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
        // Criamos um array com todas as características do mentor para bater contra os filtros
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
    <>
      <header className="bg-white dark:bg-surface-dim border-b border-outline-variant shadow-sm w-full h-16 fixed top-0 z-50">
        <div className="hidden lg:flex justify-between items-center px-lg h-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-xl">
            <span className="font-headline-md font-bold text-primary">
              Mock Mentor
            </span>
            <nav className="flex items-center gap-lg">
              <Link
                href="/dashboard"
                className="text-on-surface-variant font-medium hover:text-orange-500 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/mentores"
                className="text-orange-500 border-b-2 border-orange-500 font-bold pb-1 transition-colors"
              >
                Mentores
              </Link>
              <Link
                href="/agendamentos"
                className="text-on-surface-variant font-medium hover:text-orange-500 transition-colors"
              >
                Agendamentos
              </Link>
              <Link
                href="/relatorios"
                className="text-on-surface-variant font-medium hover:text-orange-500 transition-colors"
              >
                Relatórios
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                className="pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-orange-500 w-64 text-label-md transition-all outline-none"
                placeholder="Buscar mentor ou habilidade..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-lg py-2 rounded-full font-bold transition-colors text-label-md shadow-sm">
              Marcar Entrevista
            </button>
            <div className="flex items-center gap-sm ml-sm">
              <button className="text-on-surface-variant hover:text-orange-500 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="text-on-surface-variant hover:text-orange-500 transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-gray-300"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 lg:px-lg max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-lg min-h-screen">
        {/* SIDEBAR DE FILTROS ANINHADOS */}
        <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24 h-fit">
          <div className="bg-white border border-outline-variant rounded-xl p-md shadow-sm">
            <div className="flex justify-between items-center mb-lg">
              <h2 className="font-headline-sm text-primary">Filtros</h2>
              {selectedFilters.length > 0 && (
                <span className="bg-orange-100 text-orange-700 text-[11px] font-bold px-2 py-1 rounded-full">
                  {selectedFilters.length} ativos
                </span>
              )}
            </div>

            <div className="space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar pr-2">
              {Object.entries(FILTER_SCHEMA).map(
                ([mainCategory, subCategories]) => (
                  <div
                    key={mainCategory}
                    className="border-b border-outline-variant/50 pb-4 last:border-0"
                  >
                    {/* Categoria Principal (Expansível) */}
                    <button
                      onClick={() => toggleCategory(mainCategory)}
                      className="flex justify-between items-center w-full group"
                    >
                      <h3 className="font-headline-sm text-base text-primary font-bold group-hover:text-orange-500 transition-colors">
                        {mainCategory}
                      </h3>
                      <span className="material-symbols-outlined text-outline-variant group-hover:text-orange-500 transition-colors">
                        {openCategories.includes(mainCategory)
                          ? "expand_less"
                          : "expand_more"}
                      </span>
                    </button>

                    {/* Subcategorias e Checkboxes */}
                    {openCategories.includes(mainCategory) && (
                      <div className="mt-4 space-y-5">
                        {Object.entries(subCategories).map(
                          ([subCategoryName, items]) => (
                            <div key={subCategoryName} className="pl-2">
                              <h4 className="font-label-md text-on-surface-variant font-bold mb-2 uppercase text-[11px] tracking-wider">
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
                    )}
                  </div>
                ),
              )}
            </div>

            <button
              onClick={() => {
                setSelectedFilters([]);
                setSearchQuery("");
              }}
              className="w-full py-2 border border-orange-500 text-orange-600 font-bold rounded-full text-label-md hover:bg-orange-50 transition-colors mt-lg"
            >
              Limpar Filtros
            </button>
          </div>
        </aside>

        {/* MENTOR GRID */}
        <section className="grow">
          <div className="mb-lg flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h1 className="font-headline-lg text-primary font-bold text-2xl">
                Explore Mentores
              </h1>
              <p className="text-on-surface-variant text-body-md mt-2">
                Conecte-se com especialistas das maiores empresas para acelerar
                sua carreira.
              </p>
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant pointer-events-none">
                sort
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-white border border-outline-variant pl-10 pr-8 py-2 rounded-xl text-label-md font-bold hover:border-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none cursor-pointer outline-none shadow-sm"
              >
                <option value="recommended">Recomendados</option>
                <option value="rating">Maior Avaliação</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
              </select>
            </div>
          </div>

          {filteredMentors.length === 0 && (
            <div className="bg-white border border-outline-variant rounded-xl p-12 text-center">
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
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-lg">
            {filteredMentors.map((mentor) => (
              <article
                key={mentor.id}
                className="bg-white border border-outline-variant rounded-xl p-md mentor-card-shadow flex flex-col group hover:border-orange-500 transition-all duration-300 active:scale-[0.98]"
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
                      <span className="absolute -bottom-2 -right-2 bg-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
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

                <div className="pt-md border-t border-outline-variant flex items-center justify-between">
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
        </section>
      </main>
    </>
  );
}
