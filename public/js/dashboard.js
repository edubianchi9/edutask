async function carregarUsuario() {

    try {

        const resposta =
            await fetch("/usuarios/me");


        if (!resposta.ok) {

            window.location.href = "/";

            return;

        }


        const usuario =
            await resposta.json();


        document.getElementById(
            "nomeUsuario"
        ).textContent = usuario.nome;


    } catch (erro) {

        console.error(
            "Erro ao carregar usuário:",
            erro
        );

    }

}


carregarUsuario();