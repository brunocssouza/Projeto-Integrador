import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { hash, compare } from "bcryptjs";
import { NextRequest } from "next/server";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET environment variable is required");
}
const JWT_SECRET = new TextEncoder().encode(secret);

const BCRYPT_ROUNDS = 12;

export interface JwtPayload extends JWTPayload {
  userId: number;
  email: string;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload, userId: String(payload.userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { userId: Number(payload.userId), email: payload.email as string };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export async function requireAuth(request: NextRequest): Promise<JwtPayload> {
  const token = request.cookies.get("token")?.value;
  if (!token) throw new AuthError("Não autenticado", 401);

  const payload = await verifyToken(token);
  if (!payload) throw new AuthError("Token inválido", 401);

  return payload;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
