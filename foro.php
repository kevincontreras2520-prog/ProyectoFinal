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
    <title>Módulo de Foro</title>
    <link rel="stylesheet" href="css/css.css">
</head>
<body>
    <div class="header-bar">
        <h2>📋 Módulo de Foro</h2>
        <a href="principal.php" class="btn btn-primary">⬅ Volver al Menú</a>
    </div>

    <div style="max-width:900px; margin:0 auto;">
        <div style="background:#fff; padding:20px; border-radius:8px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <h3>Crear nuevo Hilo de Debate</h3>
            <input type="text" id="foro-titulo" placeholder="Título del debate">
            <textarea id="foro-contenido" placeholder="Explica tu tema..."></textarea>
            <button onclick="crearHilo()" class="btn btn-success">Publicar Hilo</button>
        </div>

        <h2>Hilos de Discusión</h2>
        <div id="foro-box">Cargando hilos...</div>
    </div>

    <script src="js/foro.js"></script>
    <script>cargarHilos();</script>
</body>
</html>