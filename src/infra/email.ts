import { Resend } from "resend";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) {
    logger.warn("Resend API key not set — email sending disabled");
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL = "Mock Mentor <no-reply@mockmentor.com.br>";

export interface EmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail(params: EmailParams): Promise<string | null> {
  const client = getClient();
  if (!client) {
    logger.info("Email skipped (no API key)", { to: params.to, subject: params.subject });
    return null;
  }

  try {
    const result = await client.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    } as any);

    if (result.error) {
      logger.error("Email send failed", { to: params.to, error: result.error.message });
      return null;
    }

    logger.info("Email sent", { to: params.to, subject: params.subject, id: result.data?.id });
    return result.data?.id ?? null;
  } catch (error) {
    logger.error("Email send error", {
      to: params.to,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export const emailTemplates = {
  emailVerification: (token: string, baseUrl: string) => ({
    subject: "Verifique seu email - Mock Mentor",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Verifique seu email</h1>
        <p>Obrigado por se cadastrar no Mock Mentor!</p>
        <p>Clique no link abaixo para verificar seu email:</p>
        <a href="${baseUrl}/verificar-email?token=${token}"
           style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Verificar Email
        </a>
        <p style="color: #6b7280; font-size: 14px;">Se você não se cadastrou, ignore este email.</p>
      </div>
    `,
    text: `Verifique seu email: ${baseUrl}/verificar-email?token=${token}`,
  }),

  passwordReset: (token: string, baseUrl: string) => ({
    subject: "Redefinição de senha - Mock Mentor",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Redefinição de senha</h1>
        <p>Você solicitou a redefinição de sua senha.</p>
        <a href="${baseUrl}/recuperar-senha?token=${token}"
           style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Redefinir Senha
        </a>
        <p style="color: #6b7280; font-size: 14px;">Se você não solicitou isso, ignore este email. O link expira em 1 hora.</p>
      </div>
    `,
    text: `Redefina sua senha: ${baseUrl}/recuperar-senha?token=${token}`,
  }),

  bookingConfirmed: (mentorName: string, sessionTitle: string, dateTime: string) => ({
    subject: "Sessão confirmada - Mock Mentor",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Sessão confirmada!</h1>
        <p>Sua sessão com <strong>${mentorName}</strong> foi confirmada.</p>
        <p><strong>Título:</strong> ${sessionTitle}</p>
        <p><strong>Data/Hora:</strong> ${dateTime}</p>
      </div>
    `,
    text: `Sessão confirmada com ${mentorName}: ${sessionTitle} em ${dateTime}`,
  }),

  paymentApproved: (amount: number, sessionTitle: string) => ({
    subject: "Pagamento aprovado - Mock Mentor",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Pagamento aprovado!</h1>
        <p>Seu pagamento de <strong>R$ ${amount.toFixed(2)}</strong> foi aprovado.</p>
        <p><strong>Sessão:</strong> ${sessionTitle}</p>
      </div>
    `,
    text: `Pagamento de R$ ${amount.toFixed(2)} aprovado para: ${sessionTitle}`,
  }),

  newMessage: (senderName: string, preview: string) => ({
    subject: `Nova mensagem de ${senderName} - Mock Mentor`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Nova mensagem</h1>
        <p><strong>${senderName}</strong> enviou uma mensagem:</p>
        <p style="background: #f3f4f6; padding: 12px; border-radius: 8px;">${preview}</p>
        <a href="${env.APP_URL}/mensagens"
           style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Ver mensagens
        </a>
      </div>
    `,
    text: `${senderName}: ${preview}`,
  }),
};

export default sendEmail;
