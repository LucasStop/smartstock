# SmartStock

Sistema de gerenciamento inteligente de estoque construído com **React + Vite**.

## Funcionalidades

- **Autenticação** com login, cadastro e recuperação de senha (persistência em `localStorage`)
- **Dashboard** com KPIs reativos, gráfico dos últimos 7 dias e alertas de estoque baixo
- **CRUD completo** de Produtos, Categorias, Fornecedores e Usuários
- **Movimentações** (Entrada, Saída, Ajuste) que atualizam o estoque em tempo real
- **Validação de CNPJ** (dígitos verificadores) e máscaras para CNPJ e telefone
- **Exportação CSV** de Produtos e Estoque
- **Controle de acesso** por perfil (Admin/Usuário) com rotas protegidas
- **Toasts**, modais animados, busca, filtros e paginação

## Stack

- React 18
- React Router DOM 6
- Vite 5
- CSS puro (tema escuro customizado)

## Como rodar

```bash
npm install
npm run dev
```

O projeto abrirá em `http://localhost:5173`.

## Credenciais de demo

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin  | ana@smartstock.com | admin123 |
| Usuário | carlos@smartstock.com | user123 |

## Estrutura

```
src/
├── components/      # Sidebar, Modal, ProtectedRoute, Toasts
├── context/         # AuthContext, DataContext
├── data/            # Dados semente iniciais
├── pages/           # Login, Dashboard, Produtos, Categorias, etc.
├── utils/           # Ícones, storage, formatação, validação
├── App.jsx          # Roteamento principal
├── main.jsx         # Entry point
└── styles.css       # Tema global
```

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — preview do build
