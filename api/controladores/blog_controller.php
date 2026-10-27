<?php
// api/controladores/blog_controller.php

$usuario_id = $_SESSION['usuario_id'] ?? null;
$accion = $_GET['accion'] ?? '';

switch ($accion) {
    case 'leer':
        $stmtUser = $pdo->prepare("SELECT rol FROM usuarios WHERE id = :id");
        $stmtUser->execute([':id' => $usuario_id]);
        $currentUser = $stmtUser->fetch();
        $es_admin = ($currentUser && $currentUser['rol'] === 'admin');

        $stmt = $pdo->query("SELECT p.id, p.titulo, p.contenido, p.creado_en AS fecha_creacion, u.nombre, u.avatar 
                             FROM publicaciones p JOIN usuarios u ON p.usuario_id = u.id 
                             ORDER BY p.creado_en DESC");
        
        echo json_encode([
            'error' => false, 
            'posts' => $stmt->fetchAll(),
            'es_admin' => $es_admin 
        ]);
        break;

    case 'crear':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!empty($data['titulo']) && !empty($data['contenido'])) {
            // Validar longitud
            if (strlen($data['titulo']) > 255 || strlen($data['contenido']) > 5000) {
                echo json_encode(['error' => true, 'mensaje' => 'El texto es demasiado largo.']);
                break;
            }
            // Insertar correctamente
            $stmt = $pdo->prepare("INSERT INTO publicaciones (usuario_id, titulo, contenido) VALUES (:u, :t, :c)");
            $stmt->execute([':u' => $usuario_id, ':t' => $data['titulo'], ':c' => $data['contenido']]);
            echo json_encode(['error' => false]);
        } else {
            echo json_encode(['error' => true, 'mensaje' => 'Faltan datos']);
        }
        break;

    case 'leer_comentarios':
        $post_id = intval($_GET['post_id'] ?? 0);
        $stmt = $pdo->prepare("SELECT c.id, c.comentario AS contenido, c.creado_en AS fecha_creacion, u.nombre, u.avatar
                               FROM comentarios c JOIN usuarios u ON c.usuario_id = u.id
                               WHERE c.tema_id = :p AND c.modulo = 'blog' ORDER BY c.id ASC");
        $stmt->execute([':p' => $post_id]);
        echo json_encode(['error' => false, 'comentarios' => $stmt->fetchAll()]);
        break;

    case 'crear_comentario':
        $data = json_decode(file_get_contents("php://input"), true);
        $post_id = intval($data['post_id'] ?? 0);
        $contenido = trim($data['contenido'] ?? '');
        
        if ($post_id && $contenido) {
            $stmt = $pdo->prepare("INSERT INTO comentarios (tema_id, usuario_id, comentario, modulo) VALUES (:p, :u, :c, 'blog')");
            $stmt->execute([':p' => $post_id, ':u' => $usuario_id, ':c' => $contenido]);
            echo json_encode(['error' => false]);
        } else {
            echo json_encode(['error' => true, 'mensaje' => 'Datos incompletos']);
        }
        break;
    
    case 'borrar_post':
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("SELECT rol FROM usuarios WHERE id = :u");
        $stmt->execute([':u' => $usuario_id]);
        $user = $stmt->fetch();
        
        if ($user['rol'] === 'admin') {
            $post_id = intval($data['post_id']);
            $delComentarios = $pdo->prepare("DELETE FROM comentarios WHERE tema_id = :id AND modulo = 'blog'");
            $delComentarios->execute([':id' => $post_id]);
            $del = $pdo->prepare("DELETE FROM publicaciones WHERE id = :id");
            $del->execute([':id' => $post_id]);
            echo json_encode(['error' => false]);
        } else {
            echo json_encode(['error' => true, 'mensaje' => 'No autorizado']);
        }
        break;

    case 'borrar_comentario':
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("SELECT rol FROM usuarios WHERE id = :u");
        $stmt->execute([':u' => $usuario_id]);
        $user = $stmt->fetch();
        
        if ($user['rol'] === 'admin') {
            $del = $pdo->prepare("DELETE FROM comentarios WHERE id = :id");
            $del->execute([':id' => intval($data['comentario_id'])]);
            echo json_encode(['error' => false]);
        } else {
            echo json_encode(['error' => true, 'mensaje' => 'No autorizado']);
        }
        break;
}
?>
