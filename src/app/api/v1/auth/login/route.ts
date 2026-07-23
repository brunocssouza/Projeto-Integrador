import { NextRequest } from "next/server";
import { comparePassword, signToken } from "@/infra/auth";
import { findByEmail } from "@/models/User";
import { validateBody, withErrorHandler } from "@/lib/validate";
import { loginSchema } from "@/lib/schemas/auth";
import { unauthorized } from "@/lib/errors";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const data = await validateBody(loginSchema, request);

  const user = await findByEmail(data.email);
  if (!user) {
    throw unauthorized("E-mail ou senha incorretos");
  }

  const valid = await comparePassword(data.password, user.password_hash);
  if (!valid) {
    throw unauthorized("E-mail ou senha incorretos");
  }

  const token = await signToken({ userId: user.id, email: user.email });
  const response = Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar_url: user.avatar_url,
      is_aluno: user.is_student === 1,
      is_mentor: user.is_mentor === 1,
      perfil_mentor_completo: user.is_mentor_profile_complete === 1,
      is_admin: user.is_admin === 1,
    },
  });
  response.headers.set(
    "Set-Cookie",
    `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
  );
  return response;
});
