import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { findStudentByUserId } from "@/models/User";
import { getByStudentId } from "@/models/Transaction";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const studentId = await findStudentByUserId(payload.userId);

    if (!studentId) {
      return Response.json({ transactions: [], total: 0 });
    }

    const data = await getByStudentId(studentId);
    return Response.json({ transactions: data.transactions, total: data.total });
  } catch (error) {
    console.error("Transactions error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
