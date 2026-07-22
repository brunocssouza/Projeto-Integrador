import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";

async function verifySessionOwnership(
  sessaoId: number,
  userId: number
): Promise<{ isOwner: boolean; isMentor: boolean; isAluno: boolean }> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       CASE WHEN t.usuario_id = ? THEN 1 ELSE 0 END AS is_mentor_owner,
       CASE WHEN a.usuario_id = ? THEN 1 ELSE 0 END AS is_aluno_owner
     FROM Sessao s
     LEFT JOIN Mentor t ON t.mentor_id = s.mentor_id
     LEFT JOIN Aluno a ON a.aluno_id = s.aluno_id
     WHERE s.sessao_id = ?`,
    [userId, userId, sessaoId]
  );
  if (rows.length === 0) return { isOwner: false, isMentor: false, isAluno: false };
  return {
    isOwner: rows[0].is_mentor_owner === 1 || rows[0].is_aluno_owner === 1,
    isMentor: rows[0].is_mentor_owner === 1,
    isAluno: rows[0].is_aluno_owner === 1,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Token inválido" }, { status: 401 });
    }

    const { id } = await params;
    const sessaoId = Number(id);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT s.*,
              ua.nome AS aluno_nome, ua.email AS aluno_email,
              ut.nome AS mentor_nome, ut.email AS mentor_email,
              t.cargo AS mentor_cargo, t.empresa AS mentor_empresa
       FROM Sessao s
       JOIN Aluno a ON a.aluno_id = s.aluno_id
       JOIN Usuario ua ON ua.usuario_id = a.usuario_id
       JOIN Mentor t ON t.mentor_id = s.mentor_id
       JOIN Usuario ut ON ut.usuario_id = t.usuario_id
       WHERE s.sessao_id = ?`,
      [sessaoId]
    );

    if (rows.length === 0) {
      return Response.json({ error: "Sessão não encontrada" }, { status: 404 });
    }

    return Response.json({ session: rows[0] });
  } catch (error) {
    console.error("Session GET error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Token inválido" }, { status: 401 });
    }

    const { id } = await params;
    const sessaoId = Number(id);
    const body = await request.json();
    const { action, link_reuniao, motivo_cancelamento } = body as {
      action: string;
      link_reuniao?: string;
      motivo_cancelamento?: string;
    };

    const [sessaoRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM Sessao WHERE sessao_id = ?",
      [sessaoId]
    );

    if (sessaoRows.length === 0) {
      return Response.json({ error: "Sessão não encontrada" }, { status: 404 });
    }

    const sessao = sessaoRows[0];

    const ownership = await verifySessionOwnership(sessaoId, payload.userId);

    if (!ownership.isOwner) {
      return Response.json({ error: "Não autorizado" }, { status: 403 });
    }

    if (action === "approve") {
      if (!ownership.isMentor) {
        return Response.json({ error: "Apenas mentores podem aprovar" }, { status: 403 });
      }
      if (sessao.status_reserva !== "pendente") {
        return Response.json({ error: "Sessão não está pendente" }, { status: 400 });
      }
      await pool.query<ResultSetHeader>(
        "UPDATE Sessao SET status_reserva = 'aprovada' WHERE sessao_id = ?",
        [sessaoId]
      );
      return Response.json({ message: "Sessão aprovada" });
    }

    if (action === "decline") {
      if (!ownership.isMentor) {
        return Response.json({ error: "Apenas mentores podem recusar" }, { status: 403 });
      }
      if (sessao.status_reserva !== "pendente") {
        return Response.json({ error: "Sessão não está pendente" }, { status: 400 });
      }
      await pool.query<ResultSetHeader>(
        "UPDATE Sessao SET status_reserva = 'recusada' WHERE sessao_id = ?",
        [sessaoId]
      );
      return Response.json({ message: "Sessão recusada" });
    }

    if (action === "cancel") {
      if (!ownership.isOwner) {
        return Response.json({ error: "Não autorizado" }, { status: 403 });
      }
      if (sessao.status === "cancelada") {
        return Response.json({ error: "Sessão já cancelada" }, { status: 400 });
      }
      await pool.query<ResultSetHeader>(
        `UPDATE Sessao SET status = 'cancelada', cancelado_por = ?, motivo_cancelamento = ?
         WHERE sessao_id = ?`,
        [payload.userId, motivo_cancelamento || null, sessaoId]
      );
      return Response.json({ message: "Sessão cancelada" });
    }

    if (action === "update_link") {
      if (!ownership.isMentor) {
        return Response.json({ error: "Apenas mentores podem adicionar link" }, { status: 403 });
      }
      if (!link_reuniao) {
        return Response.json({ error: "Link é obrigatório" }, { status: 400 });
      }
      await pool.query<ResultSetHeader>(
        "UPDATE Sessao SET link_reuniao = ? WHERE sessao_id = ?",
        [link_reuniao, sessaoId]
      );
      return Response.json({ message: "Link atualizado" });
    }

    if (action === "start") {
      if (!ownership.isMentor) {
        return Response.json({ error: "Apenas mentores podem iniciar" }, { status: 403 });
      }
      if (sessao.status_reserva !== "aprovada") {
        return Response.json({ error: "Sessão precisa estar aprovada" }, { status: 400 });
      }
      await pool.query<ResultSetHeader>(
        "UPDATE Sessao SET status = 'em_andamento' WHERE sessao_id = ?",
        [sessaoId]
      );
      return Response.json({ message: "Sessão iniciada" });
    }

    if (action === "complete") {
      if (sessao.status !== "em_andamento") {
        return Response.json({ error: "Sessão precisa estar em andamento" }, { status: 400 });
      }
      await pool.query<ResultSetHeader>(
        "UPDATE Sessao SET status = 'concluida' WHERE sessao_id = ?",
        [sessaoId]
      );
      return Response.json({ message: "Sessão concluída" });
    }

    return Response.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Session PATCH error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Token inválido" }, { status: 401 });
    }

    const { id } = await params;
    const sessaoId = Number(id);
    const body = await request.json();
    const { action } = body as { action: string };

    const [userRows] = await pool.query<RowDataPacket[]>(
      "SELECT is_aluno, is_mentor FROM Usuario WHERE usuario_id = ?",
      [payload.userId]
    );

    const isMentor = userRows[0]?.is_mentor === 1;
    const isAluno = userRows[0]?.is_aluno === 1;

    if (action === "join") {
      const ownership = await verifySessionOwnership(sessaoId, payload.userId);
      if (!ownership.isOwner) {
        return Response.json({ error: "Não autorizado" }, { status: 403 });
      }

      const [sessaoRows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM Sessao WHERE sessao_id = ?",
        [sessaoId]
      );

      if (sessaoRows.length === 0) {
        return Response.json({ error: "Sessão não encontrada" }, { status: 404 });
      }

      const sessao = sessaoRows[0];

      if (sessao.status !== "em_andamento" && sessao.status_reserva !== "aprovada") {
        return Response.json(
          { error: "Sessão não está disponível para entrada" },
          { status: 400 }
        );
      }

      if (isMentor) {
        if (sessao.joined_mentor_at) {
          return Response.json({ message: "mentor já entrou" });
        }
        await pool.query<ResultSetHeader>(
          "UPDATE Sessao SET joined_mentor_at = NOW() WHERE sessao_id = ? AND joined_mentor_at IS NULL",
          [sessaoId]
        );
      } else if (isAluno) {
        if (sessao.joined_aluno_at) {
          return Response.json({ message: "Aluno já entrou" });
        }
        await pool.query<ResultSetHeader>(
          "UPDATE Sessao SET joined_aluno_at = NOW() WHERE sessao_id = ? AND joined_aluno_at IS NULL",
          [sessaoId]
        );
      }

      return Response.json({ message: "Entrada registrada" });
    }

    return Response.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Session POST error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
