<?php
// api/controladores/blog_controller.php

$usuario_id = $_SESSION['usuario_id'] ?? null;
$accion = $_GET['accion'] ?? '';

switch ($accion) {
    case 'leer':
        $stmt = $pdo->query("SELECT p.id, p.titulo, p.contenido, p.fecha_creacion, u.nombre, u.avatar 
                             FROM posts p JOIN usuarios u ON p.usuario_id = u.id 
                             ORDER BY p.fecha_creacion DESC");
        echo json_encode(['error' => false, 'posts' => $stmt->fetchAll()]);
        break;

    case 'crear':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!empty($data['titulo']) && !empty($data['contenido'])) {
            $stmt = $pdo->prepare("INSERT INTO posts (usuario_id, titulo, contenido) VALUES (:u, :t, :c)");
            $stmt->execute([':u' => $usuario_id, ':t' => $data['titulo'], ':c' => $data['contenido']]);
            echo json_encode(['error' => false]);
        }
        break;
}
?>