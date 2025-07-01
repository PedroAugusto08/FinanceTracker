# 📦 CHANGELOG

Todas as mudanças notáveis deste projeto estão documentadas aqui.

O formato segue as convenções de [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e versionamento semântico ([SemVer](https://semver.org/lang/pt-BR/)).

---

## [0.4.0] - 2025-07-01

### Adicionado
- Modal de edição de categoria: permite editar nome e limite, com visual moderno e responsivo (dark mode incluso)
- Badge de limite ao lado do nome da categoria, atualizado em tempo real
- Toast/banner de alerta visual para limite ultrapassado, com cor vermelha destacada
- Botão de logout na aba de configurações (desloga usuário e retorna à tela de login)
- Swipe lateral para troca de abas no mobile

### Alterado
- Atualização imediata da lista de categorias e limites após edição (sem precisar recarregar a página)
- Modal de edição aprimorado para melhor experiência em dark mode e mobile
- Correção de bug de duplicidade ao criar transações

### Corrigido
- Edição de categoria agora reflete imediatamente na interface
- Ajustes de responsividade e contraste no modal de edição

---

## [0.3.0] - 2025-06-27

### Adicionado
- Integração completa com **Firebase Firestore** para persistência de dados (transações, categorias, configurações)
- Autenticação com Google (Firebase Auth)
- Cada usuário acessa apenas seus próprios dados (isolamento por UID)
- CRUD de transações e categorias 100% no Firestore
- Settings (dark mode) salvos no Firestore por usuário
- Interface de login com Google
- Interface de abas responsiva e mobile friendly (Dashboard, Transações, Categorias, Configurações)
- Categorias dinâmicas: adicionar, editar, remover (com bloqueio se em uso)
- Interface reativa: dados atualizados em tempo real via Firestore
- Melhorias de acessibilidade e experiência mobile (swipe lateral, ajuste de abas, etc)
- Ajuste visual para dark mode, contraste e responsividade

### Alterado
- Removido todo uso de `localStorage` para dados financeiros (agora tudo é Firestore)
- Refatoração do fluxo de inicialização: dados só carregam após login/autenticação
- Ajuste no layout das abas para não quebrar ou sair da tela em dispositivos iOS

### Corrigido
- Bugs de carregamento de scripts, ordem de execução e inicialização da interface
- Erros de permissão e regras do Firestore
- Problemas de contraste e visual no dark mode

---

## [0.2.0] - 2025-06-25

### Adicionado
- Filtro por tipo de transação (entrada/saída)
- Filtro por intervalo de datas
- Validação de campos do formulário (descrição obrigatória, valor maior que zero, mensagem de erro)
- Exportação de extrato em PDF (tabela: Data | Descrição | Valor)
- Gráficos de pizza (despesas por categoria) e linha (saldo ao longo do mês)
- Dark mode com toggle e salvamento de preferência
- Responsividade para mobile

---

## [0.1.0] - 2025-06-24

### Adicionado
- Estrutura inicial do projeto (`index.html`, `style.css`, `script.js`)
- Layout base com título, formulário e áreas de saldo
- Integração entre HTML e JS via `script.js`
- Lógica para adicionar e listar transações no DOM
- Cálculo do saldo, entradas e saídas
- Armazenamento local das transações via `localStorage`

## [Unreleased]

### Planejado
- Conectar a carteira do celular pra quando tiver alguma compra no cartão, aparecer o gasto automaticamente no app. Ou integração com banco (estudar)
- Modo empresa
- Controle de gastos (colocar um limite de gastos e avisar quando estiver próximo desse limite)
- Pode exportar o CSV de um período específico. Poder exportar só as entradas ou só as saídas. Total abaixo dos valores mostrando o saldo resultante.
