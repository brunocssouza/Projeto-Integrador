import { NextRequest } from "next/server";
import pool from "@/infra/database";
import { hashPassword } from "@/infra/auth";
import { findByEmail, create } from "@/models/User";
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
    throw conflict("Este email já está cadastrado");
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

  logger.info("User registered", { userId, email: data.email });

  return Response.json({ message: "Conta criada com sucesso", userId }, { status: 201 });
});
