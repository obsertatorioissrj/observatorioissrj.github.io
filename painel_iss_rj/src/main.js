import Papa from 'papaparse';

const urlPlanilha = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZg1yY9PFERpPvEEsLHLib4kc3UnmwWMjoS4rDbWOfLQQMN58yEfVmg3yrC9sTVSLHD8ZVPJPLXhXH/pub?gid=0&single=true&output=csv'; 
const urlAposentadorias = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZg1yY9PFERpPvEEsLHLib4kc3UnmwWMjoS4rDbWOfLQQMN58yEfVmg3yrC9sTVSLHD8ZVPJPLXhXH/pub?gid=2060189199&single=true&output=csv';

// 1. Primeira requisição: Capturar o valor da célula única (A1)
Papa.parse(urlAposentadorias, {
  download: true,
  header: false, // Desativa cabeçalhos para acesso via matriz
  skipEmptyLines: true, // Ignora linhas em branco
  complete: function(resultsAposentadorias) {
    
    // A única célula corresponde à primeira linha (índice 0) e primeira coluna (índice 0)
    let aposentadorias = 0;
    if (resultsAposentadorias.data && resultsAposentadorias.data.length > 0) {
      aposentadorias = parseInt(resultsAposentadorias.data[0][0], 10) || 0;
    }

    // 2. Segunda requisição: Lógica principal executada após obter o valor das aposentadorias
    Papa.parse(urlPlanilha, {
      download: true,
      header: true,
      complete: function(results) {
        const dados = results.data.filter(row => row.NOME); 
        
        // Processamento das métricas principais
        const emExercicio = dados.filter(d => d.SITUACAO === 'EM EXERCÍCIO').length;
        const exonerados = dados.filter(d => d.SITUACAO === 'EXONERADO').length;
        const desistencia = dados.filter(d => d.SITUACAO === 'DESISTENTE').length;
        
        const nomeados = emExercicio + exonerados + desistencia;
        const liquidoNomeados = emExercicio + exonerados;
        const vagasImediatas = 50;
        // A variável 'aposentadorias' já foi populada pela primeira requisição

        // 1. Bloco Termômetro Principal
        const percentualTermometro = Math.min((liquidoNomeados / vagasImediatas) * 100, 100);
        const barraFill = document.getElementById('termometro-fill');
        if (barraFill) {
          barraFill.style.width = `${percentualTermometro}%`;
          barraFill.innerText = `${liquidoNomeados} / ${vagasImediatas}`;
        }

        // 1.1 Bloco Auditores em Exercício vs Nomeações
        const percentualExercicio = nomeados > 0 ? (emExercicio / 50) * 100 : 0;
        const barraExercicioFill = document.getElementById('barra-exercicio-fill');
        if (barraExercicioFill) {
          barraExercicioFill.style.width = `${percentualExercicio}%`;
          barraExercicioFill.innerText = `${emExercicio} / 50`;
        }

        // Cálculo do tempo decorrido
        const dataHomologacao = new Date('2023-11-29T00:00:00');
        const dataAtual = new Date();
        const diasDecorridos = Math.floor((dataAtual - dataHomologacao) / (1000 * 60 * 60 * 24));
        const textoDias = document.getElementById('texto-dias');
        if (textoDias) textoDias.innerText = `Panorama após ${diasDecorridos} dias da homologação do concurso realizado para 50 vagas`;

        // 2. Bloco Gráfico de Pizza (Evasão com Legenda e Números)
        if (nomeados > 0) {
          const percExercicio = (emExercicio / nomeados) * 100;
          const percExonerados = (exonerados / nomeados) * 100;
          
          const p1 = percExercicio;
          const p2 = p1 + percExonerados;

          const graficoEvasao = document.getElementById('grafico-evasao');
          if (graficoEvasao) {
            graficoEvasao.style.background = `conic-gradient(var(--accent-yellow) 0% ${p1}%, var(--accent-red) ${p1}% ${p2}%, #555 ${p2}% 100%)`;

            const raioPosicionamento = 45; 
            const centroCirculo = 75; 
            
            const posicionarRotulo = (id, valorAbsoluto, percInicial, percFinal) => {
              const rotulo = document.getElementById(id);
              if (!rotulo) return;
              if (valorAbsoluto === 0) {
                rotulo.style.display = 'none';
                return;
              }
              
              rotulo.innerText = valorAbsoluto;
              rotulo.style.display = 'block';
              
              const percMedio = percInicial + (percFinal - percInicial) / 2;
              const anguloGraus = (percMedio / 100) * 360 - 90; 
              const anguloRadianos = anguloGraus * (Math.PI / 180);

              const raioPorcentagem = 35; 
              const posicaoX = 50 + raioPorcentagem * Math.cos(anguloRadianos);
              const posicaoY = 50 + raioPorcentagem * Math.sin(anguloRadianos);

              rotulo.style.left = `${posicaoX}%`;
              rotulo.style.top = `${posicaoY}%`;
            };
          }
        }

// 1.2 Bloco Renovação do Quadro (Gráfico Divergente)
        const totalRenovacao = aposentadorias + emExercicio;
        if (totalRenovacao > 0) {
          // Aplicação do arredondamento na proporção percentual
          const percAposentadorias = Math.round((aposentadorias / totalRenovacao) * 100);
          const percNovos = Math.round((emExercicio / totalRenovacao) * 100);
          
          const saldo = emExercicio - aposentadorias;
          const sinalSaldo = saldo >= 0 ? '+' : '';

          const barraAposentadorias = document.getElementById('barra-aposentadorias');
          const barraNovos = document.getElementById('barra-novos');
          const textoSaldo = document.getElementById('texto-saldo');

          // Injeção dinâmica da largura calculada no HTML
          if (barraAposentadorias) barraAposentadorias.style.width = `${percAposentadorias}%`;
          if (barraNovos) barraNovos.style.width = `${percNovos}%`;
          if (textoSaldo) textoSaldo.innerHTML = `Saldo: <strong>${sinalSaldo}${saldo}</strong> Auditores`;

                  const elementosaldo = document.getElementById('valor-saldo');
        if (elementosaldo) {
          elementosaldo.textContent = saldo;
        }
        }
        const elementoPrefereOutro = document.getElementById('valor-prefere');
        if (elementoPrefereOutro) {
          elementoPrefereOutro.textContent = Math.round((exonerados + desistencia)/(emExercicio + exonerados + desistencia)*100);
        }

        const elementoEmpossados = document.getElementById('valor-empossados');
        if (elementoEmpossados) {
          elementoEmpossados.textContent = Math.round((emExercicio + exonerados)/(50)*100);
        }

        const elementoExercicio = document.getElementById('valor-exercicio');
        if (elementoExercicio) {
          elementoExercicio.textContent = emExercicio;
        }
        const elementoExercicio2 = document.getElementById('valor-exercicio2');
        if (elementoExercicio2) {
          elementoExercicio2.textContent = emExercicio;
        }

        const elementopExercicio = document.getElementById('valor-pexercicio');
        if (elementopExercicio) {
          elementopExercicio.textContent = Math.round(emExercicio/(50)*100);
        }

        const elementoExonerado = document.getElementById('valor-exonerado');
        if (elementoExonerado) {
          elementoExonerado.textContent = exonerados;
        }

        const elementoDesistente = document.getElementById('valor-desistente');
        if (elementoDesistente) {
          elementoDesistente.textContent = desistencia;
        }

        const elementoAposentadoria = document.getElementById('valor-aposentadoria');
        if (elementoAposentadoria) {
          elementoAposentadoria.textContent = aposentadorias;
        }
        
        const elementorenovacao = document.getElementById('valor-prenovacao');
        if (elementorenovacao) {
          elementorenovacao.textContent = Math.round((emExercicio - aposentadorias)/(50)*100);
        }



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
      },
      error: function(err) {
        console.error("Erro na leitura da planilha principal do Google:", err);
      }
    });
  },
  error: function(err) {
    console.error("Erro na leitura da planilha de aposentadorias do Google:", err);
  }
});