import { NextRequest } from "next/server";
import { validateQuery, validateBody, withErrorHandler } from "@/lib/validate";
import { requireUser } from "@/lib/auth-guard";
import { forbidden, notFound } from "@/lib/errors";
import { messageFilterSchema, sendMessageSchema } from "@/lib/schemas/message";
import * as MessageModel from "@/models/Message";
import * as ConversationModel from "@/models/Conversation";
import * as NotificationModel from "@/models/Notification";
import { findByEmail } from "@/models/User";

export const GET = withErrorHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id: conversationId } = await params;
    const filters = validateQuery(messageFilterSchema, request);

    const userRow = await findByEmail(user.email);
    if (!userRow) throw notFound("Usuário não encontrado");

    // Verify user is a participant
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) throw notFound("Conversa não encontrada");

    const isParticipant =
      conversation.student_id === userRow.id || conversation.mentor_id === userRow.id; // Note: mentor_id is the mentor's row ID, not usuario_id
    if (!isParticipant) {
      // Also check if user is the mentor's usuario_id
      const { findMentorIdByUserId } = await import("@/models/Mentor");
      const mentorId = await findMentorIdByUserId(userRow.id);
      if (!mentorId || conversation.mentor_id !== mentorId) {
        throw forbidden("Você não participa desta conversa");
      }
    }

    const messages = await MessageModel.listByConversation(
      conversationId,
      filters.cursor,
      filters.limit
    );

    // Mark as read
    await MessageModel.markConversationRead(conversationId, userRow.id);

    return Response.json({ messages });
  }
);

export const POST = withErrorHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id: conversationId } = await params;
    const data = await validateBody(sendMessageSchema, request);

    const userRow = await findByEmail(user.email);
    if (!userRow) throw notFound("Usuário não encontrado");

    // Verify conversation exists and user is a participant
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) throw notFound("Conversa não encontrada");

    const { findMentorIdByUserId } = await import("@/models/Mentor");
    const mentorId = await findMentorIdByUserId(userRow.id);

    const isParticipant =
      conversation.student_id === userRow.id || (mentorId && conversation.mentor_id === mentorId);
    if (!isParticipant) {
      throw forbidden("Você não participa desta conversa");
    }

    // Create message
    const message = await MessageModel.create({
      conversation_id: conversationId,
      sender_id: userRow.id,
      content: data.content,
    });

    // Update conversation last_message_at
    await ConversationModel.updateLastMessageAt(conversationId);

    // Create notification for the other participant
    const recipientId =
      conversation.student_id === userRow.id
        ? conversation.mentor_id // Need the mentor's usuario_id
        : conversation.student_id;

    // For simplicity, create a notification for the aluno if sender is mentor, and vice versa
    if (conversation.student_id === userRow.id) {
      // Sender is aluno, notify mentor's usuario_id
      const Mentor = await import("@/models/Mentor");
      const mentor = await Mentor.findById(conversation.mentor_id);
      if (mentor) {
        await NotificationModel.create(
          mentor.user_id,
          NotificationModel.NOTIFICATION_TYPES.NEW_MESSAGE,
          "Nova mensagem",
          `${user.name}: ${data.content.slice(0, 100)}`,
          { conversationId }
        );
      }
    } else {
      // Sender is mentor, notify aluno
      // aluno_id in conversation is the aluno table's aluno_id, which maps to usuario_id
      await NotificationModel.create(
        conversation.student_id,
        NotificationModel.NOTIFICATION_TYPES.NEW_MESSAGE,
        "Nova mensagem",
        `${user.name}: ${data.content.slice(0, 100)}`,
        { conversationId }
      );
    }

    return Response.json({ message }, { status: 201 });
  }
);
