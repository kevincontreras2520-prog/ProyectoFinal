<?php

require_once 'config/conexion.php';
if (!isset($_SESSION['usuario_id'])) {
    header("Location: login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Blog - Proyecto Final</title>
    <link rel="stylesheet" href="css/estilos.css">
</head>
<body>
    <div class="header-bar">
        <h2>📚 Módulo de Blog</h2>
        <a href="principal.php" class="btn btn-primary">⬅ Volver al Menú</a>
    </div>

    <div style="max-width:900px; margin:0 auto; padding: 20px;">
        <div style="background:#fff; padding:20px; border-radius:8px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <h3>Publicar un Post</h3>
            <input type="text" id="blog-titulo" placeholder="Título del artículo" style="width: 100%; margin-bottom: 10px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            <textarea id="blog-contenido" placeholder="Escribe tu artículo..." style="width: 100%; height: 100px; margin-bottom: 10px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
            <button onclick="crearPost()" class="btn btn-success">Publicar Artículo</button>
        </div>

        <h2>Publicaciones Recientes</h2>
        <div id="blog-box">Cargando publicaciones...</div>
    </div>

    <script src="js/blog.js"></script>
    <script>
        // Iniciar la carga de posts
        if (typeof cargarPosts === 'function') {
            cargarPosts();
        }
    </script>
</body>
</html>