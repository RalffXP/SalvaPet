-- ============================================
-- SalvaPet - Script de Criação do Banco de Dados
-- ============================================

CREATE DATABASE IF NOT EXISTS salvapet
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE salvapet;

-- ============================================
-- Tabela: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  tipo ENUM('adotante', 'doador', 'ambos') DEFAULT 'ambos',
  perfil ENUM('usuario', 'admin') NOT NULL DEFAULT 'usuario',
  foto_url VARCHAR(500),
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- Tabela: animais
-- ============================================
CREATE TABLE IF NOT EXISTS animais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  especie ENUM('cachorro', 'gato', 'outro') NOT NULL,
  raca VARCHAR(80),
  idade VARCHAR(50),
  porte ENUM('pequeno', 'medio', 'grande') DEFAULT 'medio',
  sexo ENUM('macho', 'femea') NOT NULL,
  descricao TEXT,
  imagem_url VARCHAR(500),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  vacinado BOOLEAN DEFAULT FALSE,
  castrado BOOLEAN DEFAULT FALSE,
  status ENUM('disponivel', 'em_analise', 'adotado') DEFAULT 'disponivel',
  usuario_id INT NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- Tabela: avaliacoes (avaliação do site)
-- ============================================
CREATE TABLE IF NOT EXISTS avaliacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- Tabela: mensagens (contato entre usuários)
-- ============================================
CREATE TABLE IF NOT EXISTS mensagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  remetente_id INT NOT NULL,
  destinatario_id INT NOT NULL,
  animal_id INT,
  assunto VARCHAR(200),
  conteudo TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- Dados de exemplo
-- ============================================
-- Senhas armazenadas com bcrypt (nunca em texto puro).
-- Usuários de exemplo: senha 123456
INSERT INTO usuarios (nome, email, senha, telefone, cidade, estado, tipo) VALUES
('Maria Silva', 'maria@email.com', '$2b$10$9YY.hAm/QVz86GMdPtGIJueu3RQS85dPKI6RifXKSGeJCAZZonpGi', '(18) 99999-0001', 'Presidente Venceslau', 'SP', 'doador'),
('João Santos', 'joao@email.com', '$2b$10$9YY.hAm/QVz86GMdPtGIJueu3RQS85dPKI6RifXKSGeJCAZZonpGi', '(18) 99999-0002', 'Presidente Prudente', 'SP', 'adotante'),
('Ana Oliveira', 'ana@email.com', '$2b$10$9YY.hAm/QVz86GMdPtGIJueu3RQS85dPKI6RifXKSGeJCAZZonpGi', '(18) 99999-0003', 'Presidente Venceslau', 'SP', 'ambos');

-- Administrador padrão (email: admin@salvapet.com / senha: admin123)
INSERT INTO usuarios (nome, email, senha, telefone, cidade, estado, tipo, perfil) VALUES
('Administrador', 'admin@salvapet.com', '$2b$10$bkB2NYxsHgZZLRSMd6Y0SOCNSswqRXsh0KNkV40WIaCNWNnjzrLkm', '(18) 99999-0000', 'Presidente Venceslau', 'SP', 'ambos', 'admin');

INSERT INTO animais (nome, especie, raca, idade, porte, sexo, descricao, imagem_url, cidade, estado, vacinado, castrado, status, usuario_id) VALUES
('Rex', 'cachorro', 'Vira-lata', '2 anos', 'medio', 'macho', 'Cachorro muito dócil e brincalhão, ótimo com crianças.', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', 'Presidente Venceslau', 'SP', TRUE, TRUE, 'disponivel', 1),
('Mimi', 'gato', 'Siamês', '1 ano', 'pequeno', 'femea', 'Gatinha carinhosa, gosta de colo e é muito tranquila.', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', 'Presidente Prudente', 'SP', TRUE, FALSE, 'disponivel', 1),
('Thor', 'cachorro', 'Labrador', '3 anos', 'grande', 'macho', 'Labrador enérgico, precisa de espaço. Vacinado e castrado.', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', 'Presidente Venceslau', 'SP', TRUE, TRUE, 'disponivel', 3),
('Luna', 'gato', 'Persa', '6 meses', 'pequeno', 'femea', 'Filhote muito fofa, peluda e brincalhona.', 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400', 'Presidente Venceslau', 'SP', TRUE, FALSE, 'disponivel', 3),
('Bob', 'cachorro', 'Poodle', '4 anos', 'pequeno', 'macho', 'Poodle dócil e já adestrado. Ideal para apartamento.', 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400', 'Presidente Prudente', 'SP', FALSE, TRUE, 'disponivel', 1),
('Mel', 'cachorro', 'Golden Retriever', '1 ano', 'grande', 'femea', 'Golden filhote, super amorosa e companheira.', 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400', 'Presidente Venceslau', 'SP', TRUE, FALSE, 'disponivel', 3);

INSERT INTO avaliacoes (usuario_id, nota, comentario) VALUES
(1, 5, 'Site maravilhoso! Consegui encontrar um lar para meus gatinhos rapidamente.'),
(2, 4, 'Muito fácil de usar, adorei a iniciativa!'),
(3, 5, 'Plataforma excelente para quem quer ajudar os animais.');

-- ============================================
-- MIGRAÇÃO (para bancos já existentes)
-- Execute apenas se a tabela usuarios já existia antes do painel admin:
-- ============================================
-- ALTER TABLE usuarios ADD COLUMN perfil ENUM('usuario', 'admin') NOT NULL DEFAULT 'usuario' AFTER tipo;
-- INSERT INTO usuarios (nome, email, senha, cidade, estado, tipo, perfil)
--   VALUES ('Administrador', 'admin@salvapet.com', '$2b$10$bkB2NYxsHgZZLRSMd6Y0SOCNSswqRXsh0KNkV40WIaCNWNnjzrLkm', 'Presidente Venceslau', 'SP', 'ambos', 'admin');
-- Ou promova um usuário existente:
-- UPDATE usuarios SET perfil = 'admin' WHERE email = 'seu@email.com';
--
-- Senhas antigas em texto puro: rode "npm run migrar-senhas" para criptografá-las
-- (elas também são convertidas automaticamente no próximo login do usuário).
