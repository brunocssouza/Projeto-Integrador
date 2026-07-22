export async function POST() {
  const response = Response.json({ message: "Logout realizado" });
  response.headers.set(
    "Set-Cookie",
    "token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
  );
  return response;
}
