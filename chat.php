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
    <title>Módulo de Chat</title>
    <link rel="stylesheet" href="css/css.css">
    <link rel="icon" type="x-icon" href="favicon.ico">
</head>
<body>
    <div class="header-bar">
        <h2>💬 Módulo de Chat</h2>
        <a href="principal.php" class="btn btn-primary">⬅ Volver al Menú</a>
    </div>

    <div class="chat-container">
        <div class="chat-sidebar">
            <h3>Contactos / Chats</h3>
            <div id="lista-usuarios">Cargando usuarios...</div>
        </div>

        <div class="chat-main">
            <h2 id="chat-titulo">💬 Sala General</h2>
            <div id="banner-fijado" class="banner-fijado" style="display:none;"></div>
            
            <div id="chat-box" class="caja-mensajes">Cargando mensajes...</div>

            <div style="display:flex; gap:10px;">
                <input type="text" id="chat-input" placeholder="Escribe un mensaje..." style="margin:0;" onkeypress="if(event.key === 'Enter') enviarMensaje()">
                <button onclick="enviarMensaje()" class="btn btn-primary">Enviar</button>
            </div>
        </div>
    </div>

    <script src="js/chat.js"></script>
    <script>inicializarChat();</script>
</body>
</html>
