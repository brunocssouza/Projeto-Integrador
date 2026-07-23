import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import {
  findByUserId,
  create,
  update as updateMentor,
  syncTechnologies,
  setProfileComplete,
} from "@/models/Mentor";

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const { cargo, empresa, descricao, experiencia, preco, tecnologias } = await request.json();

    if (!cargo || !descricao || !preco) {
      return Response.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 });
    }

    let existing = await findByUserId(payload.userId);

    if (existing) {
      await updateMentor(existing.id, {
        cargo: cargo,
        empresa: empresa || null,
        descricao: descricao,
        experiencia: experiencia || null,
        precoPorSessao: preco,
      });
    } else {
      const mentorId = await create(payload.userId, {
        title: cargo,
        company: empresa || null,
        description: descricao,
        professionalExperience: experiencia || null,
        pricePerSession: preco,
      });
      existing = await findByUserId(payload.userId);
    }

    if (existing) {
      await syncTechnologies(existing.id, tecnologias || []);
    }

    await setProfileComplete(payload.userId);

    return Response.json({ message: "Perfil de mentor configurado com sucesso" });
  } catch (error) {
    console.error("Mentor setup error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
