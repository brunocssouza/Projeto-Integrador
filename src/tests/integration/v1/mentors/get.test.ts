async function getAuthToken(): Promise<string> {
  const response = await fetch("http://localhost:3000/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "teste@teste.com", password: "123456" }),
  });

  const setCookie = response.headers.get("Set-Cookie");
  if (!setCookie) throw new Error("No Set-Cookie header");

  const token = setCookie.split(";")[0].split("=")[1];
  return token;
}

test("GET /api/v1/mentors returns mentor list", async () => {
  const token = await getAuthToken();

  const response = await fetch("http://localhost:3000/api/v1/mentors", {
    headers: { Cookie: `token=${token}` },
  });

  expect(response.status).toBe(200);

  const body = await response.json();
  expect(Array.isArray(body.mentors)).toBe(true);
  expect(body.mentors.length).toBeGreaterThan(0);

  const mentor = body.mentors[0];
  expect(typeof mentor.id).toBe("string");
  expect(mentor.name).toBeTruthy();
  expect(mentor.role).toBeTruthy();
  expect(typeof mentor.price).toBe("number");
});

test("GET /api/v1/mentors without auth returns 401", async () => {
  const response = await fetch("http://localhost:3000/api/v1/mentors");
  expect(response.status).toBe(401);
});
