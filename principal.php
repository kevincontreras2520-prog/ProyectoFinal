<?php
require_once 'config/conexion.php';
if (!isset($_SESSION['usuario_id'])) {
    header("Location: login.php");
    exit();
}
// Verificar si está baneado
$stmtBan = $pdo->prepare("SELECT baneado FROM usuarios WHERE id = :id");
$stmtBan->execute([':id' => $_SESSION['usuario_id']]);
$userBan = $stmtBan->fetch();
if ($userBan && $userBan['baneado'] == 1) {
    session_destroy();
    header("Location: login.php?baneado=1");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menú Principal</title>
    <link rel="stylesheet" href="css/css.css">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
    <div class="header-bar">
        <div class="usuario-info-header">
            <span id="user-avatar" class="avatar-badge">😀</span>
            <div>
                <h2 id="user-nombre" class="header-titulo">Cargando...</h2>
                <small id="user-rol" class="rol-badge">USUARIO</small>
            </div>
        </div>
        <button onclick="cerrarSesion()" class="btn btn-danger">Cerrar Sesión</button>
    </div>

    <div class="contenedor-dashboard">
        <h1 class="titulo-dashboard">Plataforma Web Multiuso</h1>
        <p class="subtitulo-dashboard">Selecciona el módulo al que deseas acceder:</p>

        <div class="grid-modulos">
            <div class="tarjeta-modulo">
                <div class="icono-modulo">💬</div>
                <h3>Chat en Vivo</h3>
                <p>Chat general en vivo y salas de mensajes privados uno a uno.</p>
                <a href="chat.php" class="btn btn-primary btn-block">Entrar al Chat</a>
            </div>

            <div class="tarjeta-modulo">
                <div class="icono-modulo">📋</div>
                <h3>Foro de Debate</h3>
                <p>Crea hilos de discusión y responde temas de interés académico.</p>
                <a href="foro.php" class="btn btn-primary btn-block">Entrar al Foro</a>
            </div>

            <div class="tarjeta-modulo">
                <div class="icono-modulo">📰</div>
                <h3>Blog de Noticias</h3>
                <p>Publica artículos completos y comenta respuestas estilo Instagram.</p>
                <a href="blog.php" class="btn btn-primary btn-block">Entrar al Blog</a>
            </div>
        </div>
    </div>

    <script src="js/auth.js"></script>
    <script>verificarAccesoPrincipal();</script>
</body>
</html>
