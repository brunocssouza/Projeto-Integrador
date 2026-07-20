import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "@/app/(pages)/register/page";

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

function advanceToStep(step: number, user: ReturnType<typeof userEvent.setup>) {
  // Step 0: email
  fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { name: "email", value: "test@test.com" } });
  return user.click(screen.getByRole("button", { name: /continuar/i }));
}

describe("Register Page", () => {
  it("renders step 0 (email) by default", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Criar conta")).toBeInTheDocument();
    expect(screen.getByText("Comece com seu e-mail")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("seu@email.com")).toBeInTheDocument();
  });

  it("shows error for empty email", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    expect(screen.getByText("Email e obrigatorio")).toBeInTheDocument();
  });

  it("shows error for invalid email", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { name: "email", value: "notanemail" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    expect(screen.getByText("Email invalido")).toBeInTheDocument();
  });

  it("shows error for duplicate email", async () => {
    localStorage.setItem("users", JSON.stringify([{ email: "taken@test.com", password: "abc123" }]));
    const user = userEvent.setup();
    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { name: "email", value: "taken@test.com" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    expect(screen.getByText("Este email ja esta cadastrado")).toBeInTheDocument();
  });

  it("advances to step 1 with valid email", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { name: "email", value: "ok@test.com" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    expect(screen.getByText("Seus dados")).toBeInTheDocument();
  });

  it("shows errors on step 1 for empty name and phone", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await advanceToStep(1, user);
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    expect(screen.getByText("Nome e obrigatorio")).toBeInTheDocument();
    expect(screen.getByText("Telefone e obrigatorio")).toBeInTheDocument();
  });

  it("rejects name with numbers", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await advanceToStep(1, user);
    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { name: "name", value: "Joao123" } });
    fireEvent.change(screen.getByPlaceholderText("(11) 99999-0000"), { target: { name: "phone", value: "11999994444" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    expect(screen.getByText(/Nome invalido/)).toBeInTheDocument();
  });

  it("rejects invalid phone format", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await advanceToStep(1, user);
    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { name: "name", value: "Joao" } });
    fireEvent.change(screen.getByPlaceholderText("(11) 99999-0000"), { target: { name: "phone", value: "123" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    expect(screen.getByText("Formato: (DDD) 99999-9999")).toBeInTheDocument();
  });

  it("advances through all steps and submits", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    // Step 0
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { name: "email", value: "new@test.com" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    // Step 1
    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { name: "name", value: "Maria" } });
    fireEvent.change(screen.getByPlaceholderText("(11) 99999-0000"), { target: { name: "phone", value: "11988887777" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    // Step 2
    fireEvent.change(screen.getByDisplayValue("Selecione sua area"), { target: { name: "role", value: "frontend" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    // Step 3
    fireEvent.change(screen.getByPlaceholderText(/Min/), { target: { name: "password", value: "senha123" } });
    fireEvent.change(screen.getByPlaceholderText("Repita a senha"), { target: { name: "confirmPassword", value: "senha123" } });
    await user.click(screen.getByRole("button", { name: /finalizar/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("rejects short password", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await advanceToStep(1, user);
    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { name: "name", value: "Joao" } });
    fireEvent.change(screen.getByPlaceholderText("(11) 99999-0000"), { target: { name: "phone", value: "11999994444" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    // Step 2
    fireEvent.change(screen.getByDisplayValue("Selecione sua area"), { target: { name: "role", value: "backend" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    // Step 3
    fireEvent.change(screen.getByPlaceholderText(/Min/), { target: { name: "password", value: "ab" } });
    fireEvent.change(screen.getByPlaceholderText("Repita a senha"), { target: { name: "confirmPassword", value: "ab" } });
    await user.click(screen.getByRole("button", { name: /finalizar/i }));
    expect(screen.getByText("Minimo 6 caracteres")).toBeInTheDocument();
  });

  it("rejects mismatched passwords", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await advanceToStep(1, user);
    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { name: "name", value: "Joao" } });
    fireEvent.change(screen.getByPlaceholderText("(11) 99999-0000"), { target: { name: "phone", value: "11999994444" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    fireEvent.change(screen.getByDisplayValue("Selecione sua area"), { target: { name: "role", value: "backend" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    fireEvent.change(screen.getByPlaceholderText(/Min/), { target: { name: "password", value: "senha123" } });
    fireEvent.change(screen.getByPlaceholderText("Repita a senha"), { target: { name: "confirmPassword", value: "outra456" } });
    await user.click(screen.getByRole("button", { name: /finalizar/i }));
    expect(screen.getByText("Senhas nao coincidem")).toBeInTheDocument();
  });

  it("stores user in localStorage after submit", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), { target: { name: "email", value: "save@test.com" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { name: "name", value: "Test" } });
    fireEvent.change(screen.getByPlaceholderText("(11) 99999-0000"), { target: { name: "phone", value: "11988887777" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    fireEvent.change(screen.getByDisplayValue("Selecione sua area"), { target: { name: "role", value: "qa" } });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    fireEvent.change(screen.getByPlaceholderText(/Min/), { target: { name: "password", value: "test123" } });
    fireEvent.change(screen.getByPlaceholderText("Repita a senha"), { target: { name: "confirmPassword", value: "test123" } });
    await user.click(screen.getByRole("button", { name: /finalizar/i }));
    await waitFor(() => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe("save@test.com");
      expect(users[0].password).toBe("test123");
    });
  });
});
