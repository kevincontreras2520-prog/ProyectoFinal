
CREATE DATABASE IF NOT EXISTS `proyecto_web` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `proyecto_web`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `comentarios`;
DROP TABLE IF EXISTS `posts`;
DROP TABLE IF EXISTS `mensajes`;
DROP TABLE IF EXISTS `hilos`;
DROP TABLE IF EXISTS `usuarios`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `correo` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `avatar` VARCHAR(20) DEFAULT '😀',
  `rol` ENUM('user', 'admin') DEFAULT 'user',
  `baneado` TINYINT(1) DEFAULT 0,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mensajes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `destinatario_id` INT DEFAULT NULL,
  `mensaje` TEXT NOT NULL,
  `fijado` TINYINT(1) DEFAULT 0,
  `enviado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`destinatario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `contenido` TEXT NOT NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `comentarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `post_id` INT NOT NULL,
  `usuario_id` INT NOT NULL,
  `comentario_padre_id` INT DEFAULT NULL,
  `contenido` TEXT NOT NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`comentario_padre_id`) REFERENCES `comentarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `hilos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `contenido` TEXT NOT NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `usuarios` (`nombre`, `correo`, `password`, `avatar`, `rol`, `baneado`) 
VALUES (
  'Administrador', 
  'admin@proyecto.com', 
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  '👑', 
  'admin', 
  0
);