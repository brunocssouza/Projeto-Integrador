import { z } from "zod";

export const sendMessageSchema = z
  .object({
    conversationId: z.string().uuid("ID de conversa inválido").optional(),
    mentorId: z.number().int().positive("Mentor é obrigatório").optional(),
    content: z.string().min(1, "Mensagem não pode estar vazia").max(2000, "Mensagem muito longa"),
  })
  .refine((data) => data.conversationId || data.mentorId, {
    message: "Informe o ID da conversa ou do mentor",
  });

export const messageFilterSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const conversationFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
