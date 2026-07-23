import { NextRequest } from "next/server";
import { requireAuth, hashPassword } from "@/infra/auth";
import { findById, changePassword } from "@/models/User";
import { compare } from "bcryptjs";

export async function PATCH(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return Response.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const user = await findById(payload.userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await compare(currentPassword, user.password_hash);
    if (!valid) {
      return Response.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const novaHash = await hashPassword(newPassword);
    await changePassword(payload.userId, novaHash);

    return Response.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Password change error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
