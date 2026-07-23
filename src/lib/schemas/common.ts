import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const idSchema = z.coerce.number().int().positive();

export const uuidSchema = z.string().uuid();

export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");

export const brazilianPhoneSchema = z
  .string()
  .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone deve estar no formato (XX) XXXXX-XXXX");

export const cepSchema = z
  .string()
  .regex(/^\d{5}-?\d{3}$/, "CEP inválido")
  .transform((cep) => cep.replace(/\D/g, ""));

export const cpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato XXX.XXX.XXX-XX")
  .transform((cpf) => cpf.replace(/\D/g, ""));

export const cpfRawSchema = z
  .string()
  .length(11, "CPF deve ter 11 dígitos")
  .regex(/^\d{11}$/, "CPF deve conter apenas números");

export type Pagination = z.infer<typeof paginationSchema>;
