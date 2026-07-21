import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Token inválido" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return Response.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: "Formato inválido. Use JPG, PNG ou WebP." }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return Response.json({ error: "Arquivo muito grande. Máximo 5MB." }, { status: 400 });
    }

    const ext = file.type.split("/")[1];
    const filename = `avatar_${payload.userId}_${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");

    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const avatarUrl = `/uploads/avatars/${filename}`;

    await pool.query("UPDATE Usuario SET foto_perfil = ? WHERE usuario_id = ?", [
      avatarUrl,
      payload.userId,
    ]);

    return Response.json({ avatarUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
