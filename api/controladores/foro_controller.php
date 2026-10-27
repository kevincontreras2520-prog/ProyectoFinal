<?php
// api/controladores/foro_controller.php

$usuario_id = $_SESSION['usuario_id'] ?? null;
$accion = $_GET['accion'] ?? '';

switch ($accion) {
    case 'leer':
        $stmt = $pdo->query("SELECT t.id, t.titulo, t.contenido, t.creado_en AS fecha_creacion, u.nombre, u.avatar 
                             FROM temas t JOIN usuarios u ON t.usuario_id = u.id 
                             ORDER BY t.creado_en DESC");
        echo json_encode(['error' => false, 'hilos' => $stmt->fetchAll()]);
        break;

    case 'crear':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!empty($data['titulo']) && !empty($data['contenido'])) {
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
            $hilo_id = intval($data['hilo_id']);

            // 1. Borrar las respuestas del tema primero
            $delRespuestas = $pdo->prepare("DELETE FROM comentarios WHERE tema_id = :id AND modulo = 'foro'");
            $delRespuestas->execute([':id' => $hilo_id]);

            // 2. Borrar el tema
            $del = $pdo->prepare("DELETE FROM temas WHERE id = :id");
            $del->execute([':id' => $hilo_id]);
            
            echo json_encode(['error' => false]);
        } else {
            echo json_encode(['error' => true, 'mensaje' => 'No autorizado']);
        }
        break;

    // Leer las respuestas de un tema
    case 'leer_respuestas':
        $tema_id = intval($_GET['tema_id'] ?? 0);
        $stmt = $pdo->prepare("SELECT c.id, c.comentario AS contenido, c.creado_en AS fecha_creacion, u.nombre, u.avatar
                               FROM comentarios c JOIN usuarios u ON c.usuario_id = u.id
                               WHERE c.tema_id = :t AND c.modulo = 'foro' ORDER BY c.creado_en ASC");
        $stmt->execute([':t' => $tema_id]);
        echo json_encode(['error' => false, 'respuestas' => $stmt->fetchAll()]);
        break;

    // Crear una respuesta
    case 'crear_respuesta':
        $data = json_decode(file_get_contents("php://input"), true);
        $tema_id = intval($data['tema_id'] ?? 0);
        $contenido = trim($data['contenido'] ?? '');
        
        if ($tema_id && $contenido) {
            $stmt = $pdo->prepare("INSERT INTO comentarios (tema_id, usuario_id, comentario, modulo) VALUES (:t, :u, :c, 'foro')");
            $stmt->execute([':t' => $tema_id, ':u' => $usuario_id, ':c' => $contenido]);
            echo json_encode(['error' => false]);
        } else {
            echo json_encode(['error' => true, 'mensaje' => 'El mensaje no puede estar vacío']);
        }
        break;

    // NUEVO: Borrar una respuesta individual
    case 'borrar_respuesta':
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("SELECT rol FROM usuarios WHERE id = :u");
        $stmt->execute([':u' => $usuario_id]);
        $user = $stmt->fetch();
        
        if ($user['rol'] === 'admin') {
            $del = $pdo->prepare("DELETE FROM comentarios WHERE id = :id AND modulo = 'foro'");
            $del->execute([':id' => intval($data['comentario_id'])]);
            echo json_encode(['error' => false]);
        } else {
            echo json_encode(['error' => true, 'mensaje' => 'No autorizado']);
        }
        break;
}
?>
