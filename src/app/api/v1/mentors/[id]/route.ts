import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { getProfile } from "@/models/Mentor";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const mentorId = Number(id);

    const mentor = await getProfile(mentorId);
    if (!mentor) {
      return Response.json({ error: "Mentor não encontrado" }, { status: 404 });
    }

    return Response.json({ mentor });
  } catch (error) {
    console.error("Mentor profile error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
