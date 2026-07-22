"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/contexts/AuthContext";

const DIAS_SEMANA = [
  { value: 1, label: "Segunda-feira", short: "SEG" },
  { value: 2, label: "Terça-feira", short: "TER" },
  { value: 3, label: "Quarta-feira", short: "QUA" },
  { value: 4, label: "Quinta-feira", short: "QUI" },
  { value: 5, label: "Sexta-feira", short: "SEX" },
  { value: 6, label: "Sábado", short: "SAB" },
  { value: 0, label: "Domingo", short: "DOM" },
];

const PLATFORMS = [
  { key: "google_meet", label: "Google Meet", icon: "video_chat" },
  { key: "microsoft_teams", label: "Teams", icon: "groups" },
  { key: "zoom", label: "Zoom", icon: "videocam" },
  { key: "discord", label: "Discord", icon: "headset_mic" },
];

interface Horario {
  id: string;
  horaInicio: string;
  horaFim: string;
  plataformas: string[];
}

interface DisponibilidadeDia {
  dia: number;
  horarios: Horario[];
  ativo: boolean;
}

const defaultSchedule: DisponibilidadeDia[] = DIAS_SEMANA.map((d) => ({
  dia: d.value,
  horarios: [],
  ativo: false,
}));

export default function DisponibilidadePage() {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [schedule, setSchedule] = useState<DisponibilidadeDia[]>(defaultSchedule);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("12:00");
  const [newPlatforms, setNewPlatforms] = useState<string[]>(["google_meet"]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/v1/mentors/${user.id}/disponibilidade`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data.availability?.length > 0) {
          const merged = defaultSchedule.map((d) => {
            const slots = data.availability.filter(
              (a: { dayOfWeek: number; startTime: string; endTime: string; id: number; plataformasVideo: string[] }) => a.dayOfWeek === d.dia
            );
            return {
              ...d,
              ativo: slots.length > 0,
              horarios: slots.map((s: { id: number; startTime: string; endTime: string; plataformasVideo: string[] }) => ({
                id: String(s.id),
                horaInicio: s.startTime,
                horaFim: s.endTime,
                plataformas: s.plataformasVideo || [],
              })),
            };
          });
          setSchedule(merged);
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const toggleDay = (dia: number) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dia === dia ? { ...d, ativo: !d.ativo } : d
      )
    );
  };

  const togglePlatform = (platform: string) => {
    setNewPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const addHorario = (dia: number) => {
    if (!newStart || !newEnd || newStart >= newEnd) return;
    const id = `${dia}-${Date.now()}`;
    setSchedule((prev) =>
      prev.map((d) =>
        d.dia === dia
          ? { ...d, horarios: [...d.horarios, { id, horaInicio: newStart, horaFim: newEnd, plataformas: [...newPlatforms] }] }
          : d
      )
    );
    setShowAddForm(false);
    setNewStart("09:00");
    setNewEnd("12:00");
    setNewPlatforms(["google_meet"]);
  };

  const removeHorario = (dia: number, horarioId: string) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dia === dia
          ? { ...d, horarios: d.horarios.filter((h) => h.id !== horarioId) }
          : d
      )
    );
  };

  const toggleSlotPlatform = (dia: number, horarioId: string, platform: string) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dia === dia
          ? {
              ...d,
              horarios: d.horarios.map((h) =>
                h.id === horarioId
                  ? {
                      ...h,
                      plataformas: h.plataformas.includes(platform)
                        ? h.plataformas.filter((p) => p !== platform)
                        : [...h.plataformas, platform],
                    }
                  : h
              ),
            }
          : d
      )
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const slots: { dayOfWeek: number; startTime: string; endTime: string; plataformasVideo: string[] }[] = [];
      schedule.forEach((d) => {
        if (d.ativo) {
          d.horarios.forEach((h) => {
            slots.push({
              dayOfWeek: d.dia,
              startTime: h.horaInicio,
              endTime: h.horaFim,
              plataformasVideo: h.plataformas,
            });
          });
        }
      });

      await fetch(`/api/v1/mentors/${user.id}/disponibilidade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slots }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 sm:p-12 lg:p-16 w-full max-w-[1000px] mx-auto min-h-screen">
      <div ref={containerRef}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
          <div>
            <h1 className="font-headline-lg text-[28px] lg:text-[32px] text-primary font-bold mb-1">
              Minha Disponibilidade
            </h1>
            <p className="text-on-surface-variant text-[14px]">
              Configure os horários e plataformas de video para suas sessões.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-full text-[14px] transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {saved ? (
              <>
                <span className="material-symbols-outlined text-[18px]">check</span>
                Salvo!
              </>
            ) : saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Salvar Alterações
              </>
            )}
          </button>
        </div>

        <div className="space-y-3">
          {DIAS_SEMANA.map((dia) => {
            const daySchedule = schedule.find((d) => d.dia === dia.value)!;
            const isExpanded = expandedDay === dia.value;
            return (
              <div
                key={dia.value}
                className="bg-white border border-outline-variant/40 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleDay(dia.value)}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        daySchedule.ativo ? "bg-orange-500" : "bg-outline-variant/40"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          daySchedule.ativo ? "translate-x-[18px]" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-[15px] font-semibold text-primary">
                      {dia.label}
                    </span>
                    {daySchedule.ativo && daySchedule.horarios.length > 0 && (
                      <span className="text-[12px] text-on-surface-variant/50">
                        {daySchedule.horarios.length} horário{daySchedule.horarios.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {daySchedule.ativo && (
                    <button
                      onClick={() => setExpandedDay(isExpanded ? null : dia.value)}
                      className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </button>
                  )}
                </div>

                {isExpanded && daySchedule.ativo && (
                  <div className="px-5 pb-5 border-t border-outline-variant/20 pt-4">
                    {daySchedule.horarios.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {daySchedule.horarios.map((h) => (
                          <div key={h.id} className="bg-surface-container-low rounded-xl px-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[14px] font-medium text-on-surface font-mono">
                                {h.horaInicio} - {h.horaFim}
                              </span>
                              <button
                                onClick={() => removeHorario(dia.value, h.id)}
                                className="text-on-surface-variant/40 hover:text-red-500 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  close
                                </span>
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {PLATFORMS.map((p) => (
                                <button
                                  key={p.key}
                                  onClick={() => toggleSlotPlatform(dia.value, h.id, p.key)}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                                    h.plataformas.includes(p.key)
                                      ? "bg-primary text-white"
                                      : "bg-white text-on-surface-variant border border-outline-variant/40 hover:border-outline-variant"
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {p.icon}
                                  </span>
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-on-surface-variant/50 mb-4">
                        Nenhum horário adicionado.
                      </p>
                    )}

                    {showAddForm ? (
                      <div className="bg-white border border-outline-variant/30 rounded-xl p-4 space-y-3">
                        <div className="flex items-end gap-3">
                          <div>
                            <label className="block text-[11px] text-on-surface-variant/50 mb-1 uppercase tracking-wider font-bold">
                              Início
                            </label>
                            <input
                              type="time"
                              value={newStart}
                              onChange={(e) => setNewStart(e.target.value)}
                              className="px-3 py-2 border border-outline-variant/40 rounded-lg text-[14px] font-mono outline-none focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-on-surface-variant/50 mb-1 uppercase tracking-wider font-bold">
                              Fim
                            </label>
                            <input
                              type="time"
                              value={newEnd}
                              onChange={(e) => setNewEnd(e.target.value)}
                              className="px-3 py-2 border border-outline-variant/40 rounded-lg text-[14px] font-mono outline-none focus:border-orange-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] text-on-surface-variant/50 mb-1.5 uppercase tracking-wider font-bold">
                            Plataformas de Video
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {PLATFORMS.map((p) => (
                              <button
                                key={p.key}
                                onClick={() => togglePlatform(p.key)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                                  newPlatforms.includes(p.key)
                                    ? "bg-primary text-white"
                                    : "bg-surface-container-low text-on-surface-variant border border-outline-variant/40 hover:border-outline-variant"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {p.icon}
                                </span>
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => addHorario(dia.value)}
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-orange-600 transition-colors cursor-pointer"
                          >
                            Adicionar
                          </button>
                          <button
                            onClick={() => setShowAddForm(false)}
                            className="text-on-surface-variant/40 hover:text-on-surface-variant text-[13px] transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-1.5 text-[13px] font-medium text-orange-500 hover:opacity-60 transition-opacity cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Adicionar horário
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
