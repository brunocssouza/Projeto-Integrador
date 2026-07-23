import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function findOrCreate(studentId: number, mentorId: number) {
  const existing = await prisma.conversation.findFirst({
    where: { student_id: studentId, mentor_id: mentorId },
  });

  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      id: randomUUID(),
      student_id: studentId,
      mentor_id: mentorId,
    },
  });
}

export async function findById(id: string) {
  return prisma.conversation.findUnique({ where: { id } });
}

export async function listByUser(userId: number, page: number = 1, pageSize: number = 20) {
  const [items, total] = await Promise.all([
    prisma.$queryRaw`
      SELECT c.*,
             ua.name AS student_name, ua.avatar_url AS student_avatar,
             ut.name AS mentor_name, ut.avatar_url AS mentor_avatar,
             (SELECT content FROM message m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message
      FROM conversation c
      JOIN student a ON a.id = c.student_id
      JOIN \`user\` ua ON ua.id = a.user_id
      JOIN mentor t ON t.id = c.mentor_id
      JOIN \`user\` ut ON ut.id = t.user_id
      WHERE a.user_id = ${userId} OR t.user_id = ${userId}
      ORDER BY c.last_message_at DESC
      LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    ` as Promise<unknown[]>,
    prisma.$queryRaw`
      SELECT COUNT(*) as total
      FROM conversation c
      JOIN student a ON a.id = c.student_id
      JOIN mentor t ON t.id = c.mentor_id
      WHERE a.user_id = ${userId} OR t.user_id = ${userId}
    ` as Promise<{ total: number }[]>,
  ]);

  const totalCount = Array.isArray(total) && total.length > 0 ? Number(total[0].total) : 0;

  return { items, total: totalCount, page, pageSize };
}

export async function updateLastMessageAt(conversationId: string) {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { last_message_at: new Date() },
  });
}
