import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/(pages)/login/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("next/link", () => {
  const React = require("react");
  return React.forwardRef(function MockLink(
    { children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown },
    ref: React.Ref<HTMLAnchorElement>
  ) {
    return (
      <a ref={ref} href={href} {...props}>
        {children}
      </a>
    );
  });
});

jest.mock("gsap", () => ({
  context: (fn: () => void) => { fn(); return { revert: jest.fn() }; },
  from: jest.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  mockPush.mockClear();
});

function registerTestUser() {
  localStorage.setItem(
    "users",
    JSON.stringify([{ email: "user@test.com", password: "senha123", name: "Test User" }])
  );
}

describe("Login Page", () => {
  it("renders the login form", () => {
    render(<LoginPage />);
    expect(screen.getByText("Bem-vindo de volta")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("seu@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Sua senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar$/i })).toBeInTheDocument();
  });

  it("shows error when fields are empty", async () => {
    render(<LoginPage />);
    const form = screen.getByRole("button", { name: /entrar$/i }).closest("form")!;
    fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByText("Preencha todos os campos")).toBeInTheDocument();
    });
  });

  it("shows error for non-registered email", async () => {
    registerTestUser();
    const user = userEvent.setup();
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { value: "wrong@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Sua senha"), { target: { value: "senha123" } });
    await user.click(screen.getByRole("button", { name: /entrar$/i }));
    expect(screen.getByText("Email ou senha incorretos")).toBeInTheDocument();
  });

  it("shows error for wrong password", async () => {
    registerTestUser();
    const user = userEvent.setup();
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Sua senha"), { target: { value: "wrongpass" } });
    await user.click(screen.getByRole("button", { name: /entrar$/i }));
    expect(screen.getByText("Email ou senha incorretos")).toBeInTheDocument();
  });

  it("redirects to dashboard on valid credentials", async () => {
    registerTestUser();
    const user = userEvent.setup();
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Sua senha"), { target: { value: "senha123" } });
    await user.click(screen.getByRole("button", { name: /entrar$/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("clears error when user starts typing", async () => {
    registerTestUser();
    const user = userEvent.setup();
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { value: "wrong@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Sua senha"), { target: { value: "wrongpass" } });
    await user.click(screen.getByRole("button", { name: /entrar$/i }));
    expect(screen.getByText("Email ou senha incorretos")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { value: "fixed@test.com" } });
    expect(screen.queryByText("Email ou senha incorretos")).not.toBeInTheDocument();
  });

  it("shows loading state while submitting", async () => {
    registerTestUser();
    const user = userEvent.setup();
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Sua senha"), { target: { value: "senha123" } });
    await user.click(screen.getByRole("button", { name: /entrar$/i }));
    expect(screen.getByText("Entrando...")).toBeInTheDocument();
  });

  it("links to register page", () => {
    render(<LoginPage />);
    const link = screen.getByRole("link", { name: /cadastre-se/i });
    expect(link).toHaveAttribute("href", "/register");
  });

  it("shows password visibility toggle", async () => {
    render(<LoginPage />);
    const input = screen.getByPlaceholderText("Sua senha");
    expect(input).toHaveAttribute("type", "password");
    const toggle = screen.getByText("visibility");
    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");
  });
});
