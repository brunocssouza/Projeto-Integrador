import { NextRequest } from "next/server";
import { validateBody, withErrorHandler } from "@/lib/validate";
import { checkoutSchema } from "@/lib/schemas/payment";
import { requireUser } from "@/lib/auth-guard";
import { badRequest, conflict, forbidden, notFound } from "@/lib/errors";
import { getPaymentProvider } from "@/lib/payments/mercadopago";
import * as PaymentModel from "@/models/Payment";
import * as SessionModel from "@/models/Session";
import * as MentorModel from "@/models/Mentor";
import * as UserModel from "@/models/User";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const data = await validateBody(checkoutSchema, request);

  // Load the session
  const session = await SessionModel.findByIdWithDetails(data.sessionId);
  if (!session) {
    throw notFound("Sessão não encontrada");
  }

  // Get the aluno record for this user
  const userRow = await UserModel.findByEmail(user.email);
  if (!userRow) {
    throw notFound("Usuário não encontrado");
  }

  const studentId = await UserModel.findStudentByUserId(userRow.id);
  if (!studentId || studentId !== session.student_id) {
    throw forbidden("Apenas o aluno da sessão pode realizar o pagamento");
  }

  // Check session is in bookable state
  if (session.status === "cancelada") {
    throw badRequest("Sessão cancelada não pode ser paga");
  }

  // Check for existing payment
  const existingPayment = await PaymentModel.findBySession(data.sessionId);
  if (
    existingPayment &&
    (existingPayment.status === "approved" || existingPayment.status === "pending")
  ) {
    throw conflict("Já existe um pagamento em andamento ou aprovado para esta sessão");
  }

  // Get the mentor to get the price
  const mentor = await MentorModel.findById(session.mentor_id);
  if (!mentor) {
    throw notFound("Mentor não encontrado");
  }

  const amount = Number(mentor.price_per_session);
  const description = `Mentoria: ${session.titulo}`;

  // Create payment record
  const paymentId = await PaymentModel.create({
    session_id: data.sessionId,
    payer_user_id: userRow.id,
    amount: amount,
    method: data.method,
    provider: "mercadopago",
  });

  const provider = getPaymentProvider();
  const idempotencyKey = randomUUID();

  try {
    if (data.method === "pix") {
      const result = await provider.createPixPayment({
        idempotencyKey,
        amount,
        description,
        payerEmail: user.email,
        payerDoc: userRow.cpf,
      });

      await PaymentModel.updatePixData(paymentId, {
        provider_payment_id: result.providerPaymentId,
        pix_qr_code: result.qrCodeBase64,
        pix_ticket_url: result.ticketUrl,
      });

      logger.info("Pix payment created", {
        paymentId,
        providerPaymentId: result.providerPaymentId,
      });

      return Response.json(
        {
          paymentId,
          status: result.status,
          pix: {
            qrCode: result.qrCode,
            qrCodeBase64: result.qrCodeBase64,
            ticketUrl: result.ticketUrl,
            expiresAt: result.expiresAt,
          },
        },
        { status: 201 }
      );
    } else {
      // Card payment
      if (!data.cardToken) {
        throw badRequest("Token do cartão é obrigatório para pagamento com cartão");
      }

      const result = await provider.createCardPayment({
        idempotencyKey,
        amount,
        description,
        payerEmail: user.email,
        payerDoc: userRow.cpf,
        token: data.cardToken,
        installments: data.installments ?? 1,
      });

      await PaymentModel.updateStatus(
        paymentId,
        result.status,
        result.providerPaymentId,
        result.status === "approved" ? new Date() : undefined
      );

      logger.info("Card payment created", {
        paymentId,
        providerPaymentId: result.providerPaymentId,
        status: result.status,
      });

      return Response.json(
        {
          paymentId,
          status: result.status,
          redirectUrl: result.redirectUrl,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    // Mark payment as rejected on error
    await PaymentModel.updateStatus(paymentId, "rejected");
    logger.error("Payment creation failed", {
      paymentId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw badRequest("Falha ao criar pagamento");
  }
});
