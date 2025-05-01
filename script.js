document.addEventListener('DOMContentLoaded', () => {
    const filtroTema = document.getElementById('filtro-tema');
    const questaoContainer = document.getElementById('questao-container');
    const perguntaTexto = document.getElementById('pergunta-texto');
    const alternativasForm = document.getElementById('alternativas');
    const alternativasLabels = {
        A: document.getElementById('alt-a'),
        B: document.getElementById('alt-b'),
        C: document.getElementById('alt-c'),
        D: document.getElementById('alt-d'),
        E: document.getElementById('alt-e')
    };
    const responderBtn = document.getElementById('responder-btn');
    const resultadoDiv = document.getElementById('resultado');
    const mensagemResultado = document.getElementById('mensagem-resultado');
    const gabaritoTexto = document.getElementById('gabarito');
    const proximaQuestaoBtn = document.getElementById('proxima-questao-btn');
    const questoesRespondidasSpan = document.getElementById('questoes-respondidas');
    const totalQuestoesSpan = document.getElementById('total-questoes');
    const acertosSpan = document.getElementById('acertos');
    const restantesSpan = document.getElementById('restantes');
    const incorretasSpan = document.getElementById('incorretas');

    const questaoAtualSpan = document.getElementById('questao-atual');
    const totalQuestoesExibicaoSpan = document.getElementById('total-questoes-exibicao');
    const questoesResolvidasExibicaoSpan = document.getElementById('questoes-resolvidas-exibicao');
    const acertosExibicaoSpan = document.getElementById('acertos-exibicao');
    const incorretasExibicaoSpan = document.getElementById('incorretas-exibicao');

    const adicionarQuestaoBtn = document.getElementById('adicionar-questao-btn');
    const formularioQuestaoDiv = document.getElementById('formulario-questao');
    const salvarQuestaoBtn = document.getElementById('salvar-questao-btn');
    const cancelarQuestaoBtn = document.getElementById('cancelar-questao-btn');
    const temaInput = document.getElementById('tema');
    const perguntaInput = document.getElementById('pergunta');
    const alternativaInputs = [
        document.getElementById('alternativa1'),
        document.getElementById('alternativa2'),
        document.getElementById('alternativa3'),
        document.getElementById('alternativa4'),
        document.getElementById('alternativa5')
    ];
    const respostaCorretaInput = document.getElementById('resposta-correta');
    const gabaritoComentadoInput = document.getElementById('gabarito-comentado');
    const carregarQuestoesBtn = document.getElementById('carregar-questoes-btn');
    const arquivoQuestoesInput = document.getElementById('arquivo-questoes');
    const resetarQuestoesBtn = document.getElementById('resetar-questoes-btn');
    resetarQuestoesBtn.addEventListener('click', resetarQuestoesResolvidas);
    const mensagemCarregamentoDiv = document.getElementById('mensagem-carregamento');
    carregarQuestoesBtn.addEventListener('click', () => {
        arquivoQuestoesInput.click(); // Aciona o campo de seleção de arquivo
    });

    arquivoQuestoesInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const novasQuestoes = JSON.parse(e.target.result);
                    if (Array.isArray(novasQuestoes)) {
                        novasQuestoes.forEach(questao => {
                            if (questaoValida(questao)) {
                                questoes.push(questao);
                            } else {
                                mensagemCarregamentoDiv.textContent = 'Erro: Algumas questões no arquivo JSON são inválidas.';
                                mensagemCarregamentoDiv.style.color = 'red';
                                return; // Interrompe o carregamento se encontrar uma questão inválida
                            }
                        });
                        atualizarFiltroTemas();
                        mensagemCarregamentoDiv.textContent = 'Questões carregadas com sucesso!';
                        mensagemCarregamentoDiv.style.color = 'green';
                        arquivoQuestoesInput.value = ''; // Limpa o campo de arquivo
                        filtrarQuestoes(filtroTema.value); // Atualiza a exibição
                    } else {
                        mensagemCarregamentoDiv.textContent = 'Erro: O arquivo JSON não contém um array de questões.';
                        mensagemCarregamentoDiv.style.color = 'red';
                    }
                } catch (error) {
                    mensagemCarregamentoDiv.textContent = 'Erro ao processar o arquivo JSON: ' + error.message;
                    mensagemCarregamentoDiv.style.color = 'red';
                }
            };

            reader.readAsText(file);
        }
    });

    function questaoValida(questao) {
        return questao.tema && questao.pergunta && questao.alternativa1 && questao.alternativa2 &&
               questao.alternativa3 && questao.alternativa4 && questao.alternativa5 &&
               questao.respostaCorreta && ['A', 'B', 'C', 'D', 'E'].includes(questao.respostaCorreta) &&
               questao.gabaritoComentado;
    }

    let indiceQuestaoAtual = 0;
    let questoesFiltradas = [];
    let respostas = []; // Armazena as respostas do usuário
    let acertos = 0;
    let incorretas = 0;
    let questoesResolvidasIds = []; // Array para armazenar os IDs das questões já resolvidas
    let indiceQuestaoExibida = -1; // Índice da questão atualmente exibida (-1 para nenhuma)

    function exibirQuestao() {
        if (questoesFiltradas.length === 0) {
            perguntaTexto.textContent = "Nenhuma questão encontrada com o filtro selecionado.";
            alternativasForm.style.display = 'none';
            resultadoDiv.style.display = 'none';
            atualizarContador();
            return;
        }

        let proximaQuestaoIndex = -1;
        for (let i = 0; i < questoesFiltradas.length; i++) {
            if (!questoesResolvidasIds.includes(questoesFiltradas[i].id)) {
                proximaQuestaoIndex = i;
                break;
            }
        }

        if (proximaQuestaoIndex !== -1) {
            indiceQuestaoAtual = proximaQuestaoIndex;
            indiceQuestaoExibida = indiceQuestaoAtual; // Atualiza o índice da questão exibida

            const questao = questoesFiltradas[indiceQuestaoAtual];

            // Adiciona um ID único para cada questão (se ainda não tiver)
            if (!questao.id) {
                questao.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            }

            perguntaTexto.innerHTML = questao.pergunta;
            alternativasLabels.A.innerHTML = questao.alternativa1;
            alternativasLabels.B.innerHTML = questao.alternativa2;
            alternativasLabels.C.innerHTML = questao.alternativa3;
            alternativasLabels.D.innerHTML = questao.alternativa4;
            alternativasLabels.E.innerHTML = questao.alternativa5;
            alternativasForm.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
            resultadoDiv.style.display = 'none';
            alternativasForm.style.display = 'block'; // Garante que o formulário apareça
        } else {
            perguntaTexto.textContent = "Você respondeu todas as questões!";
            alternativasForm.style.display = 'none';
            resultadoDiv.style.display = 'none';
        }
        atualizarContador();
    }

    function verificarResposta(event) {
        event.preventDefault();
        const respostaSelecionada = document.querySelector('input[name="alternativa"]:checked');
        if (respostaSelecionada) {
            const questaoAtual = questoesFiltradas[indiceQuestaoAtual];
            const respostaUsuario = respostaSelecionada.value;
            respostas[indiceQuestaoAtual] = respostaUsuario;

            if (respostaUsuario === questaoAtual.respostaCorreta) {
                mensagemResultado.textContent = "Resposta Correta!";
                mensagemResultado.className = 'correta';
                acertos++;
            } else {
                mensagemResultado.textContent = "Resposta Incorreta.";
                mensagemResultado.className = 'incorreta';
                incorretas++;
            }
            gabaritoTexto.innerHTML = `Gabarito: ${questaoAtual.respostaCorreta}. Comentário: ${questaoAtual.gabaritoComentado}`;
            resultadoDiv.style.display = 'block';
            alternativasForm.style.display = 'none';
            atualizarContador();

            questoesResolvidasIds.push(questaoAtual.id); // Adiciona o ID da questão resolvida
        } else {
            alert("Por favor, selecione uma alternativa.");
        }
    }

    function proximaQuestao() {
        exibirQuestao();
    }

    function atualizarContador() {
        const respondidas = questoesResolvidasIds.length;
        const total = questoesFiltradas.length;
        const restantes = total - respondidas;

        questaoAtualSpan.textContent = indiceQuestaoExibida === -1 ? 0 : indiceQuestaoExibida + 1; // Exibe a questão atual (começando do 1)
        totalQuestoesExibicaoSpan.textContent = total;
        questoesResolvidasExibicaoSpan.textContent = respondidas;
        acertosExibicaoSpan.textContent = acertos;
        incorretasExibicaoSpan.textContent = incorretas;
    }

    function filtrarQuestoes(tema) {
        indiceQuestaoAtual = 0;
        respostas = [];
        acertos = 0;
        incorretas = 0;
        if (tema === 'todos') {
            questoesFiltradas = questoes;
        } else {
            questoesFiltradas = questoes.filter(q => q.tema === tema);
        }
        exibirQuestao();
        atualizarContador();
    }

    // Inicialização: Carregar temas no filtro e exibir a primeira questão
    function inicializar() {
        const temas = [...new Set(questoes.map(q => q.tema))];
        temas.forEach(tema => {
            const option = document.createElement('option');
            option.value = tema;
            option.textContent = tema;
            filtroTema.appendChild(option);
        });
        filtrarQuestoes('todos');
    }

    inicializar();
    responderBtn.addEventListener('click', verificarResposta);
    proximaQuestaoBtn.addEventListener('click', proximaQuestao);
    filtroTema.addEventListener('change', (event) => {
        filtrarQuestoes(event.target.value);
    });

    // Funcionalidade para a área de administração (adicionar questões)
    adicionarQuestaoBtn.addEventListener('click', () => {
        formularioQuestaoDiv.style.display = 'block';
    });

    cancelarQuestaoBtn.addEventListener('click', () => {
        formularioQuestaoDiv.style.display = 'none';
        limparFormularioQuestao();
    });

    salvarQuestaoBtn.addEventListener('click', () => {
        const novoTema = temaInput.value.trim();
        const novaPergunta = perguntaInput.value.trim();
        const novasAlternativas = alternativaInputs.map(input => input.value.trim());
        const novaRespostaCorreta = respostaCorretaInput.value.trim().toUpperCase();
        const novoGabaritoComentado = gabaritoComentadoInput.value.trim();

        // Validação básica
        if (novoTema && novaPergunta && novasAlternativas.every(alt => alt) && ['A', 'B', 'C', 'D', 'E'].includes(novaRespostaCorreta) && novoGabaritoComentado) {
            const novaQuestao = {
                tema: novoTema,
                pergunta: novaPergunta,
                alternativa1: novasAlternativas[0],
                alternativa2: novasAlternativas[1],
                alternativa3: novasAlternativas[2],
                alternativa4: novasAlternativas[3],
                alternativa5: novasAlternativas[4],
                respostaCorreta: novaRespostaCorreta,
                gabaritoComentado: novoGabaritoComentado,
                id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) // Gera um ID único
            };
            questoes.push(novaQuestao);
            atualizarFiltroTemas();
            limparFormularioQuestao();
            formularioQuestaoDiv.style.display = 'none';

            // Adiciona o botão de exclusão
            const questaoDiv = document.createElement('div');
            questaoDiv.textContent = `Nova questão adicionada - Tema: ${novoTema}, Pergunta: ${novaPergunta}`;
            const excluirBtn = document.createElement('button');
            excluirBtn.textContent = 'Excluir';
            excluirBtn.addEventListener('click', () => excluirQuestao(novaQuestao.id));
            questaoDiv.appendChild(excluirBtn);
            mensagemCarregamentoDiv.appendChild(questaoDiv);
            mensagemCarregamentoDiv.style.color = 'green';

            filtrarQuestoes(filtroTema.value); // Atualiza a exibição se o filtro atual incluir a nova questão
        } else {
            alert('Por favor, preencha todos os campos corretamente.');
        }
    });

    function limparFormularioQuestao() {
        temaInput.value = '';
        perguntaInput.value = '';
        alternativaInputs.forEach(input => input.value = '');
        respostaCorretaInput.value = '';
        gabaritoComentadoInput.value = '';
    }

    function atualizarFiltroTemas() {
        const temas = [...new Set(questoes.map(q => q.tema))];
        filtroTema.innerHTML = '<option value="todos">Todas as Matérias</option>';
        temas.forEach(tema => {
            const option = document.createElement('option');
            option.value = tema;
            option.textContent = tema;
            filtroTema.appendChild(option);
        });
        // Garante que a lista de questões filtradas seja atualizada após adicionar uma nova questão
        filtrarQuestoes(filtroTema.value);
    }
    function excluirQuestao(questaoId) {
        const index = questoes.findIndex(q => q.id === questaoId);
        if (index !== -1) {
            questoes.splice(index, 1);
            atualizarFiltroTemas();
            filtrarQuestoes(filtroTema.value);
            alert('Questão excluída com sucesso!');
        }
    }
    function resetarQuestoesResolvidas() {
        questoesResolvidasIds = [];
        indiceQuestaoExibida = -1;
        exibirQuestao();
        atualizarContador();
    }
});