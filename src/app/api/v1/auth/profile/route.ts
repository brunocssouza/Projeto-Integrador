import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { updateProfile } from "@/models/User";

export async function PATCH(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const body = await request.json();
    const updates: { nome?: string; email?: string } = {};

    if (typeof body.nome === "string") updates.nome = body.nome;
    if (typeof body.email === "string") updates.email = body.email;

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "Nenhum dado para atualizar" }, { status: 400 });
    }

    await updateProfile(payload.userId, updates);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Update profile error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
