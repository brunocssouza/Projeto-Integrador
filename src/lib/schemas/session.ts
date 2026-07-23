import { z } from "zod";

export const bookingSchema = z.object({
  mentorId: z.number().int().positive("Mentor é obrigatório"),
  dataHora: z.string().datetime("Data/hora inválida"),
  duracaoMin: z.number().int().min(30).max(180).default(60),
  titulo: z.string().min(3, "Título é obrigatório").max(200),
  area: z.string().min(2, "Área é obrigatória").max(100),
  plataformaVideo: z.enum(["google_meet", "microsoft_teams", "zoom", "discord"]).optional(),
  notes: z.string().max(1000).optional(),
});

export const rescheduleSchema = z.object({
  novaDataHora: z.string().datetime("Nova data/hora inválida"),
  motivo: z.string().max(300).optional(),
});

export const cancelSchema = z.object({
  motivo: z.enum([
    "conflito_horario",
    "problema_tecnico",
    "nao_precisa_mais",
    "mentor_nao_respondeu",
    "outro",
  ]),
  detalhes: z.string().max(300).optional(),
});

export const sessionFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["agendada", "em_andamento", "concluida", "cancelada"]).optional(),
  role: z.enum(["aluno", "mentor"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type RescheduleInput = z.infer<typeof rescheduleSchema>;
export type CancelInput = z.infer<typeof cancelSchema>;
