# 🐾 SalvaPet

[![Deploy Online](https://img.shields.io/badge/Deploy-Online%20no%20Railway-2ecc71?style=for-the-badge&logo=railway&logoColor=white)](https://salvapet-web-production.up.railway.app)
![Status](https://img.shields.io/badge/Status-Em%20Produ%C3%A7%C3%A3o-fad817?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/Licen%C3%A7a-MIT-2ecc71?style=for-the-badge)

Plataforma web full-stack para adoção e doação responsável de animais de estimação. O **SalvaPet** conecta tutores, doadores, ONGs e adotantes em um ambiente intuitivo, facilitando a busca por pets, o contato direto via WhatsApp e o gerenciamento administrativo da plataforma.

---

## 🌐 Acesso Online (Produção)

A aplicação está hospedada e integrada ao banco de dados **MySQL** no **Railway**:

- **🔗 Site Principal:** [https://salvapet-web-production.up.railway.app](https://salvapet-web-production.up.railway.app)

---

## ✨ Funcionalidades

- **Catálogo de Adoção (`/animais`):** Listagem de animais com filtros por nome, raça, espécie (`cachorro`, `gato`, `outro`), porte (`pequeno`, `medio`, `grande`) e sexo (`macho`, `femea`), além de modal de detalhes e botão de contato direto via WhatsApp com o tutor.
- **Cadastro para Doação (`/doar`):** Formulário completo para registrar animais disponíveis para adoção com informações de saúde (vacinado/castrado), localização e foto.
- **Autenticação e Contas (`/login` e `/cadastro`):** Criação de conta e login com perfis de `adotante`, `doador`, `ambos` e `admin`.
- **Painel Administrativo (`/admin`):** Área dedicada para gerenciar (listar, adicionar, editar e excluir) animais e usuários cadastrados, com indicadores em tempo real (KPIs) e busca instantânea.
- **Avaliações da Plataforma (`/avaliar`):** Sistema de avaliação por estrelas (1 a 5), cálculo de média geral e listagem de depoimentos de usuários.
- **Página Institucional e Contato (`/sobre` e `/contato`):** Informações sobre a iniciativa e canal de atendimento.
- **Fallback em Memória:** A API opera integrada ao banco de dados MySQL e conta com fallback automático em memória caso o serviço MySQL local não esteja ativo durante o desenvolvimento.

---

## 🛠️ Tecnologias Utilizadas

- **Front-end:** React 19, React Router DOM 7, TypeScript 6, Vite 8, CSS3
- **Back-end:** Node.js, Express 5, TypeScript (`tsx`)
- **Banco de Dados:** MySQL (`mysql2/promise`)
- **Utilitários:** `dotenv`, `cors`, ESLint

---

## 🚀 Pré-requisitos e Instalação

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v20 ou superior recomendado)
- [MySQL](https://www.mysql.com/) (v8.0 ou superior — opcional para testes graças ao fallback em memória)
- [Git](https://git-scm.com/)

### 1. Clonar o repositório
```bash
git clone https://github.com/RalffXP/SalvaPet.git
cd SalvaPet
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar o Banco de Dados (MySQL)
Execute o script SQL localizado em `database/schema.sql` no seu servidor MySQL para criar o banco `salvapet`, as tabelas (`usuarios`, `animais`, `avaliacoes`, `mensagens`) e os dados iniciais:

```bash
mysql -u root -p < database/schema.sql
```

### 4. Configurar as Variáveis de Ambiente
Verifique ou edite o arquivo `src/Back Ends/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=salvapet
```

---

## 💻 Como Usar

Para executar o projeto completo em ambiente de desenvolvimento, inicie o **Back-end** e o **Front-end** em dois terminais separados:

### Terminal 1 — Iniciar a API (Back-end)
```bash
npm run server
```
> A API ficará disponível em `http://localhost:3000`.

### Terminal 2 — Iniciar a Interface (Front-end)
```bash
npm run dev
```
> A aplicação web ficará disponível em `http://localhost:5173`.

### Outros scripts disponíveis
| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite (Front-end) |
| `npm run server` | Inicia o servidor Express com hot-reload via `tsx` (Back-end) |
| `npm run build` | Compila o TypeScript e gera o bundle de produção na pasta `dist/` |
| `npm run preview` | Visualiza localmente a versão de produção gerada pelo build |
| `npm run lint` | Executa a verificação estática de código com ESLint |

---

## 🔌 Principais Endpoints da API

Base URL: `http://localhost:3000`

### Animais
- `GET /api/animais` — Lista todos os animais (suporta query params: `especie`, `porte`, `sexo`, `cidade`, `status`, `busca`)
- `GET /api/animais/:id` — Retorna os detalhes de um animal específico
- `POST /api/animais` — Cadastra um novo animal
- `PUT /api/animais/:id` — Atualiza os dados ou status de um animal
- `DELETE /api/animais/:id` — Remove um animal

### Usuários e Autenticação
- `POST /api/login` — Autentica um usuário (`email` e `senha`)
- `GET /api/usuarios` — Lista todos os usuários cadastrados
- `GET /api/usuarios/:id` — Busca um usuário pelo ID
- `POST /api/usuarios` — Cadastra um novo usuário
- `PUT /api/usuarios/:id` — Atualiza os dados de um usuário
- `DELETE /api/usuarios/:id` — Remove um usuário

### Avaliações, Mensagens e Estatísticas
- `GET /api/avaliacoes` — Lista as avaliações da plataforma
- `POST /api/avaliacoes` — Registra uma nova avaliação (`nota` de 1 a 5 e `comentario`)
- `GET /api/avaliacoes/media` — Retorna a média e o total de avaliações
- `POST /api/mensagens` — Envia mensagem entre usuários
- `GET /api/mensagens/:usuario_id` — Lista mensagens enviadas/recebidas por um usuário
- `GET /api/estatisticas` — Retorna contadores de animais disponíveis, adotados e usuários cadastrados

---

## 📂 Estrutura de Pastas

```text
SalvaPet/
├── database/
│   └── schema.sql                # Script de criação do banco MySQL e dados iniciais
├── public/
│   ├── favicon.svg               # Ícone da aplicação
│   ├── icons.svg                 # Ícones públicos
│   └── log.png                   # Logotipo do SalvaPet
├── src/
│   ├── assets/                   # Imagens e recursos estáticos
│   ├── Back Ends/
│   │   ├── .env                  # Variáveis de ambiente da API e banco de dados
│   │   ├── database.ts           # Configuração do pool de conexão MySQL
│   │   └── serve.ts              # Servidor Express e rotas da API REST
│   ├── Componetes/
│   │   └── pages/
│   │       ├── Footer/           # Componente de rodapé (footer.tsx / footer.css)
│   │       ├── Header/           # Componente de cabeçalho e navegação (header.tsx / header.css)
│   │       ├── Admin.tsx         # Painel administrativo (CRUD de animais e usuários)
│   │       ├── Animais.tsx       # Catálogo de adoção com filtros e modal de contato
│   │       ├── Avaliar.tsx       # Página de avaliações e comentários
│   │       ├── Contato.tsx       # Página de contato
│   │       ├── Doar.tsx          # Formulário de cadastro de animais para doação
│   │       ├── Home.tsx          # Página inicial com destaques e estatísticas
│   │       ├── Login.tsx         # Tela de login e criação de conta
│   │       └── Sobre.tsx         # Página institucional
│   ├── App.tsx                   # Layout base da aplicação
│   ├── index.css                 # Design system e estilos globais
│   └── main.tsx                  # Ponto de entrada e configuração de rotas (React Router)
├── index.html                    # HTML principal
├── package.json                  # Dependências e scripts NPM
├── tsconfig.json                 # Configuração do TypeScript
└── vite.config.ts                # Configuração do Vite
```

---

## 🤝 Contribuição e Licença

### Como contribuir
1. Faça um **Fork** deste repositório.
2. Crie uma branch para sua feature ou correção:
   ```bash
   git checkout -b feature/minha-melhoria
   ```
3. Faça o commit das suas alterações seguindo boas práticas:
   ```bash
   git commit -m "feat: descrição da melhoria"
   ```
4. Envie para o seu repositório remoto:
   ```bash
   git push origin feature/minha-melhoria
   ```
5. Abra um **Pull Request**.

Link para o site: https://salvapet-web-production.up.railway.app/

### Licença
Este projeto está sob a licença **[MIT](https://opensource.org/licenses/MIT)**.
