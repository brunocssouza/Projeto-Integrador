import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import pool from "@/infra/database";
import { create as createMentor, findByUserId, syncTechnologies } from "@/models/Mentor";
import { validateBody, withErrorHandler } from "@/lib/validate";
import { mentorProfileSchema } from "@/lib/schemas/auth";
import { AppError, badRequest, conflict, forbidden } from "@/lib/errors";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const payload = await requireAuth(request);
  const data = await validateBody(mentorProfileSchema, request);

  const [userRows] = await pool.query("SELECT is_student, is_mentor FROM `user` WHERE id = ?", [
    payload.userId,
  ]);
  const userRow = (userRows as any[])[0];
  if (!userRow) throw badRequest("Usuário não encontrado");
  if (userRow.is_mentor === 1) {
    throw conflict("Você já é mentor ou já solicitou tornar-se mentor");
  }

  // Only students may opt in.
  if (userRow.is_student !== 1) {
    throw forbidden("Apenas alunos podem solicitar tornar-se mentor");
  }

  const existing = await findByUserId(payload.userId);
  if (existing) {
    throw conflict("Já existe um perfil de mentor para este usuário");
  }

  const mentorId = await createMentor(payload.userId, {
    title: data.title,
    company: data.company || null,
    description: data.description,
    professionalExperience: data.professionalExperience || null,
    pricePerSession: data.pricePerSession,
  });
  await syncTechnologies(mentorId, data.technologies);

  // Flag the user as a (pending) mentor.
  await pool.query("UPDATE `user` SET is_mentor = 1 WHERE id = ?", [payload.userId]);

  return Response.json(
    { message: "Solicitação enviada! Seu perfil será analisado (até 3 dias úteis).", mentorId },
    { status: 201 }
  );
});

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const mentor = await findByUserId(payload.userId);
    if (!mentor) {
      return Response.json({ status: null });
    }
    const [rows] = await pool.query(
      "SELECT approval_status, rejection_reason FROM mentor WHERE id = ?",
      [mentor.id]
    );
    const m = (rows as any[])[0];
    return Response.json({
      status: m?.approval_status ?? null,
      rejection_reason: m?.rejection_reason ?? null,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json({ error: error.message }, { status: error.httpStatus });
    }
    console.error("Mentor apply status error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
