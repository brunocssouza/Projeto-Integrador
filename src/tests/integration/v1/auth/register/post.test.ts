function randomCpf(): string {
  return String(Date.now()).slice(0, 11).padEnd(11, "0");
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
      phone: "11999990000",
      password: "123456",
      role: "aluno",
      languages: ["PT", "EN"],
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

  expect(response.status).toBe(400);

  const body = await response.json();
  expect(body.error).toBeTruthy();
});

test("POST /api/v1/auth/register with duplicate email", async () => {
  const response = await fetch("http://localhost:3000/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "teste@teste.com",
      cpf: randomCpf(),
      name: "Duplicate",
      phone: "11999990000",
      password: "123456",
      role: "aluno",
      languages: ["PT"],
    }),
  });

  expect(response.status).toBe(409);

  const body = await response.json();
  expect(body.error).toBeTruthy();
});
