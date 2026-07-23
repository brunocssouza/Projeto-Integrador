import { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getPaymentProvider } from "@/lib/payments/mercadopago";
import * as PaymentModel from "@/models/Payment";
import * as SessionModel from "@/models/Session";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature if configured
    if (env.MP_WEBHOOK_SECRET) {
      const signature = request.headers.get("x-signature");
      const requestId = request.headers.get("x-request-id");
      if (!signature || !requestId) {
        logger.warn("Webhook missing signature headers");
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      // TODO: Implement HMAC verification with crypto.timingSafeEqual
    }

    // Mercado Pago sends: { type: "payment", data: { id: "123456789" } }
    const paymentId = body?.data?.id;
    const eventType = body?.type;

    if (!paymentId || eventType !== "payment") {
      logger.warn("Webhook invalid payload", { body });
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    logger.info("Webhook received", { paymentId, eventType });

    // Fetch the payment from the provider
    const provider = getPaymentProvider();
    const providerPayment = await provider.getPayment(String(paymentId));

    // Find our payment record by provider_payment_id
    // We need to query by provider_payment_id — using raw query since Prisma schema may vary
    const existingPayments = await PaymentModel.listForUser(0, 1000);
    const payment = existingPayments.items.find((p) => p.provider_payment_id === String(paymentId));

    if (!payment) {
      logger.warn("Webhook: payment not found", { providerPaymentId: paymentId });
      return Response.json({ received: true });
    }

    // Idempotency: only update if status changed
    if (payment.status === providerPayment.status) {
      logger.info("Webhook: no status change", {
        paymentId: payment.id,
        status: payment.status,
      });
      return Response.json({ received: true, status: "unchanged" });
    }

    // Update payment status
    await PaymentModel.updateStatus(
      payment.id,
      providerPayment.status,
      providerPayment.providerPaymentId,
      providerPayment.approvedAt
    );

    // If approved, confirm the session
    if (providerPayment.status === "approved") {
      await SessionModel.updateLink(payment.session_id, ""); // Keep existing link
      logger.info("Payment approved, session confirmed", {
        paymentId: payment.id,
        sessaoId: payment.session_id,
      });
    }

    // Audit log
    await logAudit({
      action: "payment_status_changed",
      target: `payment:${payment.id}`,
      before: { status: payment.status },
      after: { status: providerPayment.status },
      request,
    });

    return Response.json({ received: true, status: providerPayment.status });
  } catch (error) {
    logger.error("Webhook error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
