import { createAuthClient } from "better-auth/react";
import { env } from "@/lib/env";

export const authClient = createAuthClient({
  baseURL: env.APP_URL,
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  resetPassword,
  changePassword,
  changeEmail,
  verifyEmail,
  sendVerificationEmail,
} = authClient;

export default authClient;
