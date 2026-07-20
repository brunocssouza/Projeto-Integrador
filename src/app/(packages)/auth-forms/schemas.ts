import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.string().min(3, "E-mail deve ter pelo menos 3 caracteres").email("E-mail inválido"),
  password: z.string()
    .min(4, "Senha deve ter pelo menos 4 caracteres")
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;
