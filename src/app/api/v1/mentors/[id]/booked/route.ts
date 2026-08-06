import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { getBookedSlots } from "@/models/Session";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const mentorId = Number(id);

    const booked = await getBookedSlots(mentorId);
    return Response.json({ booked });
  } catch (error) {
    console.error("Booked slots GET error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
