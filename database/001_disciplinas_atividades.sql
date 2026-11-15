-- Execute no mesmo banco que já contém a tabela usuarios.
-- A chave estrangeira impede excluir disciplinas com atividades vinculadas.

CREATE TABLE IF NOT EXISTS disciplinas (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    periodo_letivo VARCHAR(30) NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_disciplinas_usuario (usuario_id),
    CONSTRAINT fk_disciplinas_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS atividades (
    id INT NOT NULL AUTO_INCREMENT,
    disciplina_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NULL,
    tipo VARCHAR(30) NOT NULL DEFAULT 'tarefa',
    prioridade VARCHAR(20) NOT NULL DEFAULT 'normal',
    estado VARCHAR(20) NOT NULL DEFAULT 'pendente',
    data_prazo DATE NULL,
    hora_prazo TIME NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    concluido_em TIMESTAMP NULL,
    PRIMARY KEY (id),
    INDEX idx_atividades_disciplina (disciplina_id),
    INDEX idx_atividades_prazo (data_prazo, hora_prazo),
    CONSTRAINT fk_atividades_disciplina
        FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id)
        ON DELETE RESTRICT
);
