import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "@/app/(pages)/register/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/register",
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

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  mockPush.mockClear();
  mockFetch.mockResolvedValue({ ok: false, json: async () => ({}) });
});

function clickContinue() {
  fireEvent.click(screen.getByRole("button", { name: /continuar/i }));
}

function fillStep0() {
  fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
    target: { value: "test@email.com" },
  });
}

function fillStep1() {
  fireEvent.change(screen.getByPlaceholderText("000.000.000-00"), {
    target: { value: "12345678909" },
  });
  fireEvent.change(screen.getByPlaceholderText("Seu nome"), {
    target: { value: "João Silva" },
  });
  fireEvent.change(screen.getByPlaceholderText("(11) 99999-0000"), {
    target: { value: "11999990000" },
  });
}

describe("Register Page", () => {
  it("renders the first step", () => {
    render(<RegisterPage />);
    expect(screen.getByText("Criar conta")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("seu@email.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continuar/i })).toBeInTheDocument();
  });

  it("shows error for invalid email", async () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "invalid" },
    });
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("Email inválido")).toBeInTheDocument();
    });
  });

  it("validates email is required", async () => {
    render(<RegisterPage />);
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("Email é obrigatório")).toBeInTheDocument();
    });
  });

  it("advances to step 1 with valid email", async () => {
    render(<RegisterPage />);
    fillStep0();
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("Seus dados")).toBeInTheDocument();
    });
  });

  it("validates CPF is required on step 1", async () => {
    render(<RegisterPage />);
    fillStep0();
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("Seus dados")).toBeInTheDocument();
    });
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("CPF é obrigatório")).toBeInTheDocument();
    });
  });

  it("validates name is required on step 1", async () => {
    render(<RegisterPage />);
    fillStep0();
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("Seus dados")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText("000.000.000-00"), {
      target: { value: "12345678909" },
    });
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
    });
  });

  it("validates phone is required on step 1", async () => {
    render(<RegisterPage />);
    fillStep0();
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("Seus dados")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText("000.000.000-00"), {
      target: { value: "12345678909" },
    });
    fireEvent.change(screen.getByPlaceholderText("Seu nome"), {
      target: { value: "João Silva" },
    });
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("Telefone é obrigatório")).toBeInTheDocument();
    });
  });

  it("advances to step 2 with valid personal data", async () => {
    render(<RegisterPage />);
    fillStep0();
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("Seus dados")).toBeInTheDocument();
    });
    fillStep1();
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("Seu perfil")).toBeInTheDocument();
    });
  });

  it("validates role is required on step 2", async () => {
    render(<RegisterPage />);
    fillStep0();
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("Seus dados")).toBeInTheDocument();
    });
    fillStep1();
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("Seu perfil")).toBeInTheDocument();
    });
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("Selecione um modo de participação")).toBeInTheDocument();
    });
  });

  it("allows going back to previous steps", async () => {
    render(<RegisterPage />);
    fillStep0();
    clickContinue();
    await waitFor(() => {
      expect(screen.getByText("Seus dados")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /voltar/i }));
    await waitFor(() => {
      expect(screen.getByText("Criar conta")).toBeInTheDocument();
    });
  });

  it("shows login link", () => {
    render(<RegisterPage />);
    const link = screen.getByRole("link", { name: /faça login/i });
    expect(link).toHaveAttribute("href", "/login");
  });
});
