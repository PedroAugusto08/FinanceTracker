# 💰 Finance Tracker

Aplicativo web moderno de controle financeiro pessoal, desenvolvido com **HTML**, **CSS** e **JavaScript** puro, agora com persistência de dados e autenticação via **Firebase**.

> 🎯 Projeto pessoal com foco em aprendizado, organização e evolução incremental.

---

## 📸 Preview

> *(Adicionar aqui uma captura de tela)*

---

## 🚀 Funcionalidades

- [x] **Autenticação Google** (Firebase Auth)
- [x] **Persistência de dados no Firebase Firestore** (transações, categorias, configurações)
- [x] Cada usuário acessa apenas seus próprios dados (isolamento por UID)
- [x] CRUD de transações e categorias 100% no Firestore
- [x] Settings (dark mode) salvos no Firestore por usuário
- [x] Interface de login com Google
- [x] Interface de abas responsiva e mobile friendly (Dashboard, Transações, Categorias, Configurações)
- [x] Categorias dinâmicas: adicionar, editar (modal), remover (com bloqueio se em uso)
- [x] Modal de edição de categoria (nome e limite), visual moderno e responsivo (dark mode incluso)
- [x] Badge de limite ao lado do nome da categoria, atualizado em tempo real
- [x] Toast/banner de alerta visual para limite ultrapassado, com cor vermelha destacada
- [x] Botão de logout na aba de configurações (desloga usuário e retorna à tela de login)
- [x] Interface reativa: dados atualizados em tempo real via Firestore
- [x] Adicionar receitas e despesas
- [x] Exibir saldo, total de entradas e saídas
- [x] Listar transações
- [x] Remover transações
- [x] Filtros por tipo de transação (entrada/saída)
- [x] Filtro por intervalo de datas
- [x] Validação de campos do formulário (mensagem de erro)
- [x] Exportação de extrato em PDF (tabela: Data | Descrição | Valor)
- [x] Gráficos de pizza (despesas por categoria) e linha (saldo ao longo do mês)
- [x] Dark mode com toggle (persistente por usuário)
- [x] Responsividade para mobile
- [x] Swipe lateral para troca de abas no mobile

---

## 📁 Estrutura do projeto

├── index.html # Estrutura da página  
├── style.css # Estilização da interface  
├── script.js # Lógica de funcionamento  
├── firebase-config.js # Configuração do Firebase  
├── auth.js # Lógica de autenticação Google  
└── CHANGELOG.md # Histórico de mudanças  

---

## 🛠️ Tecnologias usadas

- HTML5
- CSS3
- JavaScript
- [Firebase](https://firebase.google.com/) (Auth + Firestore)

---

## ▶️ Como usar
Acesse: [FinanceTracker](https://pedroaugusto08.github.io/FinanceTracker/)

- Faça login com sua conta Google
- Adicione, edite e remova transações e categorias
- Visualize gráficos e exporte extrato

---

## 📌 Objetivo
Este projeto faz parte do meu aprendizado como estudante de Engenharia da Computação (CEFET-MG), com foco no desenvolvimento de projetos práticos usando tecnologias web fundamentais e integração com serviços modernos. Estou buscando me desafiar cada vez mais, criando ideias e dando vida para elas através do código.

## Autor

**Pedro Augusto Moura**  
[![Static Badge](https://img.shields.io/badge/%7C%20PedroAugusto08-black?style=flat-square&logo=github)](https://github.com/PedroAugusto08)
[![Static Badge](https://img.shields.io/badge/%7C%20pedroaugustomoura70927%40gmail.com-black?style=flat-square&logo=gmail)](mailto:pedroaugustomoura70927@gmail.com)
[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/pedroagmoura)