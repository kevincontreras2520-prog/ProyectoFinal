<?php
// api/controladores/auth_controller.php

$accion = $_GET['accion'] ?? '';

switch ($accion) {
    case 'registro':
        $data = json_decode(file_get_contents("php://input"), true);
        
        $nombre = trim($data['nombre'] ?? '');
        $correo = trim($data['correo'] ?? '');
        $password = trim($data['password'] ?? '');
        $avatar = $data['avatar'] ?? '👤';

        if (empty($nombre) || empty($correo) || empty($password)) {
            echo json_encode(['error' => true, 'mensaje' => 'Todos los campos son obligatorios.']);
            exit;
        }

        try {
            // Verificar si el correo ya existe
            $stmtCheck = $pdo->prepare("SELECT id FROM usuarios WHERE correo = :c");
            $stmtCheck->execute([':c' => $correo]);
            if ($stmtCheck->fetch()) {
                echo json_encode(['error' => true, 'mensaje' => 'El correo ya está registrado.']);
                exit;
            }

            // Inserción segura: ROL 'user' (En inglés, como dice la base de datos)
            $passHash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, correo, password, avatar, rol) VALUES (:n, :c, :p, :a, 'user')");
            $stmt->execute([
                ':n' => $nombre,
                ':c' => $correo,
                ':p' => $passHash,
                ':a' => $avatar
            ]);

            echo json_encode(['error' => false, 'mensaje' => 'Registro exitoso.']);
        } catch (PDOException $e) {
            echo json_encode(['error' => true, 'mensaje' => 'Error de BD: ' . $e->getMessage()]);
        }
        break;

    case 'login':
        $data = json_decode(file_get_contents("php://input"), true);
        $correo = $data['correo'] ?? '';
        $password = $data['password'] ?? '';

        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE correo = :c");
        $stmt->execute([':c' => $correo]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            if ($user['baneado']) {
                echo json_encode(['error' => true, 'mensaje' => 'Cuenta suspendida.']);
                exit;
            }
            $_SESSION['usuario_id'] = $user['id'];
            echo json_encode(['error' => false, 'mensaje' => 'Login exitoso']);
        } else {
            echo json_encode(['error' => true, 'mensaje' => 'Credenciales incorrectas']);
        }
        break;

    case 'logout':
        session_destroy();
        echo json_encode(['error' => false, 'mensaje' => 'Sesión cerrada']);
        break;

    case 'verificar_sesion':
        $usuario_id = $_SESSION['usuario_id'] ?? null;
        if (!$usuario_id) {
            echo json_encode(['autenticado' => false]);
            exit;
        }
        $stmt = $pdo->prepare("SELECT id, nombre, correo, avatar, rol FROM usuarios WHERE id = :id");
        $stmt->execute([':id' => $usuario_id]);
        $user = $stmt->fetch();
        echo json_encode(['autenticado' => true, 'usuario' => $user]);
        break;

    case 'actualizar_perfil':
        $usuario_id = $_SESSION['usuario_id'] ?? null;
        if (!$usuario_id) {
            echo json_encode(['error' => true, 'mensaje' => 'No autenticado']);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $avatar = $data['avatar'] ?? '😀';
        $passActual = $data['pass_actual'] ?? '';
        $passNueva = $data['pass_nueva'] ?? '';

        try {
            // 1. Actualizar Avatar
            $stmt = $pdo->prepare("UPDATE usuarios SET avatar = :a WHERE id = :id");
            $stmt->execute([':a' => $avatar, ':id' => $usuario_id]);

            // 2. Si escribió una contraseña nueva, verificarla y cambiarla
            if (!empty($passNueva)) {
                $stmtUser = $pdo->prepare("SELECT password FROM usuarios WHERE id = :id");
                $stmtUser->execute([':id' => $usuario_id]);
                $user = $stmtUser->fetch();

                if (password_verify($passActual, $user['password'])) {
                    $nuevoHash = password_hash($passNueva, PASSWORD_DEFAULT);
                    $stmtPass = $pdo->prepare("UPDATE usuarios SET password = :p WHERE id = :id");
                    $stmtPass->execute([':p' => $nuevoHash, ':id' => $usuario_id]);
                } else {
                    echo json_encode(['error' => true, 'mensaje' => 'La contraseña actual es incorrecta.']);
                    exit;
                }
            }

            echo json_encode(['error' => false, 'mensaje' => 'Perfil actualizado con éxito.']);
        } catch (PDOException $e) {
            echo json_encode(['error' => true, 'mensaje' => 'Error: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['error' => true, 'mensaje' => 'Acción no válida']);
        break;
}
?>
