require("dotenv").config();

const session = require("express-session");
const express = require("express");
const path = require("path");
const db = require("./database/connection");

const usuariosRoutes =
    require("./routes/usuarios");
const disciplinasRoutes =
    require("./routes/disciplinas");

const app = express();

const PORT = Number(process.env.PORT) || 3000;

function verificarAutenticacao(req, res, next) {

    if (!req.session.usuario) {

        return res.redirect("/");

    }

    next();

}

async function testarBanco() {

    try {

        const connection = await db.getConnection();

        console.log("Banco de dados conectado!");

        connection.release();

    } catch (erro) {

        console.error(
            "Erro ao conectar ao banco:",
            erro.message
        );

    }

}

testarBanco();


app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,

        cookie: {
            maxAge: 1000 * 60 * 60 * 2,
            httpOnly: true,
            sameSite: "lax"
        }
    })
);

app.use(
    "/usuarios",
    usuariosRoutes
);

app.use("/api/disciplinas", (req, res, next) => {
    if (!req.session.usuario) {
        return res.status(401).json({ erro: "Entre na sua conta para continuar." });
    }
    next();
}, disciplinasRoutes);

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "views",
            "login.html"
        )
    );

});


app.get("/views/cadastro.html", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "views",
            "cadastro.html"
        )
    );

});

app.get(
    "/dashboard",
    verificarAutenticacao,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "dashboard.html"
            )
        );

    }
);

app.get("/disciplinas", verificarAutenticacao, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "disciplinas.html"));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
