import Papa from 'papaparse';

Papa.parse('/dados_concurso_iss_rj.csv', {
  download: true,
  header: true,
  delimiter: ";",
  encoding: "UTF-8",
  complete: function(results) {
    // Imprime os dados brutos no console do navegador (F12) para auditoria
    console.log("Dados extraídos:", results.data);
    // Filtra linhas vazias
    const dados = results.data.filter(row => row.NOME); 
    
    // Processamento de métricas
    const total = dados.length;
    const emExercicio = dados.filter(d => d.SITUACAO === 'EM EXERCÍCIO').length;
    const evasoes = total - emExercicio;

    // Renderização das estatísticas
    document.getElementById('estatisticas').innerHTML = `
      <p><strong>Total de Convocados:</strong> ${total}</p>
      <p><strong>Em Exercício:</strong> ${emExercicio}</p>
      <p><strong>Evasões/Exonerações:</strong> ${evasoes}</p>
    `;

    // Renderização dos dados na tabela
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