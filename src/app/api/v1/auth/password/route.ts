import { NextRequest } from "next/server";
import { requireAuth, hashPassword } from "@/infra/auth";
import { findById, changePassword } from "@/models/User";
import { compare } from "bcryptjs";

export async function PATCH(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const { senhaAtual, novaSenha } = await request.json();

    if (!senhaAtual || !novaSenha) {
      return Response.json({ error: "Senha atual e nova senha são obrigatórias" }, { status: 400 });
    }

    if (novaSenha.length < 6) {
      return Response.json({ error: "Nova senha deve ter no mínimo 6 caracteres" }, { status: 400 });
    }

    const user = await findById(payload.userId);
    if (!user) {
      return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const valid = await compare(senhaAtual, user.senha_hash);
    if (!valid) {
      return Response.json({ error: "Senha atual incorreta" }, { status: 400 });
    }

    const novaHash = await hashPassword(novaSenha);
    await changePassword(payload.userId, novaHash);

    return Response.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Password change error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
