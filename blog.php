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
    <title>Blog - Proyecto Final</title>
    <link rel="stylesheet" href="css/css.css">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
    <div class="header-bar">
        <h2>📰 Módulo de Blog</h2>
        <a href="principal.php" class="btn btn-primary">⬅ Volver al Menú</a>
    </div>

    <div class="contenedor-principal">
        
        <!-- Formulario para crear post -->
        <div class="tarjeta-formulario">
            <h3 class="titulo-seccion">¿Qué estás pensando?</h3>
            <input type="text" id="blog-titulo" placeholder="Título llamativo para tu artículo" maxlength="255">
            <textarea id="blog-contenido" placeholder="Escribe el contenido de tu artículo aquí..." maxlength="5000"></textarea>
            <button onclick="crearPost()" class="btn btn-success btn-block">Publicar Artículo</button>
        </div>

        <h2 class="titulo-seccion" style="text-align: left; margin-top: 30px;">Publicaciones Recientes</h2>
        
        <!-- Contenedor de Posts -->
        <div id="blog-box">
            <p style="text-align:center; color:gray;">Cargando publicaciones...</p>
        </div>

    </div>

    <script src="js/blog.js"></script>
    <script>
        if (typeof cargarPosts === 'function') {
            cargarPosts();
        }
    </script>
</body>
</html>
