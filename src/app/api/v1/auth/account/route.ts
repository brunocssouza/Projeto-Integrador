import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { deleteAccount } from "@/models/User";

export async function DELETE(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    await deleteAccount(payload.userId);

    const response = Response.json({ success: true });
    response.headers.append("Set-Cookie", "token=; Path=/; HttpOnly; Max-Age=0");
    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
