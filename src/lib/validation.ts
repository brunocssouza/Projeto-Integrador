export const validateEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits[2] === "9") return true;
  if (digits.length === 10) return true;
  return false;
};

export const validateName = (name: string): boolean => {
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  if (/\d/.test(trimmed)) return false;
  return true;
};

export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length === 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "Senha e obrigatoria";
  if (password.length < 6) return "Minimo 6 caracteres";
  if (!/[a-zA-Z]/.test(password)) return "Deve conter pelo menos uma letra";
  if (!/\d/.test(password)) return "Deve conter pelo menos um numero";
  return null;
};
