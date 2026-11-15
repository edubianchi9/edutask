const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../database/connection");

const router = express.Router();


router.post("/cadastro", async (req, res) => {

    try {

        const { nome, email, senha } = req.body;

    
        if (!nome || !email || !senha) {

            return res
                .status(400)
                .send("Preencha todos os campos.");

        }


    
        if (senha.length < 6) {

            return res
                .status(400)
                .send("A senha deve possuir pelo menos 6 caracteres.");

        }


    
        const emailNormalizado =
            email.trim().toLowerCase();


       
        const [usuarios] = await db.execute(
            `
            SELECT id
            FROM usuarios
            WHERE email = ?
            `,
            [emailNormalizado]
        );


        if (usuarios.length > 0) {

            return res
                .status(409)
                .send("Este e-mail já está cadastrado.");

        }


    
        const senhaCriptografada =
            await bcrypt.hash(senha, 10);


    
        await db.execute(
            `
            INSERT INTO usuarios
            (nome, email, senha)
            VALUES (?, ?, ?)
            `,
            [
                nome.trim(),
                emailNormalizado,
                senhaCriptografada
            ]
        );


        console.log(
            `Novo usuário cadastrado: ${emailNormalizado}`
        );


        
        res.redirect("/");

    } catch (erro) {

        console.error(
            "Erro ao cadastrar usuário:",
            erro
        );

        res
            .status(500)
            .send("Erro interno ao cadastrar usuário.");

    }

});

router.post("/login", async (req, res) => {

    try {

        const { email, senha } = req.body;

        if (!email || !senha) {

            return res
                .status(400)
                .send("Preencha e-mail e senha.");

        }

        const emailNormalizado =
            email.trim().toLowerCase();


        const [usuarios] = await db.execute(
            `
            SELECT id, nome, email, senha
            FROM usuarios
            WHERE email = ?
            `,
            [emailNormalizado]
        );


        if (usuarios.length === 0) {

            return res
                .status(401)
                .send("E-mail ou senha incorretos.");

        }


        const usuario = usuarios[0];


        const senhaCorreta =
            await bcrypt.compare(
                senha,
                usuario.senha
            );


        if (!senhaCorreta) {

            return res
                .status(401)
                .send("E-mail ou senha incorretos.");

        }


        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        };


        console.log(
            `Usuário logado: ${usuario.email}`
        );


        res.redirect("/dashboard");

    } catch (erro) {

        console.error(
            "Erro durante login:",
            erro
        );

        res
            .status(500)
            .send("Erro interno ao realizar login.");

    }

});

// DADOS DO USUÁRIO LOGADO
router.get("/me", (req, res) => {

    if (!req.session.usuario) {

        return res
            .status(401)
            .json({
                erro: "Usuário não autenticado."
            });

    }

    res.json(req.session.usuario);

});

// LOGOUT
router.post("/logout", (req, res) => {

    req.session.destroy((erro) => {

        if (erro) {

            console.error(
                "Erro ao encerrar sessão:",
                erro
            );

            return res
                .status(500)
                .send("Erro ao sair da conta.");

        }

        res.clearCookie("connect.sid");

        res.redirect("/");

    });

});

module.exports = router;