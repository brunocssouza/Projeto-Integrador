import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export interface NotificationType {
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: "booking_confirmed",
  PAYMENT_APPROVED: "payment_approved",
  SESSION_REMINDER: "session_reminder",
  NEW_MESSAGE: "new_message",
  NEW_REVIEW: "new_review",
  PAYOUT_SENT: "payout_sent",
} as const;

export async function create(
  userId: number,
  type: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  return prisma.notification.create({
    data: {
      id: randomUUID(),
      user_id: userId,
      type,
      title,
      body,
      data: data as never,
    },
  });
}

export async function listForUser(
  userId: number,
  page: number = 1,
  pageSize: number = 20,
  unreadOnly: boolean = false
) {
  const where = {
    user_id: userId,
    ...(unreadOnly ? { read_at: null } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: [{ read_at: "asc" }, { created_at: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getUnreadCount(userId: number) {
  return prisma.notification.count({
    where: {
      user_id: userId,
      read_at: null,
    },
  });
}

export async function markRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read_at: new Date() },
  });
}

export async function markAllRead(userId: number) {
  await prisma.notification.updateMany({
    where: {
      user_id: userId,
      read_at: null,
    },
    data: { read_at: new Date() },
  });
}
