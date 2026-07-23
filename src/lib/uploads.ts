import { badRequest } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";
import path from "path";
import fs from "fs/promises";
import { nanoid } from "nanoid";

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB
export const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"] as const;
export const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"] as const;

interface MagicBytes {
  mime: (typeof ALLOWED_MIME)[number];
  bytes: number[];
}

const MAGIC_BYTES: MagicBytes[] = [
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
];

/**
 * Verify file magic bytes, not just the extension.
 */
export function verifyMagicBytes(buffer: Buffer): (typeof ALLOWED_MIME)[number] | null {
  for (const sig of MAGIC_BYTES) {
    if (buffer.length >= sig.bytes.length) {
      const match = sig.bytes.every((byte, i) => buffer[i] === byte);
      if (match) return sig.mime;
    }
  }
  return null;
}

export interface UploadResult {
  url: string;
  filename: string;
  mime: string;
  size: number;
}

/**
 * Save an avatar upload with full validation.
 */
export async function saveAvatar(file: File, userId: string | number): Promise<UploadResult> {
  if (file.size > MAX_AVATAR_BYTES) {
    throw badRequest("Arquivo muito grande. Máximo de 2MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const detectedMime = verifyMagicBytes(buffer);
  if (!detectedMime) {
    throw badRequest("Tipo de arquivo inválido. Use PNG, JPEG ou WebP.");
  }

  const ext = detectedMime.split("/")[1];
  const filename = `${nanoid(16)}.${ext}`;
  const uploadDir = path.join(process.cwd(), env.UPLOAD_DIR, "avatars", String(userId));
  const filePath = path.join(uploadDir, filename);

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(filePath, buffer);

  const url = `/uploads/avatars/${userId}/${filename}`;

  logger.info("Avatar uploaded", { userId, filename, mime: detectedMime, size: file.size });

  return {
    url,
    filename,
    mime: detectedMime,
    size: file.size,
  };
}

/**
 * Delete a previous avatar file when replaced.
 */
export async function deleteAvatarFile(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  try {
    const filePath = path.join(process.cwd(), "public", url);
    await fs.unlink(filePath);
  } catch {
    // File may not exist; ignore
  }
}
