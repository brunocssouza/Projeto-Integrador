import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import {
  findByIdWithDetails,
  findById,
  verifyOwnership,
  approve,
  decline,
  cancel,
  updateLink,
  start,
  complete,
  joinAsMentor,
  joinAsAluno,
} from "@/models/Session";
import { findById as findUserById } from "@/models/User";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await requireAuth(request);
    const { id } = await params;
    const sessaoId = Number(id);

    const session = await findByIdWithDetails(sessaoId);
    if (!session) {
      return Response.json({ error: "Sessão não encontrada" }, { status: 404 });
    }

    return Response.json({ session });
  } catch (error) {
    console.error("Session GET error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await requireAuth(request);
    const { id } = await params;
    const sessaoId = Number(id);
    const body = await request.json();
    const { action, link_reuniao, motivo_cancelamento } = body;

    const sessao = await findById(sessaoId);
    if (!sessao) {
      return Response.json({ error: "Sessão não encontrada" }, { status: 404 });
    }

    const ownership = await verifyOwnership(sessaoId, payload.userId);
    if (!ownership.isOwner) {
      return Response.json({ error: "Não autorizado" }, { status: 403 });
    }

    if (action === "approve") {
      if (!ownership.isMentor) {
        return Response.json({ error: "Apenas mentores podem aprovar" }, { status: 403 });
      }
      if (sessao.reservation_status !== "pendente") {
        return Response.json({ error: "Sessão não está pendente" }, { status: 400 });
      }
      await approve(sessaoId);
      return Response.json({ message: "Sessão aprovada" });
    }

    if (action === "decline") {
      if (!ownership.isMentor) {
        return Response.json({ error: "Apenas mentores podem recusar" }, { status: 403 });
      }
      if (sessao.reservation_status !== "pendente") {
        return Response.json({ error: "Sessão não está pendente" }, { status: 400 });
      }
      await decline(sessaoId);
      return Response.json({ message: "Sessão recusada" });
    }

    if (action === "cancel") {
      if (sessao.status === "cancelada") {
        return Response.json({ error: "Sessão já cancelada" }, { status: 400 });
      }
      await cancel(sessaoId, payload.userId, motivo_cancelamento);
      return Response.json({ message: "Sessão cancelada" });
    }

    if (action === "update_link") {
      if (!ownership.isMentor) {
        return Response.json({ error: "Apenas mentores podem adicionar link" }, { status: 403 });
      }
      if (!link_reuniao) {
        return Response.json({ error: "Link é obrigatório" }, { status: 400 });
      }
      await updateLink(sessaoId, link_reuniao);
      return Response.json({ message: "Link atualizado" });
    }

    if (action === "start") {
      if (!ownership.isMentor) {
        return Response.json({ error: "Apenas mentores podem iniciar" }, { status: 403 });
      }
      if (sessao.reservation_status !== "aprovada") {
        return Response.json({ error: "Sessão precisa estar aprovada" }, { status: 400 });
      }
      await start(sessaoId);
      return Response.json({ message: "Sessão iniciada" });
    }

    if (action === "complete") {
      if (sessao.status !== "em_andamento") {
        return Response.json({ error: "Sessão precisa estar em andamento" }, { status: 400 });
      }
      await complete(sessaoId);
      return Response.json({ message: "Sessão concluída" });
    }

    return Response.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Session PATCH error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await requireAuth(request);
    const { id } = await params;
    const sessaoId = Number(id);
    const { action } = await request.json();

    if (action === "join") {
      const ownership = await verifyOwnership(sessaoId, payload.userId);
      if (!ownership.isOwner) {
        return Response.json({ error: "Não autorizado" }, { status: 403 });
      }

      const sessao = await findById(sessaoId);
      if (!sessao) {
        return Response.json({ error: "Sessão não encontrada" }, { status: 404 });
      }

      if (sessao.status !== "em_andamento" && sessao.reservation_status !== "aprovada") {
        return Response.json({ error: "Sessão não está disponível para entrada" }, { status: 400 });
      }

      if (ownership.isMentor) {
        if (sessao.joined_mentor_at) {
          return Response.json({ message: "mentor já entrou" });
        }
        await joinAsMentor(sessaoId);
      } else {
        if (sessao.joined_student_at) {
          return Response.json({ message: "Aluno já entrou" });
        }
        await joinAsAluno(sessaoId);
      }

      return Response.json({ message: "Entrada registrada" });
    }

    return Response.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Session POST error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
