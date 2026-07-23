import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { findByMentorId } from "@/models/Review";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const mentorId = Number(id);

    const reviews = await findByMentorId(mentorId);
    return Response.json({ reviews });
  } catch (error) {
    console.error("Avaliacoes error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
