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
    let filtro = 'todas'; // 'todas', 'entrada', 'saida'
    let pieChart, lineChart;

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

    // Atualiza o gráfico de pizza de despesas por categoria
    function atualizarPieChart() {
        const ctx = document.getElementById('pie-categorias').getContext('2d');
        // Agrupa saídas por categoria
        const categorias = {};
        transacoes.forEach(t => {
            if (t.tipo === 'saida') {
                const cat = extrairCategoria(t.descricao) || 'Outros';
                categorias[cat] = (categorias[cat] || 0) + t.valor;
            }
        });
        const labels = Object.keys(categorias);
        const data = Object.values(categorias);
        if (pieChart) pieChart.destroy();
        pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: [
                        '#e74c3c','#f39c12','#8e44ad','#16a085','#2980b9','#2ecc71','#d35400','#7f8c8d','#c0392b','#27ae60'
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

    // Renderizar lista com filtro e ordenação
    function renderizarTransacoes() {
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
                <span>${t.descricao} - <strong>${t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> <small style='color:#888;'>${dataFormatada}</small></span>
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
        const data = new Date().toISOString();
        transacoes.push({ descricao, valor, tipo, data });
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

    // Dark mode toggle
    const toggleDark = document.getElementById('toggle-darkmode');
    // Salva preferência no localStorage
    function setDarkMode(ativo) {
        if (ativo) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'on');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'off');
        }
    }
    toggleDark.addEventListener('change', (e) => {
        setDarkMode(e.target.checked);
    });
    // Carrega preferência ao abrir
    if (localStorage.getItem('darkMode') === 'on') {
        toggleDark.checked = true;
        setDarkMode(true);
    }

    // Exportar extrato estilo banco em PDF (tabela)
    document.getElementById('btn-exportar-csv').addEventListener('click', () => {
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

    // Inicialização
    carregarTransacoes();
    atualizarTotais();
    renderizarTransacoes();
});
