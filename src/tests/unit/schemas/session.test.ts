import { bookingSchema, cancelSchema, rescheduleSchema } from "@/lib/schemas/session";

describe("bookingSchema", () => {
  const validInput = {
    mentorId: 1,
    dataHora: "2026-08-01T10:00:00.000Z",
    titulo: "Mentoria de React",
    area: "Frontend",
  };

  it("accepts valid input with defaults", () => {
    const result = bookingSchema.parse(validInput);
    expect(result.duracaoMin).toBe(60); // default
  });

  it("rejects missing mentorId", () => {
    const result = bookingSchema.safeParse({ ...validInput, mentorId: undefined });
    expect(result.success).toBe(false);
  });

  it("rejects short titulo", () => {
    const result = bookingSchema.safeParse({ ...validInput, titulo: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid datetime", () => {
    const result = bookingSchema.safeParse({ ...validInput, dataHora: "not-a-date" });
    expect(result.success).toBe(false);
  });
});

describe("cancelSchema", () => {
  it("accepts valid reason", () => {
    const result = cancelSchema.parse({ motivo: "conflito_horario" });
    expect(result.motivo).toBe("conflito_horario");
  });

  it("rejects invalid reason", () => {
    const result = cancelSchema.safeParse({ motivo: "invalid_reason" });
    expect(result.success).toBe(false);
  });
});

describe("rescheduleSchema", () => {
  it("accepts valid datetime", () => {
    const result = rescheduleSchema.parse({ novaDataHora: "2026-08-01T10:00:00.000Z" });
    expect(result.novaDataHora).toBe("2026-08-01T10:00:00.000Z");
  });

  it("rejects invalid datetime", () => {
    const result = rescheduleSchema.safeParse({ novaDataHora: "tomorrow" });
    expect(result.success).toBe(false);
  });
});
