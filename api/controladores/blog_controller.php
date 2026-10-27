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
case 'leer_comentarios':
    $post_id = intval($_GET['post_id'] ?? 0);
    $stmt = $pdo->prepare("SELECT c.id, c.contenido, c.comentario_padre_id, c.fecha_creacion, u.nombre, u.avatar
                           FROM comentarios c JOIN usuarios u ON c.usuario_id = u.id
                           WHERE c.post_id = :p ORDER BY c.id ASC");
    $stmt->execute([':p' => $post_id]);
    echo json_encode(['error' => false, 'comentarios' => $stmt->fetchAll()]);
    break;

case 'crear_comentario':
    $data = json_decode(file_get_contents("php://input"), true);
    $post_id = intval($data['post_id'] ?? 0);
    $padre = !empty($data['comentario_padre_id']) ? intval($data['comentario_padre_id']) : null;
    $contenido = trim($data['contenido'] ?? '');
    if ($post_id && $contenido) {
        $stmt = $pdo->prepare("INSERT INTO comentarios (post_id, usuario_id, comentario_padre_id, contenido)
                               VALUES (:p, :u, :padre, :c)");
        $stmt->execute([':p'=>$post_id, ':u'=>$usuario_id, ':padre'=>$padre, ':c'=>$contenido]);
        echo json_encode(['error' => false]);
    } else {
        echo json_encode(['error' => true, 'mensaje' => 'Datos incompletos']);
    }
    break;
?>
