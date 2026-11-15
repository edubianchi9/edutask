const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

const bancoPath = require.resolve('../database/connection');
const chamadas = [];
let executar = async (sql, parametros) => {
    chamadas.push({ sql, parametros });
    if (sql.includes('SELECT')) return [[{ id: 3, nome: 'Matemática', periodo_letivo: null }]];
    if (sql.includes('INSERT')) return [{ insertId: 4 }];
    return [{ affectedRows: 1 }];
};

require.cache[bancoPath] = {
    id: bancoPath,
    filename: bancoPath,
    loaded: true,
    exports: { execute: (...args) => executar(...args) }
};

const rotas = require('../routes/disciplinas');

async function comServidor(callback) {
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
        req.session = { usuario: { id: 7 } };
        next();
    });
    app.use('/api/disciplinas', rotas);
    const servidor = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => servidor.once('listening', resolve));
    try {
        await callback(`http://127.0.0.1:${servidor.address().port}`);
    } finally {
        await new Promise((resolve) => servidor.close(resolve));
    }
}

test('lista apenas disciplinas do usuário da sessão', async () => {
    chamadas.length = 0;
    await comServidor(async (base) => {
        const resposta = await fetch(`${base}/api/disciplinas`);
        assert.equal(resposta.status, 200);
        assert.equal((await resposta.json())[0].nome, 'Matemática');
    });
    assert.deepEqual(chamadas[0].parametros, [7]);
});

test('valida nome e período antes de cadastrar', async () => {
    chamadas.length = 0;
    await comServidor(async (base) => {
        const resposta = await fetch(`${base}/api/disciplinas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: '  ', periodo_letivo: '2026/2' })
        });
        assert.equal(resposta.status, 400);
        const corpoVazio = await fetch(`${base}/api/disciplinas`, { method: 'POST' });
        assert.equal(corpoVazio.status, 400);
    });
    assert.equal(chamadas.length, 0);
});

test('grava, altera e exclui com filtro pelo usuário', async () => {
    chamadas.length = 0;
    await comServidor(async (base) => {
        const cabecalhos = { 'Content-Type': 'application/json' };
        const criado = await fetch(`${base}/api/disciplinas`, {
            method: 'POST', headers: cabecalhos,
            body: JSON.stringify({ nome: '  Física  ', periodo_letivo: '' })
        });
        assert.equal(criado.status, 201);
        assert.equal((await criado.json()).nome, 'Física');

        const editado = await fetch(`${base}/api/disciplinas/4`, {
            method: 'PUT', headers: cabecalhos,
            body: JSON.stringify({ nome: 'Física II', periodo_letivo: '2026/2' })
        });
        assert.equal(editado.status, 200);

        const excluido = await fetch(`${base}/api/disciplinas/4`, { method: 'DELETE' });
        assert.equal(excluido.status, 204);
    });
    assert.deepEqual(chamadas[0].parametros, [7, 'Física', null]);
    assert.deepEqual(chamadas[1].parametros, ['Física II', '2026/2', 4, 7]);
    assert.deepEqual(chamadas[2].parametros, [4, 7]);
});

test('não exclui disciplina vinculada a atividades', async () => {
    executar = async () => {
        const erro = new Error('foreign key');
        erro.code = 'ER_ROW_IS_REFERENCED_2';
        throw erro;
    };
    await comServidor(async (base) => {
        const resposta = await fetch(`${base}/api/disciplinas/4`, { method: 'DELETE' });
        assert.equal(resposta.status, 409);
    });
});
