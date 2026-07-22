import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { requireAdmin, deleteUser } from "@/models/Admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth(request);
    await requireAdmin(payload.userId);

    const { id } = await params;

    if (id === payload.userId) {
      return Response.json(
        { error: "Você não pode excluir a si mesmo" },
        { status: 400 }
      );
    }

    await deleteUser(id);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: error.status || 500 }
    );
  }
}
