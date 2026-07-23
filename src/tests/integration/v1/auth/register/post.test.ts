function randomCpf(): string {
  const d = String(Date.now()).slice(0, 11).padEnd(11, "0");
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

test("POST /api/v1/auth/register with valid data", async () => {
  const uniqueEmail = `test-integration-${Date.now()}@test.com`;

  const response = await fetch("http://localhost:3000/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: uniqueEmail,
      cpf: randomCpf(),
      name: "Integration Test",
      phone: "(11) 99999-0000",
      password: "12345678",
      confirmPassword: "12345678",
      isStudent: true,
      isMentor: false,
    }),
  });

  expect(response.status).toBe(201);

  const body = await response.json();
  expect(body.message).toBe("Conta criada com sucesso");
});

test("POST /api/v1/auth/register with missing fields", async () => {
  const response = await fetch("http://localhost:3000/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@test.com" }),
  });

  expect(response.status).toBe(422);

  const body = await response.json();
  expect(body.error).toBeTruthy();
});

test("POST /api/v1/auth/register with duplicate email", async () => {
  const response = await fetch("http://localhost:3000/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "aluno@aluno.com",
      cpf: randomCpf(),
      name: "Duplicate",
      phone: "(11) 99999-0000",
      password: "12345678",
      confirmPassword: "12345678",
      isStudent: true,
      isMentor: false,
    }),
  });

  expect(response.status).toBe(409);

  const body = await response.json();
  expect(body.error).toBeTruthy();
});
