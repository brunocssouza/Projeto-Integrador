import { z } from "zod";

export const reviewCreateSchema = z.object({
  sessaoId: z.number().int().positive("Sessão é obrigatória"),
  rating: z.number().min(1, "Nota mínima é 1").max(5, "Nota máxima é 5"),
  titulo: z.string().max(120).optional(),
  comentario: z.string().max(2000).optional(),
});

export const reviewUpdateSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  titulo: z.string().max(120).optional(),
  comentario: z.string().max(2000).optional(),
});

export const reviewFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  minRating: z.coerce.number().min(1).max(5).optional(),
  sort: z.enum(["nota", "criado_em"]).default("criado_em"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>;
