const express = require("express");
const db = require("../database/connection");

const router = express.Router();

function validarDados(body = {}) {
    if (!body || typeof body !== "object") {
        return { erro: "Informe os dados da disciplina." };
    }

    if (typeof body.nome !== "string") {
        return { erro: "Informe o nome da disciplina." };
    }

    const nome = body.nome.trim();
    if (!nome || nome.length > 100) {
        return { erro: "O nome deve ter entre 1 e 100 caracteres." };
    }

    if (body.periodo_letivo != null && typeof body.periodo_letivo !== "string") {
        return { erro: "O período letivo é inválido." };
    }

    const periodoLetivo = (body.periodo_letivo || "").trim();
    if (periodoLetivo.length > 30) {
        return { erro: "O período letivo deve ter até 30 caracteres." };
    }

    return { nome, periodoLetivo: periodoLetivo || null };
}

function obterId(parametro) {
    if (!/^\d+$/.test(parametro)) return null;
    const id = Number(parametro);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

router.get("/", async (req, res) => {
    try {
        const [disciplinas] = await db.execute(
            `SELECT id, nome, periodo_letivo
             FROM disciplinas
             WHERE usuario_id = ?
             ORDER BY nome, id`,
            [req.session.usuario.id]
        );
        res.json(disciplinas);
    } catch (erro) {
        console.error("Erro ao consultar disciplinas:", erro);
        res.status(500).json({ erro: "Não foi possível carregar as disciplinas." });
    }
});

router.post("/", async (req, res) => {
    const dados = validarDados(req.body);
    if (dados.erro) return res.status(400).json({ erro: dados.erro });

    try {
        const [resultado] = await db.execute(
            `INSERT INTO disciplinas (usuario_id, nome, periodo_letivo)
             VALUES (?, ?, ?)`,
            [req.session.usuario.id, dados.nome, dados.periodoLetivo]
        );
        res.status(201).json({
            id: resultado.insertId,
            nome: dados.nome,
            periodo_letivo: dados.periodoLetivo
        });
    } catch (erro) {
        console.error("Erro ao cadastrar disciplina:", erro);
        res.status(500).json({ erro: "Não foi possível cadastrar a disciplina." });
    }
});

router.put("/:id", async (req, res) => {
    const id = obterId(req.params.id);
    if (!id) return res.status(400).json({ erro: "Disciplina inválida." });

    const dados = validarDados(req.body);
    if (dados.erro) return res.status(400).json({ erro: dados.erro });

    try {
        const [resultado] = await db.execute(
            `UPDATE disciplinas
             SET nome = ?, periodo_letivo = ?
             WHERE id = ? AND usuario_id = ?`,
            [dados.nome, dados.periodoLetivo, id, req.session.usuario.id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: "Disciplina não encontrada." });
        }
        res.json({ id, nome: dados.nome, periodo_letivo: dados.periodoLetivo });
    } catch (erro) {
        console.error("Erro ao editar disciplina:", erro);
        res.status(500).json({ erro: "Não foi possível editar a disciplina." });
    }
});

router.delete("/:id", async (req, res) => {
    const id = obterId(req.params.id);
    if (!id) return res.status(400).json({ erro: "Disciplina inválida." });

    try {
        const [resultado] = await db.execute(
            `DELETE FROM disciplinas WHERE id = ? AND usuario_id = ?`,
            [id, req.session.usuario.id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: "Disciplina não encontrada." });
        }
        res.status(204).end();
    } catch (erro) {
        if (erro.code === "ER_ROW_IS_REFERENCED_2" || erro.code === "ER_ROW_IS_REFERENCED") {
            return res.status(409).json({
                erro: "Esta disciplina possui atividades. Mova ou exclua as atividades antes de apagar a disciplina."
            });
        }
        console.error("Erro ao excluir disciplina:", erro);
        res.status(500).json({ erro: "Não foi possível excluir a disciplina." });
    }
});

module.exports = router;
