# 🧪 ServeRest API — Testes Automatizados com Playwright

![Testes de API](https://github.com/Demetrios10/serverest-api-playwright/actions/workflows/playwright.yml/badge.svg)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

Projeto de portfólio com testes automatizados de **API REST** usando o cliente `request` do **Playwright**, aplicados à [ServeRest](https://serverest.dev), uma API pública que simula uma loja virtual.

## 🎯 Objetivo

Demonstrar práticas de automação de testes de API:

- Cenários **positivos e negativos** (status code, mensagens e contrato do JSON)
- **Autenticação** com token Bearer e controle de permissão (admin x usuário comum)
- **Massa de dados dinâmica**, para que os testes sejam independentes e possam rodar em paralelo
- Fluxo **E2E** de CRUD completo
- **Integração contínua** com GitHub Actions e relatório HTML

## 📋 Cobertura

| Recurso | Cenários |
|---|---|
| `GET /usuarios` | Listagem, contrato dos campos, header, filtros por email e por perfil, busca por ID, ID inexistente |
| `POST /usuarios` | Cadastro válido, email duplicado, email inválido, campos obrigatórios, campos em branco, perfil inválido |
| `PUT /usuarios/{id}` | Alteração com verificação, email já em uso, criação via PUT com ID inexistente |
| `DELETE /usuarios/{id}` | Exclusão com verificação, ID inexistente |
| `POST /login` | Login válido com token Bearer, senha incorreta, email não cadastrado, campos obrigatórios |
| `/produtos` | Cadastro como admin, sem token, token inválido, usuário sem permissão (403), nome duplicado, fluxo E2E |

## 🗂️ Estrutura

```
├── .github/workflows/playwright.yml   # Pipeline de CI
├── tests/
│   ├── helpers/dados.js               # Geração de massa e funções reutilizáveis
│   ├── usuarios.spec.js
│   ├── login.spec.js
│   └── produtos.spec.js
├── playwright.config.js               # baseURL, reporters, retries
└── package.json
```

## ▶️ Como executar

Pré-requisito: [Node.js](https://nodejs.org) 18 ou superior.

```bash
git clone https://github.com/Demetrios10/serverest-api-playwright.git
cd serverest-api-playwright
npm install

npm test                 # todos os testes
npm run test:usuarios    # apenas usuários
npm run test:login       # apenas login
npm run test:produtos    # apenas produtos
npm run report           # abre o relatório HTML
```

> Como são testes só de API, não é preciso instalar navegadores (`npx playwright install`).

## 🛠️ Tecnologias

- [Playwright Test](https://playwright.dev/docs/api-testing)
- JavaScript (ES Modules)
- GitHub Actions

## 👤 Autor

**Demetrios** — Analista de QA
[GitHub](https://github.com/Demetrios10)
