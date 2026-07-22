import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { getAvailability, updateAvailability, findMentorIdByUserId } from "@/models/Mentor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const availability = await getAvailability(id);
    return Response.json({ availability });
  } catch (error) {
    console.error("Disponibilidade GET error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth(request);
    const { id } = await params;

    const ownMentorId = await findMentorIdByUserId(payload.userId);
    if (!ownMentorId || ownMentorId !== id) {
      return Response.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { slots } = body as {
      slots: { dayOfWeek: number; startTime: string; endTime: string; plataformasVideo?: string[] }[];
    };

    await updateAvailability(id, slots);
    return Response.json({ message: "Disponibilidade atualizada com sucesso" });
  } catch (error) {
    console.error("Disponibilidade PUT error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
