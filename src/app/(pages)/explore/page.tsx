"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

const FILTER_SCHEMA = {
  Tecnologia: {
    Cargos: [
      "Frontend Engineer",
      "Backend Engineer",
      "Full-Stack",
      "Product Manager",
      "Cloud Architect",
    ],
    Ferramentas: [
      "React",
      "Java",
      "Python",
      "TypeScript",
      "AWS",
      "Docker",
      "Next.js",
      "Node.js",
    ],
  },
};

interface Mentor {
  id: number;
  name: string;
  role: string;
  company: string | null;
  rating: number;
  price: number;
  tags: string[];
  languages: { sigla: string; name: string }[];
  description: string;
  avatar_url: string | null;
  totalReviews: number;
}

export default function ExploreMentors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recommended");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mentors", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setMentors(data.mentors || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleFilter = (filterItem: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterItem)
        ? prev.filter((f) => f !== filterItem)
        : [...prev, filterItem],
    );
  };

  const filteredMentors = useMemo(() => {
    let result = [...mentors];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q)) ||
          (m.company && m.company.toLowerCase().includes(q)) ||
          m.languages.some((l) => l.name.toLowerCase().includes(q) || l.sigla.toLowerCase().includes(q)),
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
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "recommended":
      default:
        result.sort((a, b) => (a.name < b.name ? -1 : 1));
        break;
    }

    return result;
  }, [searchQuery, selectedFilters, sortBy, mentors]);

  return (
    <div className="w-full min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-500/5 via-white to-primary/5 border-b border-outline-variant/20">
        <div className="p-8 sm:p-12 lg:p-16 max-w-[1200px] mx-auto">
          <h1 className="font-headline-lg text-[32px] lg:text-[40px] text-primary font-bold leading-tight mb-2">
            Encontre o mentor ideal
          </h1>
          <p className="text-on-surface-variant text-[15px] max-w-[480px]">
            Conecte-se com profissionais experientes que vão acelerar sua carreira em tecnologia e direito.
          </p>
        </div>
      </div>

      <div className="p-8 sm:p-12 lg:p-16 max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/40">
                search
              </span>
              <input
                className="pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-full focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 w-full sm:w-80 text-[14px] transition-all outline-none"
                placeholder="Buscar mentor, cargo, tecnologia..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border border-outline-variant/40 px-4 py-2.5 rounded-full text-[14px] font-medium text-on-surface-variant appearance-none cursor-pointer outline-none hover:bg-surface-container-low transition-colors pr-8"
          >
            <option value="recommended">Recomendados</option>
            <option value="rating">Maior Avaliação</option>
            <option value="price_asc">Menor Preço</option>
            <option value="price_desc">Maior Preço</option>
          </select>
        </div>

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

        <section>
          {loading ? (
            <div className="text-center py-24">
              <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[14px] text-on-surface-variant">
                Carregando mentores...
              </p>
            </div>
          ) : filteredMentors.length === 0 ? (
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
                  className="flex flex-col sm:flex-row items-start gap-5 py-7 group"
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-surface-container-low flex items-center justify-center flex-shrink-0">
                    <span className="text-[18px] font-bold text-primary">
                      {mentor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-[16px] font-semibold text-primary truncate group-hover:text-orange-500 transition-colors">
                        {mentor.name}
                      </h3>
                      <span className="text-[13px] text-orange-500 font-medium">
                        {Number(mentor.rating).toFixed(1)}
                      </span>
                      <span className="material-symbols-outlined text-[14px] text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="text-[12px] text-on-surface-variant/40 ml-0.5">
                        ({mentor.totalReviews})
                      </span>
                    </div>
                    <p className="text-[13px] text-on-surface-variant">
                      {mentor.role} {mentor.company ? `· ${mentor.company}` : ""}
                    </p>
                    <p className="text-[13px] text-on-surface-variant/70 mt-2 line-clamp-2 max-w-[560px]">
                      {mentor.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {mentor.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium text-on-surface-variant/60 px-2.5 py-1 bg-surface-container-low rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {mentor.languages.map((lang) => (
                        <span
                          key={lang.sigla}
                          className="text-[11px] font-medium text-primary/60 px-2.5 py-1 bg-primary/5 rounded-full"
                        >
                          {lang.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-3 sm:min-w-[120px]">
                    <div className="text-[15px] font-semibold text-primary">
                      R$ {mentor.price}
                      <span className="text-[12px] text-on-surface-variant/50 font-normal ml-1">
                        /sessão
                      </span>
                    </div>
                    <Link
                      href={`/mentor/${mentor.id}`}
                      className="text-[13px] font-semibold text-orange-500 hover:opacity-60 transition-opacity whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ver Perfil
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
