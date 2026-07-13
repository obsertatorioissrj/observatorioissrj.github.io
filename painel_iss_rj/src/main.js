import Papa from 'papaparse';

Papa.parse('/dados_concurso_iss_rj.csv', {
  download: true,
  header: true,
  delimiter: ";",
  encoding: "UTF-8",
  complete: function(results) {
    const dados = results.data.filter(row => row.NOME); 
    
    // Processamento das métricas
    const emExercicio = dados.filter(d => d.SITUACAO === 'EM EXERCÍCIO').length;
    const exonerados = dados.filter(d => d.SITUACAO === 'EXONERADO').length;
    const desistencia = dados.filter(d => d.SITUACAO === 'DESISTENTE').length;
    
    const totalNomeados = emExercicio + exonerados;
    const vagasImediatas = 50;

    // 1. Bloco Termômetro
    const percentualTermometro = Math.min((totalNomeados / vagasImediatas) * 100, 100);
    const barraFill = document.getElementById('termometro-fill');
    barraFill.style.width = `${percentualTermometro}%`;
    barraFill.innerText = `${totalNomeados} / ${vagasImediatas}`;

    // Cálculo do tempo decorrido
    const dataHomologacao = new Date('2023-11-29T00:00:00');
    const dataAtual = new Date();
    const diasDecorridos = Math.floor((dataAtual - dataHomologacao) / (1000 * 60 * 60 * 24));
    document.getElementById('texto-dias').innerText = `após ${diasDecorridos} dias da homologação do concurso, contando a homologação do concurso do dia 29 de novembro de 2023.`;

    // 2. Bloco Gráfico de Pizza
    const percentualExonerados = totalNomeados > 0 ? (exonerados / totalNomeados) * 100 : 0;
    const graficoPizza = document.getElementById('grafico-pizza');
    // Desenha a fatia vermelha proporcional aos exonerados e o restante em cinza escuro
    graficoPizza.style.background = `conic-gradient(var(--accent-red) 0% ${percentualExonerados}%, #333 ${percentualExonerados}% 100%)`;
    document.getElementById('texto-exonerados').innerText = `${exonerados} dos ${totalNomeados} nomeados já deixaram o órgão.`;

    // 3. Bloco Desistências
    document.getElementById('numero-desistencia').innerText = desistencia;
    document.getElementById('texto-desistencia').innerText = `${desistencia} foram nomeados e preferiram outros cargos.`;

    // 4. Renderização da Tabela
    const tbody = document.getElementById('corpo-tabela');
    dados.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.POSICAO_CONCURSO}</td>
        <td>${row.NOME}</td>
        <td>${row.SITUACAO}</td>
        <td>${row.DATA_NOMEACAO || '-'}</td>
        <td>${row.DATA_EXONERACAO || '-'}</td>
      `;
      tbody.appendChild(tr);
    });
  }
});