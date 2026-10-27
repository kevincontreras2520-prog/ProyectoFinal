<?php
// api/controladores/chat_controller.php

$usuario_id = $_SESSION['usuario_id'] ?? null;
if (!$usuario_id) {
    echo json_encode(['error' => true, 'mensaje' => 'No autorizado.']);
    exit;
}

// Obtener datos del usuario actual
$stmtUser = $pdo->prepare("SELECT id, rol FROM usuarios WHERE id = :id");
$stmtUser->execute([':id' => $usuario_id]);
$currentUser = $stmtUser->fetch();
$es_admin = ($currentUser && $currentUser['rol'] === 'admin');

$accion = $_GET['accion'] ?? '';

switch ($accion) {
    case 'usuarios':
        try {
            // Consulta para saber cuántos mensajes nuevos tiene el usuario actual
            $sql = "SELECT u.id, u.nombre, u.avatar, u.rol, u.baneado,
                    (SELECT COUNT(*) FROM mensajes m WHERE m.usuario_id = u.id AND m.destinatario_id = :yo AND m.leido = 0) as no_leidos
                    FROM usuarios u WHERE u.id != :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':yo' => $usuario_id, ':id' => $usuario_id]);
            
            echo json_encode([
                'error' => false, 
                'usuarios' => $stmt->fetchAll(), 
                'usuario_actual_id' => $usuario_id,
                'es_admin' => $es_admin
            ]);
        } catch (PDOException $e) {
            echo json_encode(['error' => true, 'mensaje' => 'Error SQL: ' . $e->getMessage()]);
        }
        break;

    case 'leer':
        try {
            $tipoChat = $_GET['tipo'] ?? 'group';
            $destinatarioId = !empty($_GET['destinatario_id']) ? intval($_GET['destinatario_id']) : null;

            if ($tipoChat === 'private' && $destinatarioId) {
                // Se usan marcadores únicos (:yo1, :otro1, :yo2, :otro2) para evitar errores en PDO
                $sql = "SELECT m.id, m.mensaje, m.enviado_en, m.usuario_id, u.nombre, u.avatar 
                        FROM mensajes m JOIN usuarios u ON m.usuario_id = u.id 
                        WHERE ((m.usuario_id = :yo1 AND m.destinatario_id = :otro1) 
                           OR (m.usuario_id = :otro2 AND m.destinatario_id = :yo2)) 
                        ORDER BY m.id ASC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    ':yo1' => $usuario_id, 
                    ':otro1' => $destinatarioId,
                    ':otro2' => $destinatarioId,
                    ':yo2' => $usuario_id
                ]);
            } else {
                $sql = "SELECT m.id, m.mensaje, m.fijado, m.enviado_en, m.usuario_id, u.nombre, u.avatar 
                        FROM mensajes m JOIN usuarios u ON m.usuario_id = u.id 
                        WHERE m.destinatario_id IS NULL 
                        ORDER BY m.id ASC";
                $stmt = $pdo->query($sql);
            }

            $mensajes = $stmt ? $stmt->fetchAll() : [];

            $fijado = null;
            if ($tipoChat === 'group') {
                $stmtFijado = $pdo->query("SELECT m.id, m.mensaje, u.nombre FROM mensajes m JOIN usuarios u ON m.usuario_id = u.id WHERE m.destinatario_id IS NULL AND m.fijado = 1 ORDER BY m.id DESC LIMIT 1");
                if ($stmtFijado) $fijado = $stmtFijado->fetch();
            }

            echo json_encode([
                'error' => false, 
                'mensajes' => $mensajes, 
                'fijado' => $fijado ?: null,
                'usuario_actual_id' => $usuario_id,
                'es_admin' => $es_admin
            ]);
        } catch (PDOException $e) {
            echo json_encode(['error' => true, 'mensaje' => 'Error al leer mensajes: ' . $e->getMessage()]);
        }
        break;

    case 'enviar':
        try {
            // Verificamos el estado de baneo en tiempo real
            $stmtCheckBan = $pdo->prepare("SELECT baneado FROM usuarios WHERE id = :id");
            $stmtCheckBan->execute([':id' => $usuario_id]);
            $estadoUser = $stmtCheckBan->fetch();

            if ($estadoUser && $estadoUser['baneado'] == 1) {
                echo json_encode(['error' => true, 'mensaje' => 'Tu cuenta está suspendida. No puedes enviar mensajes.']);
                exit;
            }

            $data = json_decode(file_get_contents("php://input"), true);
            $mensaje = trim($data['mensaje'] ?? '');
            $destinatarioId = !empty($data['destinatario_id']) ? intval($data['destinatario_id']) : null;

            if (!empty($mensaje)) {
                $stmt = $pdo->prepare("INSERT INTO mensajes (usuario_id, destinatario_id, mensaje) VALUES (:u, :d, :m)");
                $stmt->execute([':u' => $usuario_id, ':d' => $destinatarioId, ':m' => $mensaje]);
                echo json_encode(['error' => false, 'mensaje' => 'Enviado']);
            } else {
                echo json_encode(['error' => true, 'mensaje' => 'El mensaje no puede estar vacío.']);
            }
        } catch (PDOException $e) {
            echo json_encode(['error' => true, 'mensaje' => 'Error al enviar: ' . $e->getMessage()]);
        }
        break;

    case 'admin':
        if (!$es_admin) {
            echo json_encode(['error' => true, 'mensaje' => 'No autorizado']);
            exit;
        }
        $data = json_decode(file_get_contents("php://input"), true);
        $subAccion = $data['sub_accion'] ?? '';

        if ($subAccion === 'fijar') {
            $pdo->query("UPDATE mensajes SET fijado = 0 WHERE destinatario_id IS NULL");
            $stmt = $pdo->prepare("UPDATE mensajes SET fijado = 1 WHERE id = :id");
            $stmt->execute([':id' => intval($data['mensaje_id'])]);
        } elseif ($subAccion === 'borrar_mensaje') {
            $stmt = $pdo->prepare("DELETE FROM mensajes WHERE id = :id");
            $stmt->execute([':id' => intval($data['mensaje_id'])]);
        } elseif ($subAccion === 'toggle_ban') {
            $stmt = $pdo->prepare("UPDATE usuarios SET baneado = :b WHERE id = :u");
            $stmt->execute([':b' => intval($data['baneado']), ':u' => intval($data['usuario_id'])]);
        } elseif ($subAccion === 'borrar_usuario') {
            $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = :id");
            $stmt->execute([':id' => intval($data['usuario_id'])]);
        }
        echo json_encode(['error' => false]);
        break;

    default:
        echo json_encode(['error' => true, 'mensaje' => 'Acción no válida']);
        break;
}
