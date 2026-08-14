# Planeja Lar — Controle Financeiro Familiar

Aplicação acadêmica de planejamento financeiro familiar criada para centralizar receitas, despesas, cartões, metas e investimentos em uma interface web responsiva.

## Funcionalidades

- Criação de conta, login e seleção de perfil familiar
- Dashboard com resumo financeiro e gráficos
- Cadastro de receitas, despesas e gastos fixos
- Controle de cartões, faturas e compras parceladas
- Organização de investimentos, reservas e metas
- Categorias personalizadas e análise pela regra 50/30/20
- Relatórios e insights financeiros
- Persistência local dos dados no navegador
- Interface responsiva e modo escuro

## Tecnologias

- HTML5
- CSS3
- JavaScript modular
- Web Storage API (`localStorage`)
- Gráficos e componentes visuais em SVG

## Como executar

Abra `src/index.html` em um navegador moderno. Para evitar restrições do navegador a módulos locais, também é possível servir a pasta `src` com uma extensão como Live Server.

## Estrutura do projeto

```text
.
├── docs/          # Documentação acadêmica e planejamento
├── src/           # Código-fonte da aplicação
│   ├── css/
│   ├── js/
│   └── index.html
└── CITATION.cff
```

## Contexto acadêmico e créditos

O Planeja Lar foi desenvolvido em equipe durante a graduação. Esta publicação pessoal reconhece a autoria dos participantes e mantém o vínculo com o trabalho acadêmico original, disponível no repositório da [PUC Minas](https://github.com/ICEI-PUC-Minas-PSG-ADS-TI/psg-ads-2026-1-p1-tiawfe-244101-controlefinanceiro).

Participantes identificados na documentação acadêmica: Marx Bento Dumbá, Caíque Souza, Hugo Faria, Izabelle Lopes, Lorrayne Santos e Tarsis Augustus.

## Observação de segurança

A autenticação e a persistência são demonstrativas e funcionam no navegador. Para uso em produção, os dados e as credenciais devem ser processados em um back-end com controles adequados de segurança.
