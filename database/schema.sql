-- ProntuCar: criação do banco e das tabelas (MySQL 8)
-- Execute este arquivo inteiro no DBeaver, MySQL Workbench ou terminal.

CREATE DATABASE IF NOT EXISTS manut
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE manut;

CREATE TABLE usuarios (
  id         INT          NOT NULL AUTO_INCREMENT,
  nome       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE veiculos (
  id         INT         NOT NULL AUTO_INCREMENT,
  usuario_id INT         NOT NULL,
  placa      VARCHAR(10) NOT NULL,
  marca      VARCHAR(50) NOT NULL,
  modelo     VARCHAR(50) NOT NULL,
  ano        SMALLINT    NOT NULL,
  km_atual   INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  -- a mesma placa pode existir para usuários diferentes, mas não duas vezes para o mesmo
  UNIQUE KEY uq_veiculo_usuario_placa (usuario_id, placa),
  CONSTRAINT fk_veiculos_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE manutencoes (
  id                   INT           NOT NULL AUTO_INCREMENT,
  veiculo_id           INT           NOT NULL,
  tipo                 ENUM('TROCA_OLEO','FREIOS','PNEUS','REVISAO','OUTROS') NOT NULL,
  data                 DATE          NOT NULL,
  km                   INT           NOT NULL,
  custo                DECIMAL(10,2) NOT NULL,
  oficina              VARCHAR(100)  DEFAULT NULL,
  observacoes          TEXT,
  proxima_revisao_km   INT           DEFAULT NULL,
  proxima_revisao_data DATE          DEFAULT NULL,
  created_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_manutencoes_veiculo_data (veiculo_id, data),
  CONSTRAINT fk_manutencoes_veiculo FOREIGN KEY (veiculo_id)
    REFERENCES veiculos (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
