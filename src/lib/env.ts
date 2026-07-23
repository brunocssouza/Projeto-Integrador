import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_HOST: z.string().optional().default("localhost"),
  DATABASE_PORT: z.coerce.number().optional().default(3306),
  DATABASE_USER: z.string().optional().default("root"),
  DATABASE_PASSWORD: z.string().optional().default(""),
  DATABASE_NAME: z.string().optional().default("mock_mentor"),

  // Auth
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  BETTER_AUTH_SECRET: z.string().optional(),

  // App
  APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),

  // Mercado Pago
  MP_ACCESS_TOKEN: z.string().optional(),
  MP_WEBHOOK_SECRET: z.string().optional(),

  // Uploads
  UPLOAD_DIR: z.string().optional().default("public/uploads"),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const missing = Object.entries(errors)
      .map(([key, msgs]) => `${key}: ${(msgs ?? []).join(", ")}`)
      .join("\n  ");
    const message = `Environment validation failed:\n  ${missing}`;
    console.error(message);
    throw new Error(message);
  }
  return result.data;
}

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = loadEnv();
  }
  return cachedEnv;
}

export const env = getEnv();

export default env;
