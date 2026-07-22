import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { requireAdmin, listAllUsers } from "@/models/Admin";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    await requireAdmin(payload.userId);

    const users = await listAllUsers();
    return Response.json({ users });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: error.status || 500 }
    );
  }
}
