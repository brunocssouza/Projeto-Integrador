import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { list } from "@/models/Mentor";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const mentors = await list();
    return Response.json({ mentors });
  } catch (error) {
    console.error("Mentors list error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
