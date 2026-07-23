import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function create(data: {
  conversation_id: string;
  sender_id: number;
  content: string;
}) {
  return prisma.message.create({
    data: {
      id: randomUUID(),
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      content: data.content,
    },
  });
}

export async function listByConversation(
  conversationId: string,
  cursor?: string,
  limit: number = 50
) {
  return prisma.message.findMany({
    where: { conversation_id: conversationId },
    orderBy: { created_at: "desc" },
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });
}

export async function markConversationRead(conversationId: string, userId: number) {
  // Mark all messages NOT sent by this user as read
  await prisma.message.updateMany({
    where: {
      conversation_id: conversationId,
      sender_id: { not: userId },
      read_at: null,
    },
    data: { read_at: new Date() },
  });
}

export async function getUnreadCount(conversationId: string, userId: number) {
  return prisma.message.count({
    where: {
      conversation_id: conversationId,
      sender_id: { not: userId },
      read_at: null,
    },
  });
}

export async function getTotalUnreadForUser(userId: number) {
  // Find mentor_id for this user (if they are a mentor)
  const mentor = await prisma.mentor.findFirst({
    where: { user_id: userId },
    select: { id: true },
  });

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ student_id: userId }, { mentor_id: mentor?.id ?? -1 }],
    },
    select: { id: true },
  });

  const conversationIds = conversations.map((c) => c.id);
  if (conversationIds.length === 0) return 0;

  return prisma.message.count({
    where: {
      conversation_id: { in: conversationIds },
      sender_id: { not: userId },
      read_at: null,
    },
  });
}
