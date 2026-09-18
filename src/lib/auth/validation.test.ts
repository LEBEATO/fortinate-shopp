import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./validation";

describe("validação de autenticação", () => {
  it("normaliza o e-mail no cadastro", () => {
    const result = registerSchema.parse({ name: "Alex Beato", email: "  ALEX@EXAMPLE.COM ", password: "senha-segura" });
    expect(result.email).toBe("alex@example.com");
  });
  it("recusa senha curta", () => { expect(registerSchema.safeParse({ name: "Alex Beato", email: "alex@example.com", password: "123" }).success).toBe(false); });
  it("recusa nome vazio", () => { expect(registerSchema.safeParse({ name: " ", email: "alex@example.com", password: "senha-segura" }).success).toBe(false); });
  it("aceita credenciais válidas no login", () => { expect(loginSchema.safeParse({ email: "alex@example.com", password: "senha-segura" }).success).toBe(true); });
});
