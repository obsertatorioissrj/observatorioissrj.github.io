import Papa from 'papaparse';

Papa.parse('/dados_concurso_iss_rj.csv', {
  download: true,
  header: true,
  delimiter: ",",
  encoding: "UTF-8",
  complete: function(results) {
    const dados = results.data.filter(row => row.NOME); 
    
    // Processamento das métricas
    const emExercicio = dados.filter(d => d.SITUACAO === 'EM EXERCÍCIO').length;
    const exonerados = dados.filter(d => d.SITUACAO === 'EXONERADO').length;
    const desistencia = dados.filter(d => d.SITUACAO === 'DESISTENTE').length;
    
    const nomeados = emExercicio + exonerados + desistencia;
    const liquidoNomeados = emExercicio + exonerados;
    const vagasImediatas = 50;

    // 1. Bloco Termômetro Principal
    const percentualTermometro = Math.min((liquidoNomeados / vagasImediatas) * 100, 100);
    const barraFill = document.getElementById('termometro-fill');
    if (barraFill) {
      barraFill.style.width = `${percentualTermometro}%`;
      barraFill.innerText = `${liquidoNomeados} / ${vagasImediatas}`;
    }

    // 1.1 Bloco Auditores em Exercício vs Nomeações
    const percentualExercicio = nomeados > 0 ? (emExercicio / nomeados) * 100 : 0;
    const barraExercicioFill = document.getElementById('barra-exercicio-fill');
    if (barraExercicioFill) {
      barraExercicioFill.style.width = `${percentualExercicio}%`;
      barraExercicioFill.innerText = `${emExercicio} / ${nomeados}`;
    }

    // Cálculo do tempo decorrido
    const dataHomologacao = new Date('2023-11-29T00:00:00');
    const dataAtual = new Date();
    const diasDecorridos = Math.floor((dataAtual - dataHomologacao) / (1000 * 60 * 60 * 24));
    const textoDias = document.getElementById('texto-dias');
    if (textoDias) textoDias.innerText = `Panorama após ${diasDecorridos} dias da homologação do concurso`;

    // 2. Bloco Gráfico de Pizza (Evasão com Legenda e Números)
    if (nomeados > 0) {
      // Cálculo das porcentagens de preenchimento
      const percExercicio = (emExercicio / nomeados) * 100;
      const percExonerados = (exonerados / nomeados) * 100;
      
      const p1 = percExercicio;
      const p2 = p1 + percExonerados;

      const graficoEvasao = document.getElementById('grafico-evasao');
      if (graficoEvasao) {
        graficoEvasao.style.background = `conic-gradient(var(--accent-yellow) 0% ${p1}%, var(--accent-red) ${p1}% ${p2}%, #555 ${p2}% 100%)`;

        // Função trigonométrica para posicionar os números no centro das fatias
        const raioPosicionamento = 45; // Distância do centro do círculo
        const centroCirculo = 75; // Ponto central em pixels (metade de 150px)
        
const posicionarRotulo = (id, valorAbsoluto, percInicial, percFinal) => {
          const rotulo = document.getElementById(id);
          if (!rotulo) return;
          if (valorAbsoluto === 0) {
            rotulo.style.display = 'none';
            return;
          }
          
          rotulo.innerText = valorAbsoluto;
          rotulo.style.display = 'block';
          
          // Mapeia o ângulo (-90 graus alinha o grau 0 ao topo)
          const percMedio = percInicial + (percFinal - percInicial) / 2;
          const anguloGraus = (percMedio / 100) * 360 - 90; 
          const anguloRadianos = anguloGraus * (Math.PI / 180);

          // Posição percentual (Centro = 50%, Raio da distância = 35%)
          const raioPorcentagem = 35; 
          const posicaoX = 50 + raioPorcentagem * Math.cos(anguloRadianos);
          const posicaoY = 50 + raioPorcentagem * Math.sin(anguloRadianos);

          rotulo.style.left = `${posicaoX}%`;
          rotulo.style.top = `${posicaoY}%`;
        };


      }
    }

    // 3. Bloco Desistências
    const numDesistencia = document.getElementById('numero-desistencia');
    const txtDesistencia = document.getElementById('texto-desistencia');
    if (numDesistencia) numDesistencia.innerText = desistencia;
    if (txtDesistencia) txtDesistencia.innerText = `${desistencia} foram nomeados e preferiram outros cargos.`;

    // 4. Renderização da Tabela
    const tbody = document.getElementById('corpo-tabela');
    if (tbody) {
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

    // Controle de expansão da tabela
    const btnToggle = document.getElementById('btn-toggle-tabela');
    const containerTabela = document.getElementById('container-tabela');

    if (btnToggle && containerTabela) {
      btnToggle.addEventListener('click', () => {
        const isVisible = containerTabela.classList.toggle('visible');
        btnToggle.innerText = isVisible ? 'Ocultar Detalhes dos Candidatos' : 'Mostrar Detalhes dos Candidatos';
      });
    }
  }
});