import MercadoPagoConfig from "mercadopago";
import { Payment as MPPayment } from "mercadopago/dist/clients/payment";
import { PaymentRefund as MPRefund } from "mercadopago/dist/clients/paymentRefund";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import type {
  PaymentProvider,
  CreatePixPaymentParams,
  CreateCardPaymentParams,
  PixPaymentResult,
  CardPaymentResult,
  ProviderPaymentInfo,
  RefundResult,
  PaymentStatus,
} from "./types";

function mapStatus(mpStatus: string): PaymentStatus {
  switch (mpStatus) {
    case "approved":
      return "approved";
    case "rejected":
    case "cancelled":
      return "rejected";
    case "refunded":
    case "charged_back":
      return "refunded";
    default:
      return "pending";
  }
}

export class MercadoPagoProvider implements PaymentProvider {
  private client: MercadoPagoConfig;

  constructor() {
    const accessToken = env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      logger.warn("Mercado Pago access token not set — payments will fail in production");
    }
    this.client = new MercadoPagoConfig({
      accessToken: accessToken ?? "TEST-PLACEHOLDER",
      options: { timeout: 5000 },
    });
  }

  async createPixPayment(params: CreatePixPaymentParams): Promise<PixPaymentResult> {
    const payment = new MPPayment(this.client);
    const result = await payment.create({
      body: {
        transaction_amount: params.amount,
        description: params.description,
        payment_method_id: "pix",
        payer: {
          email: params.payerEmail,
          identification: {
            type: "CPF",
            number: params.payerDoc,
          },
        },
        idempotency_key: params.idempotencyKey,
      } as never,
    });

    const transactionDetails = result.transaction_details as Record<string, unknown> | undefined;
    const pointOfInteraction = result.point_of_interaction as Record<string, unknown> | undefined;
    const transactionData = pointOfInteraction?.transaction_data as
      Record<string, unknown> | undefined;

    return {
      providerPaymentId: String(result.id),
      status: mapStatus(result.status ?? "pending"),
      qrCode: (transactionData?.qr_code as string) ?? "",
      qrCodeBase64: (transactionData?.qr_code_base64 as string) ?? "",
      ticketUrl: (transactionData?.ticket_url as string) ?? "",
      expiresAt: transactionDetails?.expiration_date
        ? new Date(transactionDetails.expiration_date as string)
        : undefined,
    };
  }

  async createCardPayment(params: CreateCardPaymentParams): Promise<CardPaymentResult> {
    const payment = new MPPayment(this.client);
    const result = await payment.create({
      body: {
        transaction_amount: params.amount,
        description: params.description,
        payment_method_id: "credit_card",
        token: params.token,
        installments: params.installments,
        issuer_id: params.issuerId ? Number(params.issuerId) : undefined,
        payer: {
          email: params.payerEmail,
          identification: {
            type: "CPF",
            number: params.payerDoc,
          },
        },
        capture: true,
        idempotency_key: params.idempotencyKey,
      } as never,
    });

    return {
      providerPaymentId: String(result.id),
      status: mapStatus(result.status ?? "pending"),
      cardBrand: (result.payment_method_id as string) ?? undefined,
      cardLast4: String(result.card?.last_four_digits ?? ""),
    };
  }

  async getPayment(providerPaymentId: string): Promise<ProviderPaymentInfo> {
    const payment = new MPPayment(this.client);
    const result = await payment.get({ id: providerPaymentId });

    return {
      providerPaymentId: String(result.id),
      status: mapStatus(result.status ?? "pending"),
      approvedAt: result.date_approved ? new Date(result.date_approved) : undefined,
    };
  }

  async createRefund(providerPaymentId: string, amount: number): Promise<RefundResult> {
    const refund = new MPRefund(this.client);
    const result = await refund.create({
      payment_id: providerPaymentId,
      body: { amount },
    });

    return {
      providerRefundId: String(result.id),
      status: result.status === "approved" ? "approved" : "pending",
    };
  }
}

let providerInstance: MercadoPagoProvider | null = null;

export function getPaymentProvider(): MercadoPagoProvider {
  if (!providerInstance) {
    providerInstance = new MercadoPagoProvider();
  }
  return providerInstance;
}

export default getPaymentProvider;
