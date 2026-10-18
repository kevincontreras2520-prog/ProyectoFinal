<?php
// api/controladores/foro_controller.php

$usuario_id = $_SESSION['usuario_id'] ?? null;
$accion = $_GET['accion'] ?? '';

switch ($accion) {
    case 'leer':
        $stmt = $pdo->query("SELECT h.id, h.titulo, h.contenido, h.fecha_creacion, u.nombre, u.avatar 
                             FROM hilos h JOIN usuarios u ON h.usuario_id = u.id 
                             ORDER BY h.fecha_creacion DESC");
        echo json_encode(['error' => false, 'hilos' => $stmt->fetchAll()]);
        break;

    case 'crear':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!empty($data['titulo']) && !empty($data['contenido'])) {
            $stmt = $pdo->prepare("INSERT INTO hilos (usuario_id, titulo, contenido) VALUES (:u, :t, :c)");
            $stmt->execute([':u' => $usuario_id, ':t' => $data['titulo'], ':c' => $data['contenido']]);
            echo json_encode(['error' => false]);
        } else {
            echo json_encode(['error' => true, 'mensaje' => 'Campos vacíos']);
        }
        break;
}
?>