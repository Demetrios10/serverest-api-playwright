import { test, expect } from "@playwright/test";
import { criarUsuario, fazerLogin, gerarProduto } from "./helpers/dados.js";

test.describe("Produtos (rotas autenticadas)", () => {
  let tokenAdmin;

  test.beforeEach(async ({ request }) => {
    const admin = await criarUsuario(request, "true");
    tokenAdmin = await fazerLogin(request, admin.email, admin.password);
  });

  test("Admin deve cadastrar um produto", async ({ request }) => {
    const response = await request.post("/produtos", {
      headers: { Authorization: tokenAdmin },
      data: gerarProduto(),
    });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.message).toBe("Cadastro realizado com sucesso");
    expect(body._id).toBeTruthy();
  });

  test("Não deve cadastrar produto sem token", async ({ request }) => {
    const response = await request.post("/produtos", { data: gerarProduto() });

    expect(response.status()).toBe(401);
    expect((await response.json()).message).toBe(
      "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
    );
  });

  test("Não deve cadastrar produto com token inválido", async ({ request }) => {
    const response = await request.post("/produtos", {
      headers: { Authorization: "Bearer tokenInvalido123" },
      data: gerarProduto(),
    });

    expect(response.status()).toBe(401);
  });

  test("Usuário não-admin não deve cadastrar produto", async ({ request }) => {
    const comum = await criarUsuario(request, "false");
    const tokenComum = await fazerLogin(request, comum.email, comum.password);

    const response = await request.post("/produtos", {
      headers: { Authorization: tokenComum },
      data: gerarProduto(),
    });

    expect(response.status()).toBe(403);
    expect((await response.json()).message).toBe("Rota exclusiva para administradores");
  });

  test("Não deve cadastrar produto com nome duplicado", async ({ request }) => {
    const produto = gerarProduto();
    const headers = { Authorization: tokenAdmin };

    await request.post("/produtos", { headers, data: produto });
    const response = await request.post("/produtos", { headers, data: produto });

    expect(response.status()).toBe(400);
    expect((await response.json()).message).toBe("Já existe produto com esse nome");
  });

  test("Fluxo E2E: cadastrar, consultar, alterar e excluir produto", async ({ request }) => {
    const produto = gerarProduto();
    const headers = { Authorization: tokenAdmin };

    // 1. Cadastrar
    const criar = await request.post("/produtos", { headers, data: produto });
    expect(criar.status()).toBe(201);
    const { _id } = await criar.json();

    // 2. Consultar
    const consultar = await request.get(`/produtos/${_id}`);
    expect(consultar.status()).toBe(200);
    expect((await consultar.json()).nome).toBe(produto.nome);

    // 3. Alterar preço
    const alterar = await request.put(`/produtos/${_id}`, {
      headers,
      data: { ...produto, preco: 999 },
    });
    expect(alterar.status()).toBe(200);
    expect((await (await request.get(`/produtos/${_id}`)).json()).preco).toBe(999);

    // 4. Excluir
    const excluir = await request.delete(`/produtos/${_id}`, { headers });
    expect(excluir.status()).toBe(200);
    expect((await excluir.json()).message).toBe("Registro excluído com sucesso");
  });
});
