# ProntuCar — API de Gerenciamento de Manutenção de Veículos

API REST do ProntuCar, sistema para registrar veículos e o histórico de manutenções de cada um, com relatórios de gastos e revisões pendentes. Projeto da disciplina de Desenvolvimento Web (Next.js), IFPR.

**Integrantes:** preencher com os nomes do grupo

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Next.js (App Router, Route Handlers) | Servidor da API (`app/api/**/route.ts`) |
| TypeScript | Tipagem |
| MySQL 8 + mysql2 | Banco de dados, consultas SQL parametrizadas |
| Zod | Validação dos dados de entrada |
| bcryptjs | Hash de senhas |
| jsonwebtoken | Autenticação por token JWT |

## Estrutura do projeto

```
app/api/            rotas da API (HTTP, validação, autenticação, códigos de status)
repositories/       acesso ao banco (somente SQL)
lib/                db.ts (conexão), auth.ts (JWT), http.ts (erros), regrasManutencao.ts
lib/validators/     schemas Zod de cada recurso
types/              tipos TypeScript
database/schema.sql criação das tabelas
```

As rotas não escrevem SQL: chamam os repositories, que são a única camada que fala com o banco.

## Como executar

**Pré-requisitos:** Node.js 20+ e MySQL 8.

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o banco e as tabelas: execute o conteúdo de `database/schema.sql` (DBeaver, MySQL Workbench ou terminal). O script já cria o banco `manut`.

3. Crie o arquivo `.env` na raiz, a partir do `.env.example`:

   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_NAME=manut
   JWT_SECRET=uma_chave_longa_e_aleatoria
   ```

4. Rode em desenvolvimento:

   ```bash
   npm run dev
   ```

A API fica em `http://localhost:3000/api`.

Para produção: `npm run build` e `npm start`.

## Banco de dados

Três tabelas (InnoDB, utf8mb4):

- **usuarios** — id, nome, email (único), senha_hash, created_at
- **veiculos** — id, usuario_id (FK), placa, marca, modelo, ano, km_atual, created_at. Placa única por usuário.
- **manutencoes** — id, veiculo_id (FK), tipo, data, km, custo, oficina, observacoes, proxima_revisao_km, proxima_revisao_data, created_at

Relacionamentos: usuário 1:N veículos; veículo 1:N manutenções. As chaves estrangeiras usam `ON DELETE RESTRICT`.

## Autenticação

Faça login em `POST /api/auth/login` e envie o token recebido em todas as outras rotas (exceto cadastro, login e health):

```
Authorization: Bearer <token>
```

O token expira em 2 horas. Cada usuário só enxerga e altera os próprios dados: o dono é sempre identificado pelo token, nunca pelo corpo da requisição. Recurso de outro usuário responde 404.

## Formato de erro

Todos os erros seguem o mesmo formato:

```json
{
  "erro": "Dados inválidos",
  "detalhes": [
    { "campo": "email", "mensagem": "E-mail inválido" }
  ]
}
```

`detalhes` aparece apenas nos erros de validação.

## Códigos HTTP utilizados

| Código | Significado |
|---|---|
| 200 | Sucesso |
| 201 | Recurso criado |
| 204 | Excluído com sucesso (sem corpo) |
| 400 | Dados inválidos (validação) ou id/filtro mal formado |
| 401 | Não autenticado (token ausente, inválido ou expirado; login incorreto) |
| 404 | Recurso não encontrado (ou pertencente a outro usuário) |
| 409 | Conflito (e-mail já cadastrado, placa duplicada, veículo com manutenções) |
| 422 | Regra de negócio violada (km menor que o da última manutenção) |
| 500 | Erro interno |

## Endpoints

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| GET | `/api/health` | não | Verifica API e banco |
| POST | `/api/auth/register` | não | Cadastra usuário |
| POST | `/api/auth/login` | não | Autentica e devolve o token |
| GET | `/api/usuarios/me` | sim | Dados do usuário logado |
| PUT | `/api/usuarios/me` | sim | Edita o usuário logado |
| GET | `/api/veiculos` | sim | Lista veículos (filtro `busca`) |
| POST | `/api/veiculos` | sim | Cadastra veículo |
| GET | `/api/veiculos/:id` | sim | Detalha veículo |
| PUT | `/api/veiculos/:id` | sim | Edita veículo |
| DELETE | `/api/veiculos/:id` | sim | Exclui veículo |
| GET | `/api/manutencoes` | sim | Lista manutenções (com filtros) |
| POST | `/api/manutencoes` | sim | Registra manutenção |
| GET | `/api/manutencoes/:id` | sim | Detalha manutenção |
| PUT | `/api/manutencoes/:id` | sim | Edita manutenção |
| DELETE | `/api/manutencoes/:id` | sim | Exclui manutenção |
| GET | `/api/relatorios/gastos-por-veiculo` | sim | Total gasto por veículo |
| GET | `/api/relatorios/por-tipo` | sim | Quantidade e gasto por tipo |
| GET | `/api/relatorios/custo-por-km` | sim | Custo por km rodado |
| GET | `/api/relatorios/revisoes-pendentes` | sim | Revisões vencidas por data ou km |

### Health

`GET /api/health` → `200`

## Autenticação (rotas)

### POST /api/auth/register

Corpo:

```json
{ "nome": "Maria Silva", "email": "maria@email.com", "senha": "123456" }
```

Regras: nome obrigatório; e-mail válido; senha com no mínimo 6 caracteres.

Respostas:

- `201` — `{ "id": 1, "nome": "Maria Silva", "email": "maria@email.com" }`
- `400` — dados inválidos
- `409` — e-mail já cadastrado

A senha é gravada somente como hash (bcrypt) e nunca é devolvida.

### POST /api/auth/login

Corpo:

```json
{ "email": "maria@email.com", "senha": "123456" }
```

Respostas:

- `200`

  ```json
  {
    "token": "eyJhbGciOi...",
    "usuario": { "id": 1, "nome": "Maria Silva", "email": "maria@email.com" }
  }
  ```

- `400` — dados inválidos
- `401` — e-mail ou senha inválidos (mensagem igual nos dois casos, de propósito)

## Usuário logado

### GET /api/usuarios/me

- `200` — `{ "id": 1, "nome": "Maria Silva", "email": "maria@email.com" }`
- `401` — não autenticado

### PUT /api/usuarios/me

Corpo (senha é opcional; se omitida, a senha não muda):

```json
{ "nome": "Maria S. Souza", "email": "maria@email.com", "senha": "novaSenha123" }
```

- `200` — usuário atualizado
- `400` — dados inválidos
- `401` — não autenticado
- `409` — e-mail já usado por outro usuário

## Veículos

Campos:

| Campo | Regra |
|---|---|
| placa | obrigatória, formato antigo (ABC1234) ou Mercosul (ABC1D23); normalizada para maiúsculas, sem hífen; única por usuário |
| marca | obrigatória, mínimo 2 caracteres |
| modelo | obrigatório |
| ano | inteiro entre 1900 e o ano atual + 1 |
| kmAtual | inteiro ≥ 0 (padrão 0) |

### GET /api/veiculos

Parâmetro opcional: `busca` (procura em placa, marca e modelo).

Exemplo: `GET /api/veiculos?busca=onix`

- `200` — lista de veículos do usuário
- `401`

### POST /api/veiculos

```json
{ "placa": "ABC1D23", "marca": "Chevrolet", "modelo": "Onix", "ano": 2020, "kmAtual": 46000 }
```

- `201` — veículo criado
- `400` — dados inválidos
- `401`
- `409` — já existe veículo com essa placa para o usuário

### GET /api/veiculos/:id

- `200` — veículo
- `400` — id inválido
- `401`
- `404` — não encontrado

### PUT /api/veiculos/:id

Mesmo corpo do POST.

- `200` — veículo atualizado
- `400`, `401`, `404`
- `409` — placa já usada em outro veículo do usuário

### DELETE /api/veiculos/:id

- `204` — excluído
- `401`, `404`
- `409` — o veículo possui manutenções (exclua as manutenções antes)

## Manutenções

Campos:

| Campo | Regra |
|---|---|
| veiculoId | obrigatório no POST; o veículo precisa ser do usuário (não muda no PUT) |
| tipo | `TROCA_OLEO`, `FREIOS`, `PNEUS`, `REVISAO` ou `OUTROS` |
| data | aaaa-mm-dd, data existente e não futura |
| km | inteiro ≥ 0 |
| custo | número entre 0 e 99999999.99 |
| oficina | opcional, até 100 caracteres |
| observacoes | opcional, até 1000 caracteres |
| proximaRevisaoKm | opcional, inteiro ≥ km |
| proximaRevisaoData | opcional, aaaa-mm-dd, ≥ data |

### Regras de negócio

- Ao registrar ou editar uma manutenção, o `kmAtual` do veículo passa a ser o maior entre o valor atual e o km da manutenção (o km do veículo nunca diminui). Manutenção e atualização do km acontecem na mesma transação.
- **Regra do km (422):** se a data da manutenção for igual ou posterior à da manutenção mais recente do veículo, o km não pode ser menor que o dela. Manutenções com data anterior (lançamento de histórico) podem ter km menor.
- Excluir uma manutenção não altera o `kmAtual`.

### GET /api/manutencoes

Filtros opcionais (combináveis):

| Parâmetro | Descrição |
|---|---|
| veiculoId | manutenções de um veículo |
| tipo | um dos cinco tipos |
| dataDe / dataAte | período (aaaa-mm-dd) |
| busca | texto em oficina ou observações |

Exemplo: `GET /api/manutencoes?tipo=FREIOS&dataDe=2026-01-01&dataAte=2026-12-31`

Ordenação: mais recentes primeiro. Cada item traz o veículo aninhado.

- `200`, `400` (filtro inválido), `401`

### POST /api/manutencoes

```json
{
  "veiculoId": 1,
  "tipo": "TROCA_OLEO",
  "data": "2026-10-15",
  "km": 46500,
  "custo": 280,
  "oficina": "Auto Center Silva",
  "proximaRevisaoKm": 56500,
  "proximaRevisaoData": "2027-04-15"
}
```

Resposta `201`:

```json
{
  "id": 1,
  "veiculoId": 1,
  "tipo": "TROCA_OLEO",
  "data": "2026-10-15",
  "km": 46500,
  "custo": 280,
  "oficina": "Auto Center Silva",
  "observacoes": null,
  "proximaRevisaoKm": 56500,
  "proximaRevisaoData": "2027-04-15",
  "criadoEm": "2026-10-31 12:00:00",
  "veiculo": { "id": 1, "placa": "ABC1D23", "marca": "Chevrolet", "modelo": "Onix" }
}
```

- `400` — dados inválidos
- `401`
- `404` — veículo não encontrado (ou de outro usuário)
- `422` — km menor que o da última manutenção

### GET /api/manutencoes/:id

- `200`, `400`, `401`, `404`

### PUT /api/manutencoes/:id

Mesmo corpo do POST, sem `veiculoId`.

- `200` — manutenção atualizada
- `400`, `401`, `404`, `422`

### DELETE /api/manutencoes/:id

- `204`, `400`, `401`, `404`

## Relatórios

Os relatórios consideram somente os veículos do usuário logado.

### GET /api/relatorios/gastos-por-veiculo

Filtros opcionais: `veiculoId`, `dataDe`, `dataAte`. Veículos sem manutenção no período aparecem com zero.

```json
{
  "filtros": { "dataDe": "2026-01-01" },
  "totalGeral": 2430,
  "veiculos": [
    { "veiculoId": 1, "placa": "ABC1D23", "marca": "Chevrolet", "modelo": "Onix",
      "quantidade": 3, "totalGasto": 2430 }
  ]
}
```

### GET /api/relatorios/por-tipo

Filtros opcionais: `veiculoId`, `dataDe`, `dataAte`.

```json
{
  "filtros": {},
  "tipos": [
    { "tipo": "PNEUS", "quantidade": 1, "totalGasto": 1200 },
    { "tipo": "TROCA_OLEO", "quantidade": 1, "totalGasto": 280 }
  ]
}
```

### GET /api/relatorios/custo-por-km

Filtros opcionais: `veiculoId`, `dataDe`, `dataAte`.

Custo por km = total gasto ÷ (maior km − menor km lançado no período). Com uma única manutenção não há km rodado e `custoPorKm` é `null`.

```json
{
  "filtros": {},
  "veiculos": [
    { "veiculoId": 1, "placa": "ABC1D23", "marca": "Chevrolet", "modelo": "Onix",
      "totalGasto": 2430, "kmRodado": 16500, "custoPorKm": 0.15 }
  ]
}
```

### GET /api/relatorios/revisoes-pendentes

Filtro opcional: `veiculoId`.

Considera apenas a manutenção mais recente de cada tipo, por veículo, que tenha próxima revisão definida. Está pendente se a `proximaRevisaoData` for hoje ou anterior, ou se o `kmAtual` do veículo for maior ou igual à `proximaRevisaoKm`.

```json
{
  "hoje": "2026-10-31",
  "total": 1,
  "pendentes": [
    {
      "manutencaoId": 3, "veiculoId": 1, "placa": "ABC1D23", "marca": "Chevrolet",
      "modelo": "Onix", "kmAtual": 46500, "tipo": "REVISAO", "data": "2026-01-10",
      "proximaRevisaoKm": null, "proximaRevisaoData": "2026-06-01",
      "motivos": ["Vencida por data (prevista para 2026-06-01)"]
    }
  ]
}
```

## Segurança

- Senhas armazenadas com hash bcrypt (custo 10).
- Autenticação JWT; rotas protegidas respondem 401 sem token válido.
- Consultas SQL parametrizadas (`?`), que previnem SQL injection.
- Validação dos dados de entrada com Zod em todas as rotas de escrita.
- Isolamento por usuário: todas as consultas filtram pelo dono do recurso.
- Segredos somente em variáveis de ambiente (`.env` fora do repositório).
