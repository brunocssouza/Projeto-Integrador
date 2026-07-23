import { registerSchema, loginSchema, passwordChangeSchema } from "@/lib/schemas/auth";

describe("registerSchema", () => {
  const validInput = {
    name: "João Silva",
    email: "joao@example.com",
    cpf: "123.456.789-09",
    phone: "(11) 98765-4321",
    password: "password123",
    confirmPassword: "password123",
    isStudent: true,
    isMentor: false,
  };

  it("accepts valid input", () => {
    const result = registerSchema.parse(validInput);
    expect(result.name).toBe("João Silva");
    expect(result.cpf).toBe("12345678909"); // transformed to digits only
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...validInput, confirmPassword: "different" });
    expect(result.success).toBe(false);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({ ...validInput, name: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({ ...validInput, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.parse({ email: "test@example.com", password: "password" });
    expect(result.email).toBe("test@example.com");
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "bad", password: "password" });
    expect(result.success).toBe(false);
  });
});

describe("passwordChangeSchema", () => {
  const validInput = {
    currentPassword: "oldpassword",
    newPassword: "newpassword123",
    confirmPassword: "newpassword123",
  };

  it("accepts valid input", () => {
    const result = passwordChangeSchema.parse(validInput);
    expect(result.newPassword).toBe("newpassword123");
  });

  it("rejects mismatched new passwords", () => {
    const result = passwordChangeSchema.safeParse({
      ...validInput,
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short new password", () => {
    const result = passwordChangeSchema.safeParse({
      ...validInput,
      newPassword: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });
});
