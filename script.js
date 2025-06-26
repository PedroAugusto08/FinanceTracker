// script.js
import { loginWithGoogle } from './auth.js';
import { db } from './firebase-config.js';
import { auth } from './auth.js';
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

console.log("Testando script.js");

// --- Código principal executado diretamente, sem DOMContentLoaded ---
const form = document.getElementById('form-transacao');
const descricaoInput = document.getElementById('descricao');
const valorInput = document.getElementById('valor');
const tipoInput = document.getElementById('tipo');
const listaTransacoes = document.getElementById('lista-transacoes');
const saldoSpan = document.getElementById('saldo');
const entradasSpan = document.getElementById('entradas');
const saidasSpan = document.getElementById('saidas');
const btnMostrarEntradas = document.getElementById('btn-mostrar-entradas');
const btnMostrarSaidas = document.getElementById('btn-mostrar-saidas');
const btnMostrarTodas = document.getElementById('btn-mostrar-todas');
const dataInicioInput = document.getElementById('data-inicio');
const dataFimInput = document.getElementById('data-fim');
const selectOrdenarPor = document.getElementById('ordenar-por');
const selectOrdem = document.getElementById('ordem');

// Mensagem de erro
let erroDiv = document.getElementById('erro-form');
if (!erroDiv) {
    erroDiv = document.createElement('div');
    erroDiv.id = 'erro-form';
    erroDiv.style.display = 'none';
    form.insertAdjacentElement('afterend', erroDiv);
}

let transacoes = [];
let categorias = [];
let filtro = 'todas'; // 'todas', 'entrada', 'saida'
let pieChart, lineChart;
let usuarioAtual = null;

// --- FIRESTORE HELPERS ---
function getUserId() {
  return auth.currentUser ? auth.currentUser.uid : null;
}
function userCollection(nome) {
  const uid = getUserId();
  if (!uid) throw new Error('Usuário não autenticado');
  return collection(db, `users/${uid}/${nome}`);
}
function userDoc(nome, id) {
  const uid = getUserId();
  if (!uid) throw new Error('Usuário não autenticado');
  return doc(db, `users/${uid}/${nome}/${id}`);
}

// --- CRUD FIRESTORE ---
let unsubscribeTransacoes = null;
let unsubscribeCategorias = null;

function listenCategoriasFirestore() {
  if (unsubscribeCategorias) unsubscribeCategorias();
  unsubscribeCategorias = onSnapshot(userCollection('categorias'), (snap) => {
    categorias = snap.docs.map(doc => doc.data().nome);
    atualizarSelectCategorias();
    renderizarCategorias();
  });
}
function listenTransacoesFirestore() {
  if (unsubscribeTransacoes) unsubscribeTransacoes();
  unsubscribeTransacoes = onSnapshot(userCollection('transacoes'), (snap) => {
    transacoes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    atualizarTotais();
    renderizarTransacoes();
  });
}

async function carregarCategoriasFirestore() {
  const col = userCollection('categorias');
  const snap = await getDocs(col);
  categorias = snap.docs.map(doc => doc.data().nome);
  if (categorias.length === 0) {
    // categorias padrão
    categorias = ['Alimentação', 'Transporte', 'Lazer', 'Salário', 'Outros'];
    await Promise.all(categorias.map(nome => addDoc(col, { nome })));
  }
}
async function salvarCategoriaFirestore(nome) {
  await addDoc(userCollection('categorias'), { nome });
}
async function removerCategoriaFirestore(nome) {
  const col = userCollection('categorias');
  const q = query(col, where('nome', '==', nome));
  const snap = await getDocs(q);
  for (const d of snap.docs) await deleteDoc(d.ref);
}
async function editarCategoriaFirestore(nomeAntigo, nomeNovo) {
  const col = userCollection('categorias');
  const q = query(col, where('nome', '==', nomeAntigo));
  const snap = await getDocs(q);
  for (const d of snap.docs) await updateDoc(d.ref, { nome: nomeNovo });
  // Atualiza nas transações
  const transCol = userCollection('transacoes');
  const tq = query(transCol, where('categoria', '==', nomeAntigo));
  const tsnap = await getDocs(tq);
  for (const t of tsnap.docs) await updateDoc(t.ref, { categoria: nomeNovo });
}
async function carregarTransacoesFirestore() {
  const col = userCollection('transacoes');
  const snap = await getDocs(col);
  transacoes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
async function salvarTransacaoFirestore(transacao) {
  // Remove campo categoria se vazio ou undefined
  const t = { ...transacao };
  if (!t.categoria) delete t.categoria;
  await addDoc(userCollection('transacoes'), t);
}
async function removerTransacaoFirestore(id) {
  await deleteDoc(userDoc('transacoes', id));
}

// --- SETTINGS (dark mode) ---
async function carregarSettingsFirestore() {
  const uid = getUserId();
  if (!uid) return {};
  const ref = doc(db, `users/${uid}/settings/darkmode`);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}
async function salvarSettingsFirestore({ darkMode }) {
  const uid = getUserId();
  if (!uid) return;
  const ref = doc(db, `users/${uid}/settings/darkmode`);
  await setDoc(ref, { darkMode });
}

// --- CATEGORIAS ---
// Referências DOM das categorias
const formCategoria = document.getElementById('form-categoria');
const nomeCategoriaInput = document.getElementById('nome-categoria');
const listaCategorias = document.getElementById('lista-categorias');
// Referência ao select de tipo já existente no HTML
const tipoInputLocal = document.getElementById('tipo');
// Garante que o select de categoria exista e esteja após o tipo
let selectCategoria = document.getElementById('categoria');
if (!selectCategoria) {
    selectCategoria = document.createElement('select');
    selectCategoria.id = 'categoria';
    tipoInputLocal.insertAdjacentElement('afterend', selectCategoria);
}

// Carregar categorias do Firestore
async function carregarCategorias() {
    await carregarCategoriasFirestore();
    atualizarSelectCategorias();
    renderizarCategorias();
    atualizarSelectCategorias();
}

// Atualiza o gráfico de pizza de despesas por categoria
function atualizarPieChart() {
    const ctx = document.getElementById('pie-categorias').getContext('2d');
    // Agrupa saídas por categoria, e cada saída sem categoria aparece individualmente
    const categoriasDespesas = {};
    transacoes.forEach(t => {
        if (t.tipo === 'saida') {
            if (t.categoria) {
                categoriasDespesas[t.categoria] = (categoriasDespesas[t.categoria] || 0) + t.valor;
            } else {
                // Cada transação sem categoria vira uma fatia individual
                const label = `${t.descricao} (SC)`;
                categoriasDespesas[label] = (categoriasDespesas[label] || 0) + t.valor;
            }
        }
    });
    const labels = Object.keys(categoriasDespesas);
    const data = Object.values(categoriasDespesas);
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: [
                    '#e74c3c','#f39c12','#8e44ad','#16a085','#2980b9','#2ecc71','#d35400','#7f8c8d','#c0392b','#27ae60',
                    '#b2becd','#fdcb6e','#00b894','#636e72','#fd79a8','#00cec9','#6c5ce7','#fab1a0','#e17055','#0984e3'
                ]
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Atualiza o gráfico de linha do saldo ao longo do mês
function atualizarLineChart() {
    const ctx = document.getElementById('line-saldo').getContext('2d');
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    const diaHoje = hoje.getDate();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    let saldoAcumulado = 0;
    const saldoPorDia = Array(diasNoMes).fill(null); // null para dias futuros
    const transacoesMes = transacoes.filter(t => {
        if (!t.data) return false;
        const d = new Date(t.data);
        return d.getFullYear() === ano && d.getMonth() === mes;
    }).sort((a, b) => new Date(a.data) - new Date(b.data));
    let idxTransacao = 0;
    for (let dia = 1; dia <= diaHoje; dia++) {
        while (
            idxTransacao < transacoesMes.length &&
            new Date(transacoesMes[idxTransacao].data).getDate() === dia
        ) {
            const t = transacoesMes[idxTransacao];
            saldoAcumulado += t.tipo === 'entrada' ? t.valor : -t.valor;
            idxTransacao++;
        }
        saldoPorDia[dia - 1] = saldoAcumulado;
    }
    const labels = Array.from({length: diasNoMes}, (_, i) => (i+1).toString());
    if (lineChart) lineChart.destroy();
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Saldo (R$)',
                data: saldoPorDia,
                fill: false,
                borderColor: '#2ecc71',
                backgroundColor: '#2ecc71',
                tension: 0.2,
                spanGaps: true
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value != null ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';
                        }
                    }
                }
            }
        }
    });
}

// Atualizar totais
function atualizarTotais() {
    let entradas = 0, saidas = 0;
    transacoes.forEach(t => {
        if (t.tipo === 'entrada') {
            entradas += t.valor;
        } else {
            saidas += t.valor;
        }
    });
    const saldo = entradas - saidas;
    saldoSpan.textContent = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    entradasSpan.textContent = entradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    saidasSpan.textContent = saidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para filtrar por data
function filtrarPorData(lista) {
    let inicio = dataInicioInput.value;
    let fim = dataFimInput.value;
    if (!inicio && !fim) return lista;
    return lista.filter(t => {
        if (!t.data) return true; // compatibilidade
        const dataT = t.data.split('T')[0];
        if (inicio && dataT < inicio) return false;
        if (fim && dataT > fim) return false;
        return true;
    });
}

// Utilitário: extrair categoria da descrição (exemplo simples)
function extrairCategoria(descricao) {
    // Se quiser, pode melhorar para regex ou dropdown de categorias
    // Aqui, considera a primeira palavra como categoria
    return descricao.split(' ')[0].toLowerCase();
}

// Atualiza o select de categorias
function atualizarSelectCategorias() {
  selectCategoria.innerHTML = '';
  const optVazio = document.createElement('option');
  optVazio.value = '';
  optVazio.textContent = 'Sem categoria';
  selectCategoria.appendChild(optVazio);
  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    selectCategoria.appendChild(opt);
  });
}

// Renderizar lista com filtro e ordenação
async function renderizarTransacoes() {
    listaTransacoes.innerHTML = '';
    let transacoesFiltradas = transacoes;
    if (filtro === 'entrada') {
        transacoesFiltradas = transacoes.filter(t => t.tipo === 'entrada');
    } else if (filtro === 'saida') {
        transacoesFiltradas = transacoes.filter(t => t.tipo === 'saida');
    }
    transacoesFiltradas = filtrarPorData(transacoesFiltradas);
    // Ordenação
    const ordenarPor = selectOrdenarPor.value;
    const ordem = selectOrdem.value;
    transacoesFiltradas = [...transacoesFiltradas].sort((a, b) => {
        if (ordenarPor === 'data') {
            const dA = a.data ? new Date(a.data) : new Date(0);
            const dB = b.data ? new Date(b.data) : new Date(0);
            return ordem === 'asc' ? dA - dB : dB - dA;
        } else if (ordenarPor === 'valor') {
            return ordem === 'asc' ? a.valor - b.valor : b.valor - a.valor;
        }
        return 0;
    });
    transacoesFiltradas.forEach((t, idx) => {
        const idxReal = transacoes.indexOf(t);
        const li = document.createElement('li');
        li.className = t.tipo === 'entrada' ? 'transacao-entrada' : 'transacao-saida';
        const dataFormatada = t.data ? new Date(t.data).toLocaleDateString('pt-BR') : '';
        li.innerHTML = `
            <span>${t.descricao} <span style='color:#888;'>[${t.categoria||''}]</span> - <strong>${t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> <small style='color:#888;'>${dataFormatada}</small></span>
            <button class="btn-remover" data-idx="${idxReal}">Remover</button>
        `;
        listaTransacoes.appendChild(li);
    });
    atualizarPieChart();
    atualizarLineChart();
}

// Exibir mensagem de erro temporária
function mostrarErro(msg) {
    erroDiv.textContent = msg;
    erroDiv.style.display = 'block';
    erroDiv.className = 'erro-form';
    setTimeout(() => {
        erroDiv.style.display = 'none';
    }, 2500);
}

// Adicionar transação
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const descricao = descricaoInput.value.trim();
    const valor = parseFloat(valorInput.value);
    const tipo = tipoInputLocal.value;
    const categoria = selectCategoria.value;
    if (!descricao) {
        mostrarErro('A descrição não pode ficar vazia.');
        descricaoInput.focus();
        return;
    }
    if (isNaN(valor) || valor <= 0) {
        mostrarErro('O valor deve ser maior que zero.');
        valorInput.focus();
        return;
    }
    const data = new Date().toISOString();
    await salvarTransacaoFirestore({ descricao, valor, tipo, categoria: categoria || undefined, data });
    await carregarTransacoesFirestore();
    atualizarTotais();
    renderizarTransacoes();
    form.reset();
    descricaoInput.focus();
    atualizarSelectCategorias();
});

// Remover transação
listaTransacoes.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-remover')) {
        const idx = e.target.getAttribute('data-idx');
        const trans = transacoes[idx];
        if (trans && trans.id) {
            await removerTransacaoFirestore(trans.id);
            await carregarTransacoesFirestore();
            atualizarTotais();
            renderizarTransacoes();
        }
    }
});

// Filtros
btnMostrarEntradas.addEventListener('click', () => {
    filtro = 'entrada';
    renderizarTransacoes();
});
btnMostrarSaidas.addEventListener('click', () => {
    filtro = 'saida';
    renderizarTransacoes();
});
btnMostrarTodas.addEventListener('click', () => {
    filtro = 'todas';
    renderizarTransacoes();
});
dataInicioInput.addEventListener('change', () => {
    // Impede que o fim seja menor que o início
    if (dataFimInput.value && dataFimInput.value < dataInicioInput.value) {
        dataFimInput.value = dataInicioInput.value;
    }
    dataFimInput.min = dataInicioInput.value;
    renderizarTransacoes();
});
dataFimInput.addEventListener('change', () => {
    // Impede que o fim seja menor que o início
    if (dataFimInput.value && dataInicioInput.value && dataFimInput.value < dataInicioInput.value) {
        dataFimInput.value = dataInicioInput.value;
    }
    renderizarTransacoes();
});
// Atualiza lista ao mudar ordenação
selectOrdenarPor.addEventListener('change', renderizarTransacoes);
selectOrdem.addEventListener('change', renderizarTransacoes);

// Garante IDs únicos para toggle-darkmode e btn-exportar-csv
// Remove duplicatas antes de adicionar listeners
const allToggles = document.querySelectorAll('#toggle-darkmode');
const allExports = document.querySelectorAll('#btn-exportar-csv');
if (allToggles.length > 1) {
    for (let i = 0; i < allToggles.length - 1; i++) {
        allToggles[i].parentNode.removeChild(allToggles[i]);
    }
}
if (allExports.length > 1) {
    for (let i = 0; i < allExports.length - 1; i++) {
        allExports[i].parentNode.removeChild(allExports[i]);
    }
}

// Dark mode toggle (agora na aba de configurações)
const toggleDark = document.getElementById('toggle-darkmode');
async function setDarkMode(ativo) {
  if (ativo) {
    document.body.classList.add('dark-mode');
    await salvarSettingsFirestore({ darkMode: 'on' });
  } else {
    document.body.classList.remove('dark-mode');
    await salvarSettingsFirestore({ darkMode: 'off' });
  }
}
if (toggleDark) {
    toggleDark.addEventListener('change', (e) => {
        setDarkMode(e.target.checked);
    });
}

// Exportar extrato (agora na aba de configurações)
const btnExportar = document.getElementById('btn-exportar-csv');
if (btnExportar) {
    btnExportar.addEventListener('click', () => {
        if (!transacoes.length) {
            mostrarErro('Não há transações para exportar.');
            return;
        }
        // Gera HTML da tabela
        const header = ['Data', 'Descrição', 'Valor'];
        const linhas = transacoes.map(t => [
            t.data ? new Date(t.data).toLocaleDateString('pt-BR') : '',
            (t.descricao || '').replace(/\|/g, ' '),
            (t.tipo === 'saida' ? '-' : '+') + ' R$ ' + Number(t.valor).toLocaleString('pt-BR', {minimumFractionDigits:2})
        ]);
        let html = `<html><head><meta charset='utf-8'><title>Extrato Financeiro</title>
        <style>
        body { font-family: Arial, sans-serif; margin: 32px; }
        h2 { text-align: center; }
        table { border-collapse: collapse; width: 100%; margin-top: 24px; }
        th, td { border: 1px solid #bbb; padding: 8px 12px; text-align: left; font-size: 1em; }
        th { background: #f4f6f8; }
        tr:nth-child(even) { background: #f9f9f9; }
        </style></head><body>`;
        html += `<h2>Extrato Financeiro</h2>`;
        html += `<table><thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>`;
        linhas.forEach(l => {
            html += `<tr>${l.map(v=>`<td>${v}</td>`).join('')}</tr>`;
        });
        html += `</tbody></table></body></html>`;
        // Abre janela de impressão para PDF
        const win = window.open('', '', 'width=900,height=700');
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 500);
    });
}

// Tabs
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        tab.classList.add('active');
        const id = tab.getAttribute('data-tab');
        document.getElementById(id).classList.add('active');
    });
});

// Swipe lateral para troca de abas no mobile
let touchStartX = null;
let touchEndX = null;
const minSwipeDist = 60; // px
document.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
    }
});
document.addEventListener('touchend', function(e) {
    if (touchStartX === null) return;
    touchEndX = e.changedTouches[0].clientX;
    const dist = touchEndX - touchStartX;
    if (Math.abs(dist) > minSwipeDist) {
        // Descobre aba atual
        const tabsArr = Array.from(document.querySelectorAll('.tab'));
        const activeIdx = tabsArr.findIndex(tab => tab.classList.contains('active'));
        let nextIdx = activeIdx;
        if (dist < 0 && activeIdx < tabsArr.length - 1) {
            nextIdx = activeIdx + 1;
        } else if (dist > 0 && activeIdx > 0) {
            nextIdx = activeIdx - 1;
        }
        if (nextIdx !== activeIdx) {
            tabsArr[nextIdx].click();
        }
    }
    touchStartX = null;
    touchEndX = null;
});

// Login Google
const btnLoginGoogle = document.getElementById('btn-login-google');
if (btnLoginGoogle) {
    btnLoginGoogle.addEventListener('click', () => {
        console.log('Clique no botão de login detectado');
        loginWithGoogle();
    });
}

// --- INICIALIZAÇÃO REATIVA ---
async function loadData() {
  usuarioAtual = auth.currentUser;
  if (!usuarioAtual) return;
  listenCategoriasFirestore();
  listenTransacoesFirestore();
  // Dark mode
  const settings = await carregarSettingsFirestore();
  if (settings.darkMode === 'on') {
    toggleDark.checked = true;
    document.body.classList.add('dark-mode');
  } else {
    toggleDark.checked = false;
    document.body.classList.remove('dark-mode');
  }
}
window.loadData = loadData;

// --- CATEGORIAS ---
function renderizarCategorias() {
  listaCategorias.innerHTML = '';
  categorias.forEach((cat, idx) => {
    const li = document.createElement('li');
    li.style = 'display:flex; align-items:center; justify-content:space-between; background:#f8fafb; border-radius:8px; margin-bottom:8px; padding:8px 12px;';
    li.innerHTML = `
      <span>${cat}</span>
      <span>
        <button class="btn-editar-categoria" data-idx="${idx}" style="margin-right:8px; background:#2980b9; color:#fff; border:none; border-radius:6px; padding:4px 10px; cursor:pointer;">Editar</button>
        <button class="btn-remover-categoria" data-idx="${idx}" style="background:#e74c3c; color:#fff; border:none; border-radius:6px; padding:4px 10px; cursor:pointer;">Remover</button>
      </span>
    `;
    listaCategorias.appendChild(li);
  });
}
