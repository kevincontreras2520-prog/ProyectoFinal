<?php
// api/controladores/foro_controller.php

$usuario_id = $_SESSION['usuario_id'] ?? null;
$accion = $_GET['accion'] ?? '';

switch ($accion) {
    case 'leer':
        // Cambiamos 'hilos' por 'temas' y 'fecha_creacion' por 'creado_en'
        $stmt = $pdo->query("SELECT t.id, t.titulo, t.contenido, t.creado_en AS fecha_creacion, u.nombre, u.avatar 
                             FROM temas t JOIN usuarios u ON t.usuario_id = u.id 
                             ORDER BY t.creado_en DESC");
        echo json_encode(['error' => false, 'hilos' => $stmt->fetchAll()]);
        break;

    case 'crear':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!empty($data['titulo']) && !empty($data['contenido'])) {
            // Insertamos en la tabla 'temas'
            $stmt = $pdo->prepare("INSERT INTO temas (usuario_id, titulo, contenido) VALUES (:u, :t, :c)");
            $stmt->execute([':u' => $usuario_id, ':t' => $data['titulo'], ':c' => $data['contenido']]);
            echo json_encode(['error' => false]);
        } else {
            echo json_encode(['error' => true, 'mensaje' => 'Campos vacíos']);
        }
        break;
        case 'borrar':
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("SELECT rol FROM usuarios WHERE id = :u");
        $stmt->execute([':u' => $usuario_id]);
        $user = $stmt->fetch();
        
        if ($user['rol'] === 'admin') {
            $del = $pdo->prepare("DELETE FROM temas WHERE id = :id");
            $del->execute([':id' => intval($data['hilo_id'])]);
            echo json_encode(['error' => false]);
        } else {
            echo json_encode(['error' => true, 'mensaje' => 'No autorizado']);
        }
        break;
}
?>
