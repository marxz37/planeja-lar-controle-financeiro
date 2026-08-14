# Especificações Do Projeto

Esta seção define o escopo do aplicativo financeiro, alinhando as necessidades dos usuários ao comportamento técnico do sistema. Para estruturar o projeto, utilizamos as seguintes ferramentas:

Personas: Perfis que representam nossos usuários ideais para guiar as decisões de design.

Histórias de Usuários: Mapeamento de necessidades sob a perspectiva do usuário (quem, o que e por que).

Proposta de Valor: O diferencial do app, focado em simplicidade e educação financeira.

Requisitos (RF e RNF): O que o sistema deve fazer (Funcionais) e as suas exigências técnicas de qualidade e desempenho (Não Funcionais).

Restrições: Limites do projeto, como prazos e limitações de arquitetura.

## Persona 1
Nome: Beatriz Helena Santos

Sexo: Feminino

Idade: 45 anos

Classe Social: B2 (Classe Média)

Nacionalidade: Brasileira

Localização: Curitiba, PR (ou uma metrópole de clima ameno)

Escolaridade: Ensino Superior Completo em Administração

Perfil: Gerente de loja, metódica e "mão na massa". É a personificação da organização, embora sua busca por perfeição soe como autoritarismo para alguns.

Estilo de Vida: Equilibra o estresse do varejo com o foco do Pilates e a paciência do Tricô. Valoriza a rotina e o controle.

Consumo: Não busca o mais barato, busca o melhor investimento. É sensível ao custo-benefício e exige qualidade técnica e durabilidade. Odeia ineficiência.

Motivação: Segurança (casa própria) e recompensa pelo esforço (viagem ao exterior).

Valores: Trabalho duro, ordem e planejamento financeiro.

Resumo: Beatriz é uma gerente de loja de 45 anos. Ela tem um perfil bastante organizado, metódico e cuidadoso (embora seja descrita como um pouco "mandona"). Seus maiores sonhos são comprar uma casa e viajar para o exterior, e ela equilibra sua rotina com aulas de pilates e tricô.

![Persona 1](/docs/images/persona1.png)

![Historia](/docs/images/Historia%20Beatriz.png)

## Persona 2
Nome: Carla Roberta Silva

Sexo: Feminino

Idade: 21 anos

Classe Social: C2 / D (Classe Média Baixa)

Nacionalidade: Brasileira

Localização: Periferia de uma grande capital (ex: São Paulo ou Rio de Janeiro)

Escolaridade: Ensino Médio Completo (estudando para o ENEM/Vestibular)

Perfil: Operadora de caixa, resiliente e madura precocemente. É a "guerreira" que encara a realidade de frente, movida por um forte senso de responsabilidade e persistência.

Estilo de Vida: Rotina exaustiva entre trabalho, cuidados com o filho e estudos. Enfrenta a ansiedade financeira com foco no futuro. O cinema é seu refúgio para relaxar e sonhar.

Consumo: Extremamente sensível a preço. Cada gasto é planejado para não faltar o essencial. Busca produtos que ofereçam durabilidade e facilidade de pagamento (parcelamento).

Motivação: Ascensão social através da faculdade e a segurança de ter um carro para dar conforto ao filho.

Valores: Solidariedade, esforço próprio e, acima de tudo, o bem-estar da família.

Resumo: Carla é uma jovem de 21 anos que trabalha como operadora de caixa. Por ter precisado amadurecer rápido, ela desenvolveu um forte senso de responsabilidade e persistência, sendo o tipo de pessoa que não desiste fácil diante das dificuldades. Apesar de se mostrar um pouco ansiosa em relação ao dinheiro e ao seu futuro, ela tem um bom coração e gosta de ajudar os outros quando pode. Seus grandes sonhos são voltados para a construção de uma vida melhor: ela deseja entrar para a faculdade, comprar um carro e, o mais importante, dar um bom futuro para o seu filho. Para relaxar, seu hobby favorito é o cinema.

![Persona 2](/docs/images/persona2.png)

![Historia](/docs/images/Historia%20Carla.png)

## Persona 3
Nome: Roberto Alves

Sexo: Masculino

Idade: 28 anos

Classe Social: C1 (Classe Média)

Nacionalidade: Brasileiro

Localização: Centro Urbano / Comercial

Escolaridade: Ensino Médio Completo / Técnico em Gestão ou áreas correlatas

Perfil: MEI determinado e focado em resultados. É a praticidade em pessoa, mas vive no limite do estresse devido às obrigações do negócio.

Estilo de Vida: Rotina intensa dedicada ao crescimento da sua empresa. Usa o futebol como sua principal válvula de escape para descompressão mental.

Consumo: Analisa compras sob a ótica da utilidade e eficiência. Prioriza serviços que tragam agilidade ou estabilidade financeira.

Motivação: Escalar o próprio negócio e proporcionar conforto e segurança para a sua família.

Valores: Pragmatismo, ética de trabalho e cuidado com os seus.

Resumo: Roberto é um Microempreendedor Individual (MEI) de 28 anos. Ele tem uma personalidade muito prática, determinada e responsável, mas que acaba ficando um pouco estressado devido ao peso das obrigações do dia a dia. Seus grandes sonhos giram em torno do seu negócio e de seus entes queridos: ele quer fazer sua empresa crescer, alcançar a estabilidade financeira, ajudar a família e, consequentemente, garantir uma vida mais confortável. Nos momentos de lazer, para desestressar, o seu hobby favorito é assistir futebol.

![Persona 3](/docs/images/persona3.png)

![Historia](/docs/images/Historia%20Roberto.png)

## Persona 4
Nome: Gustavo Moreira

Sexo: Masculino

Idade: 19 anos

Classe Social: C1 / B2 (Classe Média)

Nacionalidade: Brasileiro

Localização: Região Universitária (mora em república ou divide apartamento)

Escolaridade: Graduando (Estudante Universitário)

Resumo: Gustavo é um jovem estagiário de 19 anos. Ele tem uma personalidade bastante descontraída, sociável e independente, mas reconhece que é um pouco desorganizado no dia a dia. Seus maiores sonhos estão focados na construção da sua independência: ele deseja se formar na faculdade, conseguir um bom emprego, alcançar a estabilidade financeira e, futuramente, morar sozinho (já que hoje divide apartamento). Nas horas vagas, ele divide seus hobbies entre jogar online e sair com os amigos.

![Persona 4](/docs/images/persona4.png)

![Historia](/docs/images/Historia%20Gustavo.png)

## Histórias de Usuários

| EU COMO... `PERSONA`    | QUERO/PRECISO ... `FUNCIONALIDADE`              |   PARA ... `MOTIVO/VALOR` |
| :--- | :--- | :--- |
| **Beatriz**  | Sincronizar contas via *Open Finance*              | Economizar tempo e evitar erros de digitação manual.                |
| **Beatriz**  | Criar "Metas" com prazos (Ex: Viagem)              | Acompanhar o progresso dos meus investimentos de longo prazo.       |
| **Beatriz**  | Compartilhar o painel financeiro com a família     | Gerar transparência e dividir a responsabilidade das contas.        |
| **Carla**    | Visualizar o orçamento sem palavras técnicas       | Entender as finanças de forma simples.                              |
| **Carla**    | Definir limites de gastos por categoria            | Garantir que o dinheiro não acabe antes de comprar o essencial.     |
| **Carla**    | Acessar mapa de ONGs e Cestas Básicas              | Ter uma rede de apoio rápido em momentos de crise financeira.       |
| **Roberto**  | Separar saldo "Pessoal" do "Empresa"               | Ter clareza sobre o lucro real do negócio e organizar o pró-labore. |
| **Roberto**  | Receber alertas de contas a vencer (Push/WhatsApp) | Evitar o pagamento de multas e juros por esquecimento.              |
| **Gustavo**  | Criar uma "Vaquinha" para divisão de contas        | Organizar os gastos da república/apartamento sem conflitos.         |
| **Gustavo**  | Configurar alertas para gastos por impulso         | Controlar o orçamento e evitar excessos com jogos e delivery.       |

## Proposta de Valor

A proposta de valor descreve um aplicativo de controle financeiro familiar focado em simplicidade e acessibilidade, criado para ajudar pessoas que não têm muito conhecimento sobre finanças.

![Proposta de Valor](images/PROPOSTA%20DE%20VALOR.png)

![Proposta de Valor](images/PROPOSTA%20DE%20VALOR%202.png)

## Requisitos

As tabelas que se seguem apresentam os requisitos funcionais e não funcionais que detalham o escopo do projeto.

### Requisitos Funcionais (RF)

| ID | Descrição do Requisito | Prioridade |
| :--- | :--- | :--- |
| **RF-001** | O sistema deve permitir o cadastro, autenticação (login) e gerenciamento do perfil de usuário. | ALTA |
| **RF-002** | O sistema deve possuir um fluxo de recuperação de senha via e-mail cadastrado. | ALTA |
| **RF-003** | O sistema deve permitir que o usuário exclua permanentemente sua conta e apague todos os seus dados (adequação à LGPD). | ALTA |
| **RF-004** | O sistema deve permitir o cadastro, edição e exclusão manual de receitas e despesas. | ALTA |
| **RF-005** | O sistema deve permitir que o usuário marque uma despesa como "recorrente" para lançamento automático nos meses seguintes. | ALTA |
| **RF-006** | O sistema deve apresentar um painel principal (Dashboard) simplificado, exibindo o saldo atual e resumos financeiros. | ALTA |
| **RF-007** | O sistema deve permitir que o usuário defina limites mensais de gastos separados por categorias. | ALTA |
| **RF-008** | O sistema deve exibir alertas visuais quando os gastos de uma categoria atingirem 80% e 100% do limite. | ALTA |
| **RF-009** | O sistema deve alertar o usuário sobre as datas de vencimento próximas de contas fixas cadastradas. | ALTA |
| **RF-010** | O sistema deve exibir uma tela de confirmação ("Barreira de Impulso") ao registrar gastos em categorias de risco marcadas pelo usuário. | MÉDIA |
| **RF-011** | O sistema deve possuir a funcionalidade "Vaquinha Compartilhada" para registrar e dividir contas entre usuários. | MÉDIA |
| **RF-012** | O sistema deve exibir um histórico visual de "Ofensiva" (streak), contabilizando os dias consecutivos em que o usuário cumpriu suas metas ou não ultrapassou limites. | MÉDIA |
| **RF-013** | O sistema deve permitir a criação de "Metas" com prazos definidos para acompanhamento de economias. | MÉDIA |
| **RF-014** | O sistema deve permitir a criação de carteiras separadas (ex: "Pessoal" e "Empresa") para organizar diferentes fontes de renda. | MÉDIA |
| **RF-015** | O sistema deve permitir a exportação de um relatório mensal básico de receitas e despesas em formato PDF ou Excel. | MÉDIA |
| **RF-016** | O sistema deve permitir o compartilhamento do painel financeiro com outros usuários, com permissão apenas de visualização. | MÉDIA |
| **RF-017** | O sistema deve disponibilizar um mapa ou lista com endereços de ONGs parceiras e pontos de distribuição de cestas básicas. | BAIXA |

---

### Requisitos Não Funcionais (RNF)

| ID | Descrição do Requisito | Prioridade |
| :--- | :--- | :--- |
| **RNF-001** | O sistema deve ser responsivo, adaptando-se para uso em navegadores web e telas de dispositivos móveis. | ALTA |
| **RNF-002** | O sistema deve proteger os dados e senhas dos usuários utilizando criptografia no banco de dados. | ALTA |
| **RNF-003** | O sistema deve atualizar o saldo exibido no painel em no máximo 3 segundos após o cadastro de uma nova transação. | MÉDIA |
| **RNF-004** | A interface do usuário (UI) deve possuir alto contraste e botões com áreas de toque adequadas, focando em acessibilidade. | MÉDIA |
| **RNF-005** | O aplicativo deve garantir que o registro de uma nova despesa exija no máximo 3 cliques a partir da tela inicial. | MÉDIA |

## Restrições

O projeto está restrito pelos itens apresentados na tabela a seguir.

|ID| Restrição                                             |
|--|-------------------------------------------------------|
|01| O projeto deverá ser entregue até o final do semestre |
|02| Não pode ser desenvolvido um módulo de backend        |
|03| O projeto não utilizará integrações automáticas com APIs bancárias reais |
|04| limitando-se à inserção e simulação manual dos dados pelo usuário. |