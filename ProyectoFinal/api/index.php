<?php
// api/index.php
require_once '../config/conexion.php';
header('Content-Type: application/json; charset=utf-8');

$modulo = $_GET['modulo'] ?? '';
$accion = $_GET['accion'] ?? '';

// MIDDLEWARE: Permitir solo acceso a usuarios con sesión o a rutas públicas
$modulos_publicos = ['auth'];
$acciones_publicas = ['login', 'registro'];

if (!isset($_SESSION['usuario_id']) && !(in_array($modulo, $modulos_publicos) && in_array($accion, $acciones_publicas))) {
    http_response_code(401);
    echo json_encode(['error' => true, 'mensaje' => 'No autorizado.']);
    exit();
}

try {
    switch ($modulo) {
        case 'auth':
            require_once 'controladores/auth_controller.php';
            break;
        case 'chat':
            require_once 'controladores/chat_controller.php';
            break;
        case 'foro':
            require_once 'controladores/foro_controller.php';
            break;
        case 'blog':
            require_once 'controladores/blog_controller.php';
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => true, 'mensaje' => 'Módulo no encontrado.']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => true, 'mensaje' => 'Error del servidor: ' . $e->getMessage()]);
}
?>