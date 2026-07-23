test("POST /api/v1/auth/login with valid credentials", async () => {
  const response = await fetch("http://localhost:3000/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "aluno@aluno.com", password: "123456" }),
  });

  expect(response.status).toBe(200);

  const body = await response.json();
  expect(body.user).toBeDefined();
  expect(body.user.email).toBe("aluno@aluno.com");
  expect(body.user.name).toBe("Aluno Teste");
  expect(typeof body.user.id).toBe("number");

  const setCookie = response.headers.get("Set-Cookie");
  expect(setCookie).toBeTruthy();
  expect(setCookie).toContain("token=");
});

test("POST /api/v1/auth/login with wrong password", async () => {
  const response = await fetch("http://localhost:3000/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "aluno@aluno.com", password: "wrongpass" }),
  });

  expect(response.status).toBe(401);

  const body = await response.json();
  expect(body.error).toBeTruthy();
});

test("POST /api/v1/auth/login with missing fields", async () => {
  const response = await fetch("http://localhost:3000/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "aluno@aluno.com" }),
  });

  expect(response.status).toBe(422);

  const body = await response.json();
  expect(body.error).toBeTruthy();
});
