export type PaymentMethod = "pix" | "cartao_credito";

export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded";

export type Provider = "mercadopago";

export interface CreatePixPaymentParams {
  idempotencyKey: string;
  amount: number;
  description: string;
  payerEmail: string;
  payerDoc: string;
}

export interface CreateCardPaymentParams {
  idempotencyKey: string;
  amount: number;
  description: string;
  payerEmail: string;
  payerDoc: string;
  token: string;
  installments: number;
  issuerId?: string;
}

export interface PixPaymentResult {
  providerPaymentId: string;
  status: PaymentStatus;
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl: string;
  expiresAt?: Date;
}

export interface CardPaymentResult {
  providerPaymentId: string;
  status: PaymentStatus;
  redirectUrl?: string;
  cardBrand?: string;
  cardLast4?: string;
}

export interface ProviderPaymentInfo {
  providerPaymentId: string;
  status: PaymentStatus;
  approvedAt?: Date;
}

export interface RefundResult {
  providerRefundId: string;
  status: "pending" | "approved" | "rejected";
}

export interface PaymentProvider {
  createPixPayment(params: CreatePixPaymentParams): Promise<PixPaymentResult>;
  createCardPayment(params: CreateCardPaymentParams): Promise<CardPaymentResult>;
  getPayment(providerPaymentId: string): Promise<ProviderPaymentInfo>;
  createRefund(providerPaymentId: string, amount: number): Promise<RefundResult>;
}
