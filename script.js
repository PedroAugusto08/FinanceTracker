// script.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-transacao');
    const descricaoInput = document.getElementById('descricao');
    const valorInput = document.getElementById('valor');
    const tipoInput = document.getElementById('tipo');
    const listaTransacoes = document.getElementById('lista-transacoes');
    const saldoSpan = document.getElementById('saldo');
    const entradasSpan = document.getElementById('entradas');
    const saidasSpan = document.getElementById('saidas');

    let transacoes = [];

    // Carregar do localStorage
    function carregarTransacoes() {
        const dados = localStorage.getItem('transacoes');
        if (dados) {
            transacoes = JSON.parse(dados);
        }
    }

    // Salvar no localStorage
    function salvarTransacoes() {
        localStorage.setItem('transacoes', JSON.stringify(transacoes));
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

    // Renderizar lista
    function renderizarTransacoes() {
        listaTransacoes.innerHTML = '';
        transacoes.forEach((t, idx) => {
            const li = document.createElement('li');
            li.className = t.tipo === 'entrada' ? 'transacao-entrada' : 'transacao-saida';
            li.innerHTML = `
                <span>${t.descricao} - <strong>${t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
                <button class="btn-remover" data-idx="${idx}">Remover</button>
            `;
            listaTransacoes.appendChild(li);
        });
    }

    // Adicionar transação
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const descricao = descricaoInput.value.trim();
        const valor = parseFloat(valorInput.value);
        const tipo = tipoInput.value;
        if (!descricao || isNaN(valor) || valor <= 0) return;
        transacoes.push({ descricao, valor, tipo });
        salvarTransacoes();
        atualizarTotais();
        renderizarTransacoes();
        form.reset();
        descricaoInput.focus();
    });

    // Remover transação
    listaTransacoes.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remover')) {
            const idx = e.target.getAttribute('data-idx');
            transacoes.splice(idx, 1);
            salvarTransacoes();
            atualizarTotais();
            renderizarTransacoes();
        }
    });

    // Inicialização
    carregarTransacoes();
    atualizarTotais();
    renderizarTransacoes();
});
