import { expect } from "@playwright/test";

// A ServeRest é pública e compartilhada: dados únicos evitam conflito entre execuções
function sufixoUnico() {
  return `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export function gerarEmail() {
  return `qa_${sufixoUnico()}@teste.com`;
}

export function gerarUsuario(admin = "true") {
  return {
    nome: "Usuario Teste QA",
    email: gerarEmail(),
    password: "teste123",
    administrador: admin,
  };
}

export function gerarProduto() {
  return {
    nome: `Produto QA ${sufixoUnico()}`,
    preco: 150,
    descricao: "Produto criado via teste automatizado",
    quantidade: 10,
  };
}

export async function criarUsuario(request, admin = "true") {
  const usuario = gerarUsuario(admin);
  const response = await request.post("/usuarios", { data: usuario });
  expect(response.status()).toBe(201);
  const body = await response.json();
  return { ...usuario, _id: body._id };
}

export async function fazerLogin(request, email, password) {
  const response = await request.post("/login", { data: { email, password } });
  expect(response.status()).toBe(200);
  const body = await response.json();
  return body.authorization; // "Bearer xxx"
}

export const ID_INEXISTENTE = "0000000000000000";
