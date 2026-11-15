# EduTask

Plataforma web para organização de atividades acadêmicas. Esta entrega acrescenta o cadastro de disciplinas à base existente de contas e login.

## Preparação

1. Instale Node.js e MySQL.
2. Crie o banco de dados utilizado pelo projeto e configure as variáveis em `.env`, usando `.env.example` como referência. Preserve o `.env` já existente caso esteja atualizando o projeto.
3. Execute `npm install`.
4. No MySQL, selecione o mesmo banco configurado em `.env` e execute `database/001_disciplinas_atividades.sql`. O script cria as tabelas `disciplinas` e `atividades`; a tabela `usuarios` precisa existir antes.
5. Execute `npm start` e abra `http://localhost:3000` (ou a porta configurada).

## Entrega atual

- Cada usuário autenticado vê e gerencia apenas as próprias disciplinas.
- O nome é obrigatório; o período letivo é opcional.
- Uma disciplina vinculada a atividades não pode ser excluída. A tabela de atividades já está preparada no banco, mas sua tela e API ficam para a próxima etapa.
- Os indicadores de tarefas no painel ainda são valores de exemplo e não devem ser usados como dados reais.

Não inclua `.env` ou `node_modules` ao compartilhar o projeto.
