import { NextRequest } from "next/server";
import { requireAuth, AuthError } from "@/infra/auth";
import { list } from "@/models/Mentor";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const mentors = await list();
    return Response.json({ mentors });
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Mentors list error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
