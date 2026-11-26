import { test, expect } from "@playwright/test";
import { gerarUsuario, criarUsuario, ID_INEXISTENTE } from "./helpers/dados.js";

test.describe("GET /usuarios", () => {
  test("Deve listar usuários com status 200", async ({ request }) => {
    const response = await request.get("/usuarios");
    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log("Primeiro usuário:", JSON.stringify(body.usuarios[0], null, 2));
  });

  test("Deve retornar a quantidade igual ao tamanho da lista", async ({ request }) => {
    const body = await (await request.get("/usuarios")).json();

    expect(body).toHaveProperty("quantidade");
    expect(Array.isArray(body.usuarios)).toBeTruthy();
    expect(body.quantidade).toBe(body.usuarios.length);
  });

  test("Cada usuário deve ter os campos obrigatórios (contrato)", async ({ request }) => {
    const body = await (await request.get("/usuarios")).json();

    for (const usuario of body.usuarios.slice(0, 5)) {
      expect(usuario).toEqual(
        expect.objectContaining({
          nome: expect.any(String),
          email: expect.any(String),
          password: expect.any(String),
          administrador: expect.stringMatching(/^(true|false)$/),
          _id: expect.any(String),
        })
      );
    }
  });

  test("Deve retornar o header Content-Type JSON", async ({ request }) => {
    const response = await request.get("/usuarios");
    expect(response.headers()["content-type"]).toContain("application/json");
  });

  test("Deve filtrar usuários por email", async ({ request }) => {
    const usuario = await criarUsuario(request);

    const response = await request.get("/usuarios", { params: { email: usuario.email } });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.quantidade).toBe(1);
    expect(body.usuarios[0].email).toBe(usuario.email);
  });

  test("Deve filtrar apenas administradores", async ({ request }) => {
    const response = await request.get("/usuarios", { params: { administrador: "true" } });
    const body = await response.json();

    expect(response.status()).toBe(200);
    for (const usuario of body.usuarios) {
      expect(usuario.administrador).toBe("true");
    }
  });

  test("Deve buscar usuário por ID", async ({ request }) => {
    const usuario = await criarUsuario(request);

    const response = await request.get(`/usuarios/${usuario._id}`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toMatchObject({
      nome: usuario.nome,
      email: usuario.email,
      _id: usuario._id,
    });
  });

  test("Deve retornar 400 ao buscar ID inexistente", async ({ request }) => {
    const response = await request.get(`/usuarios/${ID_INEXISTENTE}`);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.message).toBe("Usuário não encontrado");
  });
});

test.describe("POST /usuarios", () => {
  test("Deve cadastrar um usuário com sucesso", async ({ request }) => {
    const response = await request.post("/usuarios", { data: gerarUsuario() });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.message).toBe("Cadastro realizado com sucesso");
    expect(body._id).toBeTruthy();
  });

  test("Não deve cadastrar com email duplicado", async ({ request }) => {
    const usuario = await criarUsuario(request);

    const response = await request.post("/usuarios", {
      data: { ...gerarUsuario(), email: usuario.email },
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.message).toBe("Este email já está sendo usado");
  });

  test("Não deve cadastrar com email inválido", async ({ request }) => {
    const response = await request.post("/usuarios", {
      data: { ...gerarUsuario(), email: "email-invalido" },
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.email).toBe("email deve ser um email válido");
  });

  test("Deve validar todos os campos obrigatórios com body vazio", async ({ request }) => {
    const response = await request.post("/usuarios", { data: {} });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).toEqual({
      nome: "nome é obrigatório",
      email: "email é obrigatório",
      password: "password é obrigatório",
      administrador: "administrador é obrigatório",
    });
  });

  for (const campo of ["nome", "email", "password"]) {
    test(`Não deve aceitar o campo "${campo}" em branco`, async ({ request }) => {
      const response = await request.post("/usuarios", {
        data: { ...gerarUsuario(), [campo]: "" },
      });
      const body = await response.json();

      expect(response.status()).toBe(400);
      expect(body[campo]).toBe(`${campo} não pode ficar em branco`);
    });
  }

  test("Não deve aceitar administrador diferente de 'true' ou 'false'", async ({ request }) => {
    const response = await request.post("/usuarios", {
      data: { ...gerarUsuario(), administrador: "sim" },
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.administrador).toBe("administrador deve ser 'true' ou 'false'");
  });
});

test.describe("PUT /usuarios/{_id}", () => {
  test("Deve alterar o nome de um usuário", async ({ request }) => {
    const usuario = await criarUsuario(request);
    const { _id, ...dados } = usuario;
    const novoNome = "Nome Alterado QA";

    const response = await request.put(`/usuarios/${_id}`, {
      data: { ...dados, nome: novoNome },
    });

    expect(response.status()).toBe(200);
    expect((await response.json()).message).toBe("Registro alterado com sucesso");

    const consulta = await request.get(`/usuarios/${_id}`);
    expect((await consulta.json()).nome).toBe(novoNome);
  });

  test("Não deve alterar para um email já usado por outro usuário", async ({ request }) => {
    const usuario1 = await criarUsuario(request);
    const { _id, ...dados2 } = await criarUsuario(request);

    const response = await request.put(`/usuarios/${_id}`, {
      data: { ...dados2, email: usuario1.email },
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).message).toBe("Este email já está sendo usado");
  });

  test("PUT com ID inexistente deve criar um novo usuário", async ({ request }) => {
    const response = await request.put(`/usuarios/naoexiste${Date.now()}`, {
      data: gerarUsuario(),
    });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expect(body.message).toBe("Cadastro realizado com sucesso");

    await request.delete(`/usuarios/${body._id}`); // limpeza
  });
});

test.describe("DELETE /usuarios/{_id}", () => {
  test("Deve excluir um usuário existente", async ({ request }) => {
    const usuario = await criarUsuario(request);

    const response = await request.delete(`/usuarios/${usuario._id}`);
    expect(response.status()).toBe(200);
    expect((await response.json()).message).toBe("Registro excluído com sucesso");

    const consulta = await request.get(`/usuarios/${usuario._id}`);
    expect(consulta.status()).toBe(400);
  });

  test("Excluir ID inexistente não deve excluir nada", async ({ request }) => {
    const response = await request.delete(`/usuarios/${ID_INEXISTENTE}`);

    expect(response.status()).toBe(200);
    expect((await response.json()).message).toBe("Nenhum registro excluído");
  });
});
