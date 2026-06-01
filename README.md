# SOB Controle

Aplicação completa para controle diário de finanças pessoais com backend em Spring Boot, frontend em Angular e PostgreSQL via Docker.

## O que já está implementado

- Login, cadastro de usuário e recuperação de senha por email
- Dashboard com visão do mês, gráficos e alertas de limite por categoria
- Lançamento rápido de gastos com categoria, forma de pagamento, cartão e parcelamento
- Cadastro de cartões e categorias pelo próprio usuário
- Relatório mensal com resumo analítico e sugestões de economia
- Painel de super admin para branding e configurações SMTP
- Docker Compose com `postgres`, `backend` e `frontend`

## Estrutura

- `backend/`: API Java Spring Boot
- `frontend/`: SPA Angular
- `docker-compose.yml`: orquestração da stack
- `.env`: configuração central de ambiente

## Como subir com Docker

1. Ajuste os valores de `.env`, principalmente `JWT_SECRET` e SMTP.
2. Rode:

```powershell
docker compose up --build
```

3. Acesse:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`

## Credenciais iniciais

- Super admin:
  - Email: `admin@sobcontrole.com`
  - Senha: `Admin@123`

## Observações

- O frontend contém fallback visual com dados mockados para facilitar demonstração mesmo antes da API estar populada.
- A recuperação de senha usa o SMTP configurado no painel de super admin e nas variáveis de ambiente do backend.
- Para produção, mova segredos para um secret manager e substitua `ddl-auto: update` por migrações versionadas.