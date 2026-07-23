import { z } from "zod";

export const checkoutSchema = z.object({
  sessionId: z.number().int().positive("Sessão é obrigatória"),
  method: z.enum(["pix", "cartao_credito"]).default("pix"),
  // For card payments:
  cardToken: z.string().optional(),
  installments: z.number().int().min(1).max(12).optional(),
  cardHolderName: z.string().optional(),
  cardHolderDocType: z.enum(["CPF", "CNPJ"]).optional(),
  cardHolderDocNumber: z.string().optional(),
});

export const refundRequestSchema = z.object({
  reason: z.string().min(10, "Descreva o motivo do reembolso").max(500),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type RefundRequestInput = z.infer<typeof refundRequestSchema>;
