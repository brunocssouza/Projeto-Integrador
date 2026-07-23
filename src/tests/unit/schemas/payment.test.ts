import { checkoutSchema, refundRequestSchema } from "@/lib/schemas/payment";

describe("checkoutSchema", () => {
  it("accepts valid pix input", () => {
    const result = checkoutSchema.parse({ sessionId: 1, method: "pix" });
    expect(result.method).toBe("pix");
  });

  it("defaults method to pix", () => {
    const result = checkoutSchema.parse({ sessionId: 1 });
    expect(result.method).toBe("pix");
  });

  it("rejects missing sessionId", () => {
    const result = checkoutSchema.safeParse({ method: "pix" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid method", () => {
    const result = checkoutSchema.safeParse({ sessionId: 1, method: "bitcoin" });
    expect(result.success).toBe(false);
  });
});

describe("refundRequestSchema", () => {
  it("accepts valid reason", () => {
    const result = refundRequestSchema.parse({ reason: "Não poderei comparecer à sessão" });
    expect(result.reason).toContain("comparecer");
  });

  it("rejects short reason", () => {
    const result = refundRequestSchema.safeParse({ reason: "curto" });
    expect(result.success).toBe(false);
  });
});
