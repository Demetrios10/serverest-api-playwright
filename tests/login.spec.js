import { test, expect } from "@playwright/test";
import { criarUsuario, gerarEmail } from "./helpers/dados.js";

test.describe("POST /login", () => {
  test("Deve realizar login com sucesso e retornar token Bearer", async ({ request }) => {
    const usuario = await criarUsuario(request);

    const response = await request.post("/login", {
      data: { email: usuario.email, password: usuario.password },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.message).toBe("Login realizado com sucesso");
    expect(body.authorization).toMatch(/^Bearer\s.+/);
  });

  test("Não deve logar com senha incorreta", async ({ request }) => {
    const usuario = await criarUsuario(request);

    const response = await request.post("/login", {
      data: { email: usuario.email, password: "senhaErrada" },
    });

    expect(response.status()).toBe(401);
    expect((await response.json()).message).toBe("Email e/ou senha inválidos");
  });

  test("Não deve logar com email não cadastrado", async ({ request }) => {
    const response = await request.post("/login", {
      data: { email: gerarEmail(), password: "teste123" },
    });

    expect(response.status()).toBe(401);
  });

  test("Deve validar campos obrigatórios do login", async ({ request }) => {
    const response = await request.post("/login", { data: {} });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.email).toBe("email é obrigatório");
    expect(body.password).toBe("password é obrigatório");
  });
});
