import { NextRequest } from "next/server";
import pool from "@/infra/database";
import { hashPassword } from "@/infra/auth";
import { findByEmail, create } from "@/models/User";
import { create as createMentor, syncTechnologies } from "@/models/Mentor";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { validateBody, withErrorHandler } from "@/lib/validate";
import { registerSchema } from "@/lib/schemas/auth";
import { AppError, conflict } from "@/lib/errors";
import { logger } from "@/lib/logger";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const data = await validateBody(registerSchema, request);

  const existing = await findByEmail(data.email);
  if (existing) {
    throw conflict("Este email já está cadastrado");
  }

  const [existingCpf] = await pool.query<RowDataPacket[]>(`SELECT id FROM \`user\` WHERE cpf = ?`, [
    data.cpf,
  ]);
  if (existingCpf.length > 0) {
    throw conflict("Este CPF já está cadastrado");
  }

  const hashedPassword = await hashPassword(data.password);
  const isStudent = data.isStudent ? 1 : 0;
  const isMentor = data.isMentor ? 1 : 0;

  const userId = await create({
    cpf: data.cpf,
    name: data.name,
    email: data.email,
    phone: data.phone,
    password_hash: hashedPassword,
    is_student: isStudent,
    is_mentor: isMentor,
    email_verified: 0,
  });

  if (isStudent) {
    await pool.query("INSERT INTO student (user_id) VALUES (?)", [userId]);
  }

  // Mentor applicants: create a pending mentor row with their profile so admins can review.
  if (isMentor && data.mentorProfile) {
    const mp = data.mentorProfile;
    const mentorId = await createMentor(userId, {
      title: mp.title,
      company: mp.company || null,
      description: mp.description,
      professionalExperience: mp.professionalExperience || null,
      pricePerSession: mp.pricePerSession,
    });
    await syncTechnologies(mentorId, mp.technologies || []);
  }

  logger.info("User registered", { userId, email: data.email, isMentor });

  return Response.json(
    {
      message:
        isMentor && !isStudent
          ? "Conta criada! Seu cadastro de mentor está em análise (até 3 dias úteis)."
          : "Conta criada com sucesso",
      userId,
    },
    { status: 201 }
  );
});
