"use client";

import Link from "next/link";
import { use, useState, useEffect } from "react";

interface MentorData {
  id: number;
  name: string;
  cargo: string;
  empresa: string | null;
  description: string;
  experience: string | null;
  rating: number;
  totalReviews: number;
  price: number;
  technologies: string[];
  languages: { sigla: string; name: string }[];
  reviews: { id: number; rating: number; title: string; comment: string; date: string; studentName: string }[];
  availability: { id: number; dayOfWeek: number; startTime: string; endTime: string; plataformasVideo: string[] }[];
  avatar_url: string | null;
}

const DIA_LABELS: Record<number, string> = {
  0: "Domingo", 1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta", 6: "Sábado",
};

const DIA_LABELS_SHORT: Record<number, string> = {
  0: "DOM", 1: "SEG", 2: "TER", 3: "QUA", 4: "QUI", 5: "SEX", 6: "SÁB",
};

const PLATFORM_LABELS: Record<string, string> = {
  google_meet: "Google Meet",
  microsoft_teams: "Microsoft Teams",
  zoom: "Zoom",
  discord: "Discord",
};

const PLATFORM_ICONS: Record<string, string> = {
  google_meet: "video_chat",
  microsoft_teams: "groups",
  zoom: "videocam",
  discord: "headset_mic",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`material-symbols-outlined text-[16px] ${
            star <= Math.round(rating) ? "text-orange-500" : "text-outline-variant/40"
          }`}
          style={{ fontVariationSettings: star <= Math.round(rating) ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

type BookingStep = "date" | "time" | "confirm";

export default function MentorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mentor, setMentor] = useState<MentorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<BookingStep>("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionArea, setSessionArea] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    fetch(`/api/mentors/${id}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setMentor(data.mentor);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 w-full max-w-[1200px] mx-auto min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !mentor) {
    return (
      <div className="p-16 w-full max-w-[1200px] mx-auto min-h-screen flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-[48px] text-on-surface/20 mb-4">
          person_off
        </span>
        <h1 className="text-[20px] font-semibold text-primary mb-2">
          Mentor não encontrado
        </h1>
        <p className="text-on-surface-variant text-[14px] mb-6">
          Este perfil não existe ou foi removido.
        </p>
        <Link
          href="/explore"
          className="text-orange-500 font-semibold text-[14px] hover:opacity-60 transition-opacity"
        >
          ← Voltar para Explorar
        </Link>
      </div>
    );
  }

  const availabilityByDay: Record<number, { startTime: string; endTime: string; plataformasVideo: string[] }[]> = {};
  mentor.availability.forEach((a) => {
    if (!availabilityByDay[a.dayOfWeek]) availabilityByDay[a.dayOfWeek] = [];
    availabilityByDay[a.dayOfWeek].push({ startTime: a.startTime, endTime: a.endTime, plataformasVideo: a.plataformasVideo });
  });

  const getNext14Days = () => {
    const days: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const nextDays = getNext14Days();
  const availableDays = nextDays.filter((d) => {
    const dayOfWeek = d.getDay();
    return availabilityByDay[dayOfWeek] && availabilityByDay[dayOfWeek].length > 0;
  });

  const getSlotsForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    return availabilityByDay[dayOfWeek] || [];
  };

  const getAllPlatforms = () => {
    const platforms = new Set<string>();
    mentor.availability.forEach((a) => {
      a.plataformasVideo.forEach((p) => platforms.add(p));
    });
    return Array.from(platforms);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSelectedPlatform("");
    setBookingStep("time");
  };

  const handleSlotSelect = (slot: { startTime: string; endTime: string }) => {
    setSelectedSlot(slot);
    const platforms = mentor.availability.find(
      (a) => a.dayOfWeek === selectedDate?.getDay() && a.startTime === slot.startTime
    )?.plataformasVideo || [];
    if (platforms.length === 1) setSelectedPlatform(platforms[0]);
    setBookingStep("confirm");
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !selectedPlatform || !sessionTitle || !sessionArea) return;
    setBookingLoading(true);
    setBookingError("");

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}T${selectedSlot.startTime}:00`;

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          mentor_id: Number(id),
          titulo: sessionTitle,
          area: sessionArea,
          data_hora: dateStr,
          duracao_min: 60,
          plataforma_video: selectedPlatform,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBookingError(data.error || "Erro ao agendar sessão");
        return;
      }

      setBookingSuccess(true);
    } catch {
      setBookingError("Erro de conexão");
    } finally {
      setBookingLoading(false);
    }
  };

  const resetBooking = () => {
    setBookingOpen(false);
    setBookingStep("date");
    setSelectedDate(null);
    setSelectedSlot(null);
    setSelectedPlatform("");
    setSessionTitle("");
    setSessionArea("");
    setBookingSuccess(false);
    setBookingError("");
  };

  return (
    <div className="p-8 sm:p-12 lg:p-16 w-full max-w-[1200px] mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-12">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-container-low flex items-center justify-center flex-shrink-0">
          <span className="text-[24px] font-bold text-primary">
            {mentor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <h1 className="font-headline-lg text-[28px] text-primary font-bold">
              {mentor.name}
            </h1>
            <div className="flex items-center gap-2">
              <StarRating rating={mentor.rating} />
              <span className="text-[14px] font-semibold text-primary">
                {Number(mentor.rating).toFixed(1)}
              </span>
              <span className="text-[13px] text-on-surface-variant">
                ({mentor.totalReviews} avaliações)
              </span>
            </div>
          </div>
          <p className="text-on-surface-variant text-[14px] mb-1">
            {mentor.cargo} {mentor.empresa ? `@ ${mentor.empresa}` : ""}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[20px] font-bold text-orange-500">
              R$ {mentor.price}
            </span>
            <span className="text-[13px] text-on-surface-variant">/sessão</span>
          </div>
        </div>
        <button
          onClick={() => { resetBooking(); setBookingOpen(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full text-[14px] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          Agendar Sessão
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 flex flex-col gap-10">
          <section>
            <h2 className="text-[18px] font-semibold text-primary mb-4">Sobre</h2>
            <p className="text-on-surface-variant text-[14px] leading-relaxed">
              {mentor.description}
            </p>
          </section>

          {mentor.experience && (
            <section>
              <h2 className="text-[18px] font-semibold text-primary mb-4">
                Experiência Profissional
              </h2>
              <p className="text-on-surface-variant text-[14px] leading-relaxed">
                {mentor.experience}
              </p>
            </section>
          )}

          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-semibold text-primary">
                Avaliações dos Alunos
              </h2>
              <span className="text-[13px] text-on-surface-variant/50 font-medium">
                {mentor.totalReviews} avaliações
              </span>
            </div>
            {mentor.reviews.length === 0 ? (
              <p className="text-[14px] text-on-surface-variant/50">
                Nenhuma avaliação ainda.
              </p>
            ) : (
              <div className="space-y-6">
                {mentor.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-outline-variant/30 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-[14px] font-semibold text-primary">
                          {review.studentName}
                        </p>
                        <p className="text-[12px] text-on-surface-variant/50">
                          {new Date(review.date).toLocaleDateString("pt-BR", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-[14px] text-on-surface-variant leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-10">
          <section>
            <h2 className="text-[18px] font-semibold text-primary mb-4">
              Especialidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {mentor.technologies.map((tech) => (
                <span
                  key={tech}
                  className="text-[13px] font-medium text-on-surface-variant px-3 py-1.5 bg-surface-container-low rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-primary mb-4">
              Idiomas
            </h2>
            <div className="flex flex-wrap gap-2">
              {mentor.languages.map((lang) => (
                <span
                  key={lang.sigla}
                  className="text-[13px] font-medium text-on-surface-variant px-3 py-1.5 bg-surface-container-low rounded-full"
                >
                  {lang.name}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-primary mb-4">
              Disponibilidade
            </h2>
            {Object.keys(availabilityByDay).length === 0 ? (
              <p className="text-[13px] text-on-surface-variant/50">
                Nenhum horário disponível.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(availabilityByDay).map(([day, slots]) => (
                  <div key={day} className="flex items-start gap-3">
                    <span className="text-[13px] font-semibold text-primary min-w-[80px]">
                      {DIA_LABELS[Number(day)]}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {slots.map((s, i) => (
                        <span
                          key={i}
                          className="text-[12px] font-medium text-on-surface-variant px-2.5 py-1 bg-surface-container-low rounded-full font-mono"
                        >
                          {s.startTime} - {s.endTime}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={resetBooking} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[520px] mx-4 max-h-[85vh] overflow-y-auto">
            {bookingSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-[32px] text-green-600">check_circle</span>
                </div>
                <h3 className="text-[20px] font-bold text-primary mb-2">Sessão Agendada!</h3>
                <p className="text-[14px] text-on-surface-variant mb-6">
                  Sua solicitação foi enviada ao mentor. Você será notificado quando ele aprovar.
                </p>
                <button
                  onClick={resetBooking}
                  className="bg-orange-500 text-white px-6 py-2.5 rounded-full text-[14px] font-semibold hover:bg-orange-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[18px] font-bold text-primary">
                    {bookingStep === "date" && "Escolha o dia"}
                    {bookingStep === "time" && "Escolha o horário"}
                    {bookingStep === "confirm" && "Confirme sua sessão"}
                  </h3>
                  <button
                    onClick={resetBooking}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
                  </button>
                </div>

                {/* Step indicators */}
                <div className="flex items-center gap-2 mb-6">
                  {(["date", "time", "confirm"] as const).map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold ${
                          bookingStep === step
                            ? "bg-orange-500 text-white"
                            : (["date", "time", "confirm"].indexOf(bookingStep) > i)
                              ? "bg-green-500 text-white"
                              : "bg-surface-container-low text-on-surface-variant"
                        }`}
                      >
                        {(["date", "time", "confirm"].indexOf(bookingStep) > i) ? "✓" : i + 1}
                      </div>
                      {i < 2 && (
                        <div className={`w-8 h-0.5 ${
                          (["date", "time", "confirm"].indexOf(bookingStep) > i)
                            ? "bg-green-500"
                            : "bg-outline-variant/40"
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                {bookingError && (
                  <div className="bg-red-50 text-red-600 text-[13px] px-4 py-2.5 rounded-xl mb-4">
                    {bookingError}
                  </div>
                )}

                {/* Step 1: Date selection */}
                {bookingStep === "date" && (
                  <div>
                    <div className="grid grid-cols-7 gap-1.5 mb-4">
                      {nextDays.map((day) => {
                        const dayOfWeek = day.getDay();
                        const hasSlots = availabilityByDay[dayOfWeek] && availabilityByDay[dayOfWeek].length > 0;
                        const isToday = new Date().toDateString() === day.toDateString();
                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => hasSlots && handleDateSelect(day)}
                            disabled={!hasSlots}
                            className={`flex flex-col items-center py-2.5 rounded-xl text-[13px] transition-all ${
                              hasSlots
                                ? "hover:bg-orange-50 cursor-pointer text-primary"
                                : "text-on-surface-variant/30 cursor-not-allowed"
                            } ${isToday ? "ring-1 ring-orange-400" : ""}`}
                          >
                            <span className="text-[10px] uppercase font-semibold text-on-surface-variant/50">
                              {DIA_LABELS_SHORT[dayOfWeek]}
                            </span>
                            <span className={`text-[16px] font-bold mt-0.5 ${hasSlots ? "text-primary" : ""}`}>
                              {day.getDate()}
                            </span>
                            {hasSlots && (
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {availableDays.length === 0 && (
                      <p className="text-center text-[13px] text-on-surface-variant/50 py-4">
                        Nenhum horário disponível nos próximos 14 dias.
                      </p>
                    )}
                  </div>
                )}

                {/* Step 2: Time selection */}
                {bookingStep === "time" && selectedDate && (
                  <div>
                    <p className="text-[13px] text-on-surface-variant mb-4">
                      {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                    </p>
                    <div className="space-y-2">
                      {getSlotsForDate(selectedDate).map((slot, i) => (
                        <button
                          key={i}
                          onClick={() => handleSlotSelect(slot)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-surface-container-low rounded-xl hover:bg-orange-50 transition-colors cursor-pointer"
                        >
                          <span className="text-[14px] font-medium text-primary font-mono">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <div className="flex gap-1">
                            {slot.plataformasVideo.map((p) => (
                              <span key={p} className="material-symbols-outlined text-[16px] text-on-surface-variant/40">
                                {PLATFORM_ICONS[p] || "videocam"}
                              </span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setBookingStep("date")}
                      className="mt-4 text-[13px] text-on-surface-variant hover:text-primary transition-colors"
                    >
                      ← Voltar
                    </button>
                  </div>
                )}

                {/* Step 3: Confirm */}
                {bookingStep === "confirm" && selectedDate && selectedSlot && (
                  <div className="space-y-4">
                    <div className="bg-surface-container-low rounded-xl p-4">
                      <p className="text-[13px] text-on-surface-variant">
                        {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                        {" · "}
                        <span className="font-mono font-medium text-primary">
                          {selectedSlot.startTime} - {selectedSlot.endTime}
                        </span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Título da Sessão
                      </label>
                      <input
                        type="text"
                        value={sessionTitle}
                        onChange={(e) => setSessionTitle(e.target.value)}
                        placeholder="ex: Entrevista React"
                        className="w-full px-4 py-2.5 border border-outline-variant/40 rounded-xl text-[14px] outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Área / Especialidade
                      </label>
                      <input
                        type="text"
                        value={sessionArea}
                        onChange={(e) => setSessionArea(e.target.value)}
                        placeholder="ex: Frontend, System Design"
                        className="w-full px-4 py-2.5 border border-outline-variant/40 rounded-xl text-[14px] outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Plataforma de Video
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(mentor.availability.find(
                          (a) => a.dayOfWeek === selectedDate.getDay() && a.startTime === selectedSlot.startTime
                        )?.plataformasVideo || getAllPlatforms()).map((p) => (
                          <button
                            key={p}
                            onClick={() => setSelectedPlatform(p)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                              selectedPlatform === p
                                ? "bg-primary text-white"
                                : "bg-surface-container-low text-on-surface-variant border border-outline-variant/40 hover:border-outline-variant"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {PLATFORM_ICONS[p] || "videocam"}
                            </span>
                            {PLATFORM_LABELS[p] || p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => setBookingStep("time")}
                        className="px-5 py-2.5 rounded-full text-[14px] font-medium border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low transition-colors"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={handleBooking}
                        disabled={!sessionTitle || !sessionArea || !selectedPlatform || bookingLoading}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-full text-[14px] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bookingLoading ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[18px]">check</span>
                            Confirmar Agendamento
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
