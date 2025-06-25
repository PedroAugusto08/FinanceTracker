# 📦 CHANGELOG

Todas as mudanças notáveis deste projeto estão documentadas aqui.

O formato segue as convenções de [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e versionamento semântico ([SemVer](https://semver.org/lang/pt-BR/)).

---

## [0.1.0] - 2025-06-24

### Adicionado
- Estrutura inicial do projeto (`index.html`, `style.css`, `script.js`)
- Layout base com título, formulário e áreas de saldo
- Integração entre HTML e JS via `script.js`
- Lógica para adicionar e listar transações no DOM
- Cálculo do saldo, entradas e saídas
- Armazenamento local das transações via `localStorage`

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

## [Unreleased]

### Planejado
- Conectar a carteira do celular pra quando tiver alguma compra no cartão, aparecer o gasto automaticamente no app. Ou integração com banco (estudar)
- Modo empresa
- Controle de gastos (colocar um limite de gastos e avisar quando estiver próximo desse limite)
- Pode exportar o CSV de um período específico. Poder exportar só as entradas ou só as saídas. Total abaixo dos valores mostrando o saldo resultante.
