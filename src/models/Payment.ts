import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export interface PaymentWithSession {
  id: number;
  session_id: number;
  payer_user_id: number;
  amount: number;
  method: string;
  status: string;
  provider: string | null;
  provider_payment_id: string | null;
  pix_qr_code: string | null;
  pix_ticket_url: string | null;
  paid_at: Date | null;
  refunded_at: Date | null;
  created_at: Date;
  session?: {
    title: string;
    area: string;
    scheduled_at: Date;
  };
}

export async function create(data: {
  session_id: number;
  payer_user_id: number;
  amount: number;
  method: string;
  provider?: string;
  provider_payment_id?: string;
  pix_qr_code?: string;
  pix_ticket_url?: string;
}): Promise<number> {
  const result = await prisma.payment.create({
    data: {
      session_id: data.session_id,
      payer_user_id: data.payer_user_id,
      amount: data.amount,
      method: data.method as never,
      status: "pending" as never,
      provider: data.provider ?? "mercadopago",
      provider_payment_id: data.provider_payment_id,
      pix_qr_code: data.pix_qr_code,
      pix_ticket_url: data.pix_ticket_url,
    },
  });
  return result.id;
}

export async function findById(paymentId: number) {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      session: {
        select: { title: true, area: true, scheduled_at: true },
      },
    },
  });
}

export async function findBySession(sessionId: number) {
  return prisma.payment.findFirst({
    where: { session_id: sessionId },
  });
}

export async function updateStatus(
  paymentId: number,
  status: string,
  providerPaymentId?: string,
  paidAt?: Date
) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: status as never,
      provider_payment_id: providerPaymentId,
      paid_at: paidAt,
    },
  });
}

export async function updatePixData(
  paymentId: number,
  data: { provider_payment_id: string; pix_qr_code: string; pix_ticket_url: string }
) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      provider_payment_id: data.provider_payment_id,
      pix_qr_code: data.pix_qr_code,
      pix_ticket_url: data.pix_ticket_url,
    },
  });
}

export async function markRefunded(paymentId: number) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "refunded" as never,
      refunded_at: new Date(),
    },
  });
}

export async function listForUser(userId: number, page: number = 1, pageSize: number = 20) {
  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where: { payer_user_id: userId },
      include: {
        session: {
          select: { title: true, area: true, scheduled_at: true },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.payment.count({
      where: { payer_user_id: userId },
    }),
  ]);

  return { items, total, page, pageSize };
}
