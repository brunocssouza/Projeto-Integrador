import {
  validateEmail,
  validatePhone,
  validateName,
  formatPhone,
  validateCpf,
  formatCpf,
  validatePassword,
} from "@/lib/validation";

describe("validateEmail", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("test.name+tag@domain.co")).toBe(true);
    expect(validateEmail("a@b.cc")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("notanemail")).toBe(false);
    expect(validateEmail("@domain.com")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
    expect(validateEmail("user@.com")).toBe(false);
    expect(validateEmail("user @domain.com")).toBe(false);
  });
});

describe("validatePhone", () => {
  it("accepts valid 10-digit phones (landline)", () => {
    expect(validatePhone("(11) 3333-4444")).toBe(true);
    expect(validatePhone("1133334444")).toBe(true);
  });

  it("accepts valid 11-digit phones (mobile)", () => {
    expect(validatePhone("(11) 99999-4444")).toBe(true);
    expect(validatePhone("11999994444")).toBe(true);
  });

  it("rejects invalid phones", () => {
    expect(validatePhone("")).toBe(false);
    expect(validatePhone("123")).toBe(false);
    expect(validatePhone("119999944444")).toBe(false); // 12 digits
    expect(validatePhone("(11) 89999-4444")).toBe(false); // mobile must start with 9
  });
});

describe("validateName", () => {
  it("accepts valid names", () => {
    expect(validateName("Joao")).toBe(true);
    expect(validateName("Maria Silva")).toBe(true);
    expect(validateName("  Ana  ")).toBe(true);
  });

  it("rejects names with numbers", () => {
    expect(validateName("Joao123")).toBe(false);
    expect(validateName("1")).toBe(false);
  });

  it("rejects empty or single-char names", () => {
    expect(validateName("")).toBe(false);
    expect(validateName("A")).toBe(false);
  });
});

describe("formatPhone", () => {
  it("formats digits correctly", () => {
    expect(formatPhone("1")).toBe("1");
    expect(formatPhone("11")).toBe("11");
    expect(formatPhone("113")).toBe("(11) 3");
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
    expect(formatPhone("11999994444")).toBe("(11) 99999-4444");
  });

  it("strips non-digit characters", () => {
    expect(formatPhone("(11) 99999-4444")).toBe("(11) 99999-4444");
    expect(formatPhone("abc1133334444")).toBe("(11) 3333-4444");
  });

  it("limits to 11 digits max", () => {
    expect(formatPhone("1199999444412345")).toBe("(11) 99999-4444");
  });
});

describe("validatePassword", () => {
  it("returns null for valid passwords", () => {
    expect(validatePassword("abc123")).toBe(null);
    expect(validatePassword("senha123")).toBe(null);
    expect(validatePassword("Abcdef1")).toBe(null);
  });

  it("rejects empty password", () => {
    expect(validatePassword("")).toBe("Senha é obrigatória");
  });

  it("rejects passwords shorter than 6 chars", () => {
    expect(validatePassword("ab1")).toBe("Mínimo 6 caracteres");
    expect(validatePassword("abc12")).toBe("Mínimo 6 caracteres");
  });

  it("rejects passwords without letters", () => {
    expect(validatePassword("123456")).toBe("Deve conter pelo menos uma letra");
  });

  it("rejects passwords without numbers", () => {
    expect(validatePassword("abcdef")).toBe("Deve conter pelo menos um número");
  });
});

describe("validateCpf", () => {
  it("accepts valid CPFs", () => {
    expect(validateCpf("52998224725")).toBe(true);
    expect(validateCpf("11144477735")).toBe(true);
    expect(validateCpf("10000000108")).toBe(true);
  });

  it("rejects invalid CPFs", () => {
    expect(validateCpf("")).toBe(false);
    expect(validateCpf("123.456.789-00")).toBe(false);
    expect(validateCpf("000.000.000-00")).toBe(false);
    expect(validateCpf("111.111.111-11")).toBe(false);
    expect(validateCpf("12345678901")).toBe(false);
  });

  it("rejects CPFs with wrong check digits", () => {
    expect(validateCpf("529.982.247-26")).toBe(false);
    expect(validateCpf("47184936080")).toBe(false);
  });
});

describe("formatCpf", () => {
  it("formats digits correctly", () => {
    expect(formatCpf("5")).toBe("5");
    expect(formatCpf("529")).toBe("529");
    expect(formatCpf("5299")).toBe("529.9");
    expect(formatCpf("5299822")).toBe("529.982.2");
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
  });

  it("strips non-digit characters", () => {
    expect(formatCpf("529.982.247-25")).toBe("529.982.247-25");
    expect(formatCpf("abc52998224725")).toBe("529.982.247-25");
  });

  it("limits to 11 digits max", () => {
    expect(formatCpf("5299822472512345")).toBe("529.982.247-25");
  });
});
