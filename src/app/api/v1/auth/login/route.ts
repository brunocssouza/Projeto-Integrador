import { NextRequest } from "next/server";
import { comparePassword, signToken } from "@/infra/auth";
import { findByEmail } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Preencha todos os campos" }, { status: 400 });
    }

    const user = await findByEmail(email);
    if (!user) {
      return Response.json({ error: "E-mail ou senha incorretos" }, { status: 401 });
    }

    const valid = await comparePassword(password, user.senha_hash);
    if (!valid) {
      return Response.json({ error: "E-mail ou senha incorretos" }, { status: 401 });
    }

    const token = await signToken({ userId: user.usuario_id, email: user.email });
    const response = Response.json({
      user: {
        id: user.usuario_id,
        name: user.nome,
        email: user.email,
        phone: user.telefone,
        avatar_url: user.avatar_url,
        is_aluno: user.is_aluno === 1,
        is_mentor: user.is_mentor === 1,
        perfil_mentor_completo: user.perfil_mentor_completo === 1,
      },
    });
    response.headers.set("Set-Cookie", `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
