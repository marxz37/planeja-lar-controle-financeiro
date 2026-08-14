# Projeto da Solução

## Tecnologias Utilizadas

O PlanejaLar foi desenvolvido como uma **Single Page Application (SPA)** totalmente client-side, sem necessidade de backend ou servidor. As tecnologias utilizadas foram:

| Tecnologia | Papel no Projeto |
|---|---|
| **HTML5** | Estrutura semântica da aplicação (`index.html` único como ponto de entrada da SPA) |
| **CSS3** | Estilização completa: variáveis CSS customizadas, Flexbox, Grid Layout, media queries para responsividade, transições e animações, suporte a tema claro/escuro |
| **JavaScript ES6+** | Toda a lógica da aplicação: roteamento SPA, CRUD de dados, manipulação do DOM, modais, gráficos, validações, gerenciamento de estado |
| **localStorage** | Persistência de todos os dados do usuário no navegador, com isolamento por conta (email) |
| **SVG inline** | Gráficos interativos (pizza, barras, linha) renderizados via JavaScript sem bibliotecas externas |
| **jsPDF** | Geração de relatórios em PDF diretamente no navegador (via CDN) |
| **Google Fonts (Inter)** | Tipografia moderna e profissional para toda a interface |

### Interação do Usuário com o Sistema

O fluxo de interação segue o padrão SPA:

1. O usuário acessa o `index.html` — ponto de entrada único da aplicação.
2. O **Router** (`router.js`) gerencia a navegação entre páginas sem recarregar o navegador, exibindo/ocultando seções do DOM.
3. As ações do usuário (cadastrar receita, adicionar gasto, etc.) são processadas pelo JavaScript e persistidas no **localStorage** através dos módulos de armazenamento (`storage.js`).
4. A interface é atualizada dinamicamente pelo módulo de UI (`ui.js`), que controla toasts, modais, gráficos SVG e animações.
5. Os dados ficam disponíveis offline e são isolados por conta de usuário.

## Arquitetura da Solução

A arquitetura do PlanejaLar segue o padrão **MVC simplificado** no lado do cliente:

```
┌─────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Client-Side)               │
│                                                          │
│  ┌──────────┐    ┌───────────┐    ┌───────────────────┐  │
│  │ index.html│───▶│  Router   │───▶│   Pages (Views)   │  │
│  │ (entrada) │    │ router.js │    │  auth.js          │  │
│  └──────────┘    └─────┬─────┘    │  dashboard.js     │  │
│                        │          │  incomes.js        │  │
│  ┌──────────┐    ┌─────▼─────┐   │  expenses.js      │  │
│  │ style.css │    │    UI     │   │  other-pages.js   │  │
│  │ (Temas)   │    │   ui.js   │   │  home.js          │  │
│  └──────────┘    └─────┬─────┘   └───────────────────┘  │
│                        │                                  │
│                  ┌─────▼─────┐                           │
│                  │  Storage   │                           │
│                  │ storage.js │                           │
│                  └─────┬─────┘                           │
│                        │                                  │
│                  ┌─────▼─────┐                           │
│                  │localStorage│                           │
│                  └───────────┘                           │
└─────────────────────────────────────────────────────────┘
```

![Arquitetura da Solução](/docs/images/Arquitetura_da_Solução.jpg)

### Módulos do Sistema

| Módulo | Arquivo | Responsabilidade |
|---|---|---|
| **Storage** | `js/storage.js` | Camada de dados: CRUD de todas as entidades (Auth, Members, Incomes, Expenses, Cards, Investments, Goals, FixedExpenses), utilitários de formatação, exportação/importação JSON |
| **UI** | `js/ui.js` | Componentes visuais: Toast (notificações), Modal (diálogos), SVGCharts (gráficos de pizza, barra e linha), busca global (Ctrl+K), central de notificações, FAB (botão flutuante) |
| **Router** | `js/router.js` | Roteamento SPA: navegação entre páginas, proteção de rotas (autenticação), layout do sidebar/topbar, atalhos de teclado, ícones SVG |
| **App** | `js/app.js` | Bootstrap: inicialização do tema, montagem do layout, controle de hambúrguer mobile, navegação inicial |
| **Auth** | `js/pages/auth.js` | Autenticação: Login, Cadastro, Recuperação de Senha, Seleção de Perfil, Gerenciamento de Membros da Família |
| **Dashboard** | `js/pages/dashboard.js` | Painel principal: resumo financeiro, score de saúde financeira (regra 50/30/20), gráficos, metas, dicas |
| **Incomes** | `js/pages/incomes.js` | Gestão de receitas: CRUD, marcar como recebido/pendente, filtro por pesquisa |
| **Expenses** | `js/pages/expenses.js` | Gestão de gastos: variáveis e fixos, parcelamento com cartão de crédito, categorias, detecção de despesas recorrentes |
| **Other Pages** | `js/pages/other-pages.js` | Cartões de crédito, Investimentos, Metas financeiras, Categorias de lazer, Relatórios com gráficos e comparação mensal, geração de PDF |
| **Home** | `js/pages/home.js` | Landing page pré-autenticação com apresentação do produto |

---

# Interface do Sistema

## Tela Principal do Sistema

A tela principal é a **Landing Page** (`home.js`), que é exibida quando o usuário acessa a aplicação sem estar autenticado. Ela apresenta o PlanejaLar com uma proposta visual moderna, contendo seções sobre funcionalidades, benefícios e botões de chamada para ação (Login/Cadastro). A página utiliza um design com gradientes, ícones SVG e animações suaves.

## Tela de Autenticação (RF-001, RF-002)

O sistema possui três fluxos de autenticação:
- **Login**: Formulário com email e senha para acesso à conta existente.
- **Cadastro**: Criação de nova conta com validação de email duplicado e confirmação de senha.
- **Recuperação de Senha**: Fluxo para redefinir a senha utilizando o email cadastrado.

Após a autenticação, o usuário é direcionado para a **Seleção de Perfil**, onde pode criar ou selecionar um membro da família (com nome, emoji/foto e cor personalizada).

## Dashboard (RF-006, RF-008)

O painel principal exibe:
- **Cards de resumo**: Receita recebida, Total de gastos, Saldo, Cartões (fatura), Gastos fixos — com animação count-up.
- **Score de Saúde Financeira**: Indicador visual baseado na regra 50/30/20 (necessidades/desejos/poupança), com feedback textual.
- **Gráfico de pizza**: Distribuição dos gastos por categoria (Crédito, Débito, Lazer, Investimento, Outros).
- **Metas do mês**: Barras de progresso para cada meta definida.
- **Resumo dos cartões**: Uso do limite de cada cartão com barra de progresso.
- **FinAI — Análise do Mês**: Insights automáticos comparando com o mês anterior, alertas e dicas financeiras diárias.
- **Ofensiva (Streak)**: Banner mostrando dias consecutivos de uso do aplicativo (RF-012).

## Ganhos / Receitas (RF-004)

Permite o cadastro, edição e exclusão de receitas com:
- Fonte/descrição, valor, data prevista, integrante responsável.
- Toggle para marcar como "Recebido" ou "Pendente".
- Cards de resumo: Total Recebido, A Receber, Total do Mês.
- Pesquisa/filtro por nome ou valor.

## Gastos / Despesas (RF-004, RF-005, RF-007)

Dividido em abas:
- **Gastos Variáveis**: CRUD completo com categoria, método de pagamento (débito, crédito, PIX), subcategoria de lazer, suporte a parcelamento no cartão de crédito.
- **Despesas Fixas**: Cadastro de contas recorrentes (aluguel, internet, etc.) com dia de vencimento e controle de pagamento mensal (RF-005).
- **Investimentos**: Registro de aportes com tipo, valor, data e rentabilidade.

Funcionalidades especiais:
- Detecção automática de gastos recorrentes com sugestão de transformar em despesa fixa.
- Cálculo automático de parcelas com distribuição entre meses (calcInvoiceMonth).

## Cartões de Crédito (RF-014)

Visualização de cada cartão com:
- Design visual de "cartão de crédito" com informações de fatura, limite disponível, parcelas futuras.
- Barra de progresso de uso do limite com alerta visual para uso acima de 80%.
- Botões para ver gastos detalhados e pagar fatura.
- Dia de fechamento e dia de vencimento.

## Metas Financeiras (RF-013)

Quatro categorias de metas:
- **Poupança**: Meta de economia mensal (sugerido 20% da renda).
- **Lazer**: Limite de gastos com entretenimento (sugerido 10%).
- **Crédito**: Limite de gastos no cartão (sugerido 30%).
- **Investimentos**: Meta de aportes mensais (sugerido 15%).

Inclui botão "Metas Automáticas" que calcula automaticamente baseado na renda do mês.

## Categorias de Lazer

Gerenciamento de subcategorias de gastos com lazer:
- Categorias padrão: Rolê/Bar, Viagem, Uber, Jogos, Restaurante, Cinema, etc.
- Criação de categorias personalizadas com nome, emoji e cor.
- Gráficos de distribuição (pizza e barras) dos gastos por subcategoria.

## Relatórios (RF-015)

Análise financeira dos últimos 6 ou 12 meses:
- **Gráfico de linha**: Receitas vs Gastos ao longo do tempo.
- **Cards mensais**: Resumo detalhado de cada mês (receita, gastos, saldo).
- **Comparação de dois meses**: Seletor para comparar indicadores entre meses específicos.
- **Exportação em PDF**: Geração de relatório com resumo financeiro via jsPDF (RF-015).

## Funcionalidades Transversais

- **Busca Global (Ctrl+K)**: Pesquisa em todas as receitas e despesas com navegação direta para o item encontrado (RF-010).
- **Central de Notificações**: Alertas sobre limite de cartão acima de 90%, despesas fixas pendentes e metas atingidas (RF-008, RF-009).
- **FAB (Floating Action Button)**: Botão flutuante para adicionar rapidamente receitas ou despesas de qualquer página (RNF-005).
- **Tema Claro/Escuro**: Alternância de tema com persistência no localStorage.
- **Exportar/Importar JSON**: Backup completo dos dados em formato JSON.
- **Responsividade**: Layout adaptativo com sidebar colapsável e hambúrguer para mobile (RNF-001).
- **Atalhos de Teclado**: Navegação rápida entre páginas (D=Dashboard, G=Ganhos, E=Gastos, etc.).

## Estruturas de Dados

Os dados são persistidos no `localStorage` do navegador, isolados por conta de usuário. As principais estruturas são:

### Usuário (`planejaLar.auth`)

```json
{
  "id": "user-email@example.com",
  "email": "email@example.com"
}
```

### Membro da Família (`planejaLar.members`)

```json
[
  {
    "id": "1719766800000-abc1234",
    "name": "João",
    "emoji": "👨",
    "color": "#0d9488",
    "photo": "data:image/...",
    "isDefault": true,
    "streak": 5,
    "lastActiveDate": "2026-06-30"
  }
]
```

### Receita (`planejaLar.incomes`)

```json
[
  {
    "id": "1719766800000-xyz5678",
    "source": "Salário",
    "amount": 3500.00,
    "expectedDate": "2026-06-05",
    "received": true,
    "month": "2026-06",
    "memberId": "1719766800000-abc1234"
  }
]
```

### Despesa (`planejaLar.expenses`)

```json
[
  {
    "id": "1719766800000-def9012",
    "description": "Supermercado",
    "amount": 450.00,
    "category": "debit",
    "subcategory": null,
    "paymentMethod": "debit",
    "date": "2026-06-10",
    "cardId": null,
    "isInstallment": false,
    "installments": null,
    "installmentNumber": null,
    "totalAmount": null,
    "month": "2026-06",
    "paid": false,
    "memberId": "1719766800000-abc1234"
  }
]
```

### Cartão de Crédito (`planejaLar.cards`)

```json
[
  {
    "id": "1719766800000-ghi3456",
    "name": "Nubank",
    "limit": 5000.00,
    "closingDay": 15,
    "dueDay": 22
  }
]
```

### Meta Financeira (`planejaLar.goals`)

```json
[
  {
    "id": "1719766800000-jkl7890",
    "category": "savings",
    "target": 700.00,
    "month": "2026-06",
    "autoMode": true
  }
]
```

### Despesa Fixa (`planejaLar.fixedExpenses`)

```json
[
  {
    "id": "1719766800000-mno1234",
    "name": "Aluguel",
    "amount": 1200.00,
    "billingDay": 5,
    "category": "housing",
    "paymentMethod": "pix",
    "cardId": null,
    "isActive": true
  }
]
```

### Investimento (`planejaLar.investments`)

```json
[
  {
    "id": "1719766800000-pqr5678",
    "type": "CDB",
    "amount": 1000.00,
    "date": "2026-06-01",
    "profitability": 12.5,
    "month": "2026-06"
  }
]
```

## Módulos e APIs

### Frameworks e Bibliotecas

| Módulo/Biblioteca | Versão | Uso |
|---|---|---|
| **jsPDF** | 2.5.1 (via CDN) | Geração de relatórios PDF no navegador |
| **Google Fonts (Inter)** | — | Tipografia da interface |

### APIs do Navegador

| API | Uso |
|---|---|
| **localStorage API** | Persistência de todos os dados do usuário |
| **URL.createObjectURL** | Download de arquivos (exportação JSON e PDF) |
| **FileReader API** | Importação de dados via arquivo JSON |
| **requestAnimationFrame** | Animações suaves (count-up de valores) |
| **Navigator.serviceWorker** | Limpeza de service workers antigos |
| **Blob API** | Criação de arquivos para download |
