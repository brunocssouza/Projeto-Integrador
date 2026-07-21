import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface TecnologiaRow extends RowDataPacket {
  tecnologia_id: number;
}

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

    const body = await request.json();
    const { cargo, empresa, descricao, experiencia, preco, tecnologias } = body;

    if (!cargo || !descricao || !preco) {
      return Response.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }

    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT tutor_id FROM Tutor WHERE usuario_id = ?",
      [payload.userId]
    );

    if (existing.length > 0) {
      await pool.query<ResultSetHeader>(
        `UPDATE Tutor SET cargo = ?, empresa = ?, descricao = ?,
         experiencia_profissional = ?, preco_por_sessao = ?
         WHERE usuario_id = ?`,
        [cargo, empresa || null, descricao, experiencia || null, preco, payload.userId]
      );
    } else {
      await pool.query<ResultSetHeader>(
        `INSERT INTO Tutor (usuario_id, cargo, empresa, descricao, experiencia_profissional, preco_por_sessao)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [payload.userId, cargo, empresa || null, descricao, experiencia || null, preco]
      );
    }

    const [tutorRows] = await pool.query<RowDataPacket[]>(
      "SELECT tutor_id FROM Tutor WHERE usuario_id = ?",
      [payload.userId]
    );
    const tutorId = tutorRows[0].tutor_id;

    await pool.query<ResultSetHeader>(
      "DELETE FROM Tutor_Tecnologia WHERE tutor_id = ?",
      [tutorId]
    );

    if (tecnologias && tecnologias.length > 0) {
      for (const techName of tecnologias) {
        const [techRows] = await pool.query<TecnologiaRow[]>(
          "SELECT tecnologia_id FROM Tecnologia WHERE nome = ?",
          [techName]
        );

        let techId: number;
        if (techRows.length === 0) {
          const [newTech] = await pool.query<ResultSetHeader>(
            "INSERT INTO Tecnologia (nome) VALUES (?)",
            [techName]
          );
          techId = newTech.insertId;
        } else {
          techId = techRows[0].tecnologia_id;
        }

        await pool.query<ResultSetHeader>(
          "INSERT IGNORE INTO Tutor_Tecnologia (tutor_id, tecnologia_id) VALUES (?, ?)",
          [tutorId, techId]
        );
      }
    }

    await pool.query<ResultSetHeader>(
      "UPDATE Usuario SET perfil_mentor_completo = 1 WHERE usuario_id = ?",
      [payload.userId]
    );

    return Response.json({ message: "Perfil de mentor configurado com sucesso" });
  } catch (error) {
    console.error("Mentor setup error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
