<?php
// api/controladores/auth_controller.php

$accion = $_GET['accion'] ?? '';

switch ($accion) {
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
    $usuario = $stmt->fetch();

    if ($usuario) {
        echo json_encode([
            'autenticado' => true,
            'usuario' => $usuario
        ]);
    } else {
        echo json_encode(['autenticado' => false]);
    }
    break;

  case 'registro':
    $data = json_decode(file_get_contents("php://input"), true);
    $nombre = trim($data['nombre'] ?? '');
    $correo = trim($data['correo'] ?? '');
    $password = $data['password'] ?? '';
    $avatar = $data['avatar'] ?? '😀';

    if (empty($nombre) || empty($correo) || empty($password)) {
        echo json_encode(['error' => true, 'mensaje' => 'Todos los campos son obligatorios.']);
        exit;
    }

    // Verificar si el correo ya existe
    $stmtCheck = $pdo->prepare("SELECT id FROM usuarios WHERE correo = :c");
    $stmtCheck->execute([':c' => $correo]);
    if ($stmtCheck->fetch()) {
        echo json_encode(['error' => true, 'mensaje' => 'El correo ya está registrado.']);
        exit;
    }

    // Encriptar contraseña y guardar usuario
    $passHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, correo, password, avatar, rol) VALUES (:n, :c, :p, :a, 'user')");
    $ok = $stmt->execute([
        ':n' => $nombre,
        ':c' => $correo,
        ':p' => $passHash,
        ':a' => $avatar
    ]);

    if ($ok) {
        echo json_encode(['error' => false, 'mensaje' => '¡Usuario registrado con éxito!']);
    } else {
        echo json_encode(['error' => true, 'mensaje' => 'Error al guardar el usuario.']);
    }
    break;
}
?>