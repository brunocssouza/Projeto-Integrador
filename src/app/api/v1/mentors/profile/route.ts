import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { findByUserId, update } from "@/models/Mentor";

export async function PATCH(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const mentor = await findByUserId(payload.userId);

    if (!mentor) {
      return Response.json({ error: "Não é Mentor" }, { status: 403 });
    }

    const body = await request.json();
    const data: Record<string, string | number | null> = {};

    if (body.descricao !== undefined) data.descricao = body.descricao;
    if (body.experiencia !== undefined) data.experiencia = body.experiencia;
    if (body.cargo !== undefined) data.cargo = body.cargo;
    if (body.empresa !== undefined) data.empresa = body.empresa;
    if (body.precoPorSessao !== undefined) data.precoPorSessao = body.precoPorSessao;
    if (body.videoApresentacao !== undefined) data.videoApresentacao = body.videoApresentacao;

    if (Object.keys(data).length === 0) {
      return Response.json({ error: "Nenhum dado para atualizar" }, { status: 400 });
    }

    await update(mentor.mentor_id, data);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Update mentor profile error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
