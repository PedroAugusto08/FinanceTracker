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
    const btnMostrarEntradas = document.getElementById('btn-mostrar-entradas');
    const btnMostrarSaidas = document.getElementById('btn-mostrar-saidas');
    const btnMostrarTodas = document.getElementById('btn-mostrar-todas');

    // Mensagem de erro
    let erroDiv = document.getElementById('erro-form');
    if (!erroDiv) {
        erroDiv = document.createElement('div');
        erroDiv.id = 'erro-form';
        erroDiv.style.display = 'none';
        form.insertAdjacentElement('afterend', erroDiv);
    }

    let transacoes = [];
    let filtro = 'todas'; // 'todas', 'entrada', 'saida'

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

    // Renderizar lista com filtro
    function renderizarTransacoes() {
        listaTransacoes.innerHTML = '';
        let transacoesFiltradas = transacoes;
        if (filtro === 'entrada') {
            transacoesFiltradas = transacoes.filter(t => t.tipo === 'entrada');
        } else if (filtro === 'saida') {
            transacoesFiltradas = transacoes.filter(t => t.tipo === 'saida');
        }
        transacoesFiltradas.forEach((t, idx) => {
            // O índice pode mudar no filtro, então precisamos do índice real na lista original
            const idxReal = transacoes.indexOf(t);
            const li = document.createElement('li');
            li.className = t.tipo === 'entrada' ? 'transacao-entrada' : 'transacao-saida';
            li.innerHTML = `
                <span>${t.descricao} - <strong>${t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
                <button class="btn-remover" data-idx="${idxReal}">Remover</button>
            `;
            listaTransacoes.appendChild(li);
        });
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
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const descricao = descricaoInput.value.trim();
        const valor = parseFloat(valorInput.value);
        const tipo = tipoInput.value;
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

    // Inicialização
    carregarTransacoes();
    atualizarTotais();
    renderizarTransacoes();
});
