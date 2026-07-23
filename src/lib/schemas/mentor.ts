import { z } from "zod";

export const mentorSetupSchema = z.object({
  cargo: z.string().min(2, "Cargo é obrigatório").max(120),
  empresa: z.string().max(120).optional(),
  descricao: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres").max(5000),
  experienciaProfissional: z.string().max(5000).optional(),
  precoPorSessao: z.coerce.number().min(0, "Preço não pode ser negativo"),
  videoApresentacaoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  idiomaIds: z.array(z.number().int().positive()).min(1, "Selecione pelo menos 1 idioma"),
  tecnologiaIds: z.array(z.number().int().positive()).min(1, "Selecione pelo menos 1 tecnologia"),
});

export const mentorFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  idiomaId: z.coerce.number().int().positive().optional(),
  tecnologiaId: z.coerce.number().int().positive().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["rating", "preco_por_sessao", "total_avaliacoes", "criado_em"]).optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const disponibilidadeSchema = z
  .object({
    diaSemana: z.number().int().min(0).max(6),
    horaInicio: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Formato inválido. Use HH:MM"),
    horaFim: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Formato inválido. Use HH:MM"),
    plataformasVideo: z
      .array(z.enum(["google_meet", "microsoft_teams", "zoom", "discord"]))
      .optional(),
  })
  .refine((data) => data.horaInicio < data.horaFim, {
    message: "Hora de início deve ser anterior à hora de fim",
    path: ["horaFim"],
  });

export const disponibilidadeListSchema = z.object({
  disponibilidades: z.array(disponibilidadeSchema).min(1, "Adicione pelo menos 1 horário"),
});

export type MentorSetupInput = z.infer<typeof mentorSetupSchema>;
export type MentorFilterInput = z.infer<typeof mentorFilterSchema>;
export type DisponibilidadeInput = z.infer<typeof disponibilidadeSchema>;
