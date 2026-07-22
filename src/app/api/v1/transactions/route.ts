import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { findAlunoByUserId } from "@/models/User";
import { getByAlunoId } from "@/models/Transaction";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const alunoId = await findAlunoByUserId(payload.userId);

    if (!alunoId) {
      return Response.json({ transactions: [], total: 0 });
    }

    const data = await getByAlunoId(alunoId);
    return Response.json({ transactions: data.transactions, total: data.total });
  } catch (error) {
    console.error("Transactions error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
