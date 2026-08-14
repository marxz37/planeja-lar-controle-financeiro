# Planeja Lar

Aplicativo de planejamento financeiro familiar.  


## Estrutura do projeto

```
PlanejaLar
├── index.html          ← Ponto de entrada
├── assets/
│   ├── logo.png
│   └── favicon.png
├── css/
│   └── style.css       ← Todo o CSS 
└── js/
    ├── storage.js      ← localStorage: Auth, Members, Incomes, Expenses, Cards...
    ├── ui.js           ← Toast, Modal, SVGCharts, helpers visuais
    ├── router.js       ← SPA router + ícones SVG + layout
    ├── app.js          ← Bootstrap da aplicação
    └── pages/
        ├── auth.js         ← Login / Criar conta / Selecionar perfil
        ├── dashboard.js    ← Dashboard com resumo e gráficos
        ├── incomes.js      ← Ganhos
        ├── expenses.js     ← Gastos variáveis + Despesas fixas
        └── other-pages.js  ← Cartões, Investimentos, Metas, Categorias,
                               Relatórios, Insights
```


## Onde os dados ficam salvos

Tudo no `localStorage` do navegador:

| Chave | Conteúdo |
|---|---|
| `planejaLar.auth` | Usuário logado |
| `planejaLar.members` | Membros da família |
| `planejaLar.incomes` | Receitas |
| `planejaLar.expenses` | Gastos |
| `planejaLar.cards` | Cartões de crédito |
| `planejaLar.investments` | Investimentos |
| `planejaLar.goals` | Metas |
| `planejaLar.fixedExpenses` | Despesas fixas |
| `planejaLar.paidInvoices` | Faturas pagas |
| `planejaLar.leisureSubcategories` | Categorias de lazer |


## Tecnologias

- **HTML5** — estrutura
- **CSS3** — estilização (variáveis CSS, grid, flexbox, dark mode)
- **JavaScript ES6+** — lógica, roteamento, persistência
- **localStorage** — armazenamento de dados
- **SVG inline** — gráficos sem bibliotecas externas