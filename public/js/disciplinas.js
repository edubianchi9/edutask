const formulario = document.getElementById('disciplina-form');
const lista = document.getElementById('lista-disciplinas');
const estadoVazio = document.getElementById('estado-vazio');
const mensagem = document.getElementById('mensagem');

function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.classList.toggle('feedback-error', erro);
}

async function requisitar(url, opcoes = {}) {
    const resposta = await fetch(url, {
        credentials: 'same-origin',
        ...opcoes
    });

    if (resposta.status === 401) {
        window.location.assign('/');
        throw new Error('Sua sessão terminou. Entre novamente.');
    }

    if (resposta.status === 204) return null;
    const dados = await resposta.json();
    if (!resposta.ok) {
        throw new Error(dados.erro || 'Não foi possível concluir a operação.');
    }
    return dados;
}

function criarBotao(rotulo, classe, acao) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = classe;
    botao.textContent = rotulo;
    botao.addEventListener('click', acao);
    return botao;
}

function renderizar(disciplinas) {
    lista.replaceChildren();
    estadoVazio.hidden = disciplinas.length > 0;
    estadoVazio.textContent = disciplinas.length ? '' : 'Nenhuma disciplina cadastrada ainda.';

    for (const disciplina of disciplinas) {
        const item = document.createElement('li');
        item.className = 'disciplina-item';
        const descricao = document.createElement('div');
        const nome = document.createElement('strong');
        nome.textContent = disciplina.nome;
        descricao.append(nome);
        if (disciplina.periodo_letivo) {
            const periodo = document.createElement('span');
            periodo.className = 'disciplina-periodo';
            periodo.textContent = disciplina.periodo_letivo;
            descricao.append(periodo);
        }

        const acoes = document.createElement('div');
        acoes.className = 'disciplina-acoes';
        acoes.append(
            criarBotao('Editar', 'secondary-button', async () => {
                const novoNome = window.prompt('Nome da disciplina:', disciplina.nome);
                if (novoNome === null) return;
                const novoPeriodo = window.prompt('Período (pode ficar em branco):', disciplina.periodo_letivo || '');
                if (novoPeriodo === null) return;
                try {
                    await requisitar(`/api/disciplinas/${disciplina.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nome: novoNome, periodo_letivo: novoPeriodo })
                    });
                    mostrarMensagem('Disciplina atualizada.');
                    await carregar();
                } catch (erro) {
                    mostrarMensagem(erro.message, true);
                }
            }),
            criarBotao('Excluir', 'danger-button', async () => {
                if (!window.confirm(`Excluir a disciplina “${disciplina.nome}”?`)) return;
                try {
                    await requisitar(`/api/disciplinas/${disciplina.id}`, { method: 'DELETE' });
                    mostrarMensagem('Disciplina excluída.');
                    await carregar();
                } catch (erro) {
                    mostrarMensagem(erro.message, true);
                }
            })
        );
        item.append(descricao, acoes);
        lista.append(item);
    }
}

async function carregar() {
    try {
        renderizar(await requisitar('/api/disciplinas'));
    } catch (erro) {
        estadoVazio.hidden = false;
        estadoVazio.textContent = 'Não foi possível carregar as disciplinas.';
        mostrarMensagem(erro.message, true);
    }
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const botao = formulario.querySelector('button[type="submit"]');
    botao.disabled = true;
    try {
        await requisitar('/api/disciplinas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: formulario.elements.namedItem('nome').value,
                periodo_letivo: formulario.elements.namedItem('periodo').value
            })
        });
        formulario.reset();
        mostrarMensagem('Disciplina cadastrada.');
        await carregar();
    } catch (erro) {
        mostrarMensagem(erro.message, true);
    } finally {
        botao.disabled = false;
    }
});

carregar();
