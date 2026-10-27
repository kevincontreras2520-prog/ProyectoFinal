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
    <title>Módulo de Foro</title>
    <link rel="stylesheet" href="css/css.css">
</head>
<body>
    <div class="header-bar">
        <h2>📋 Módulo de Foro</h2>
        <a href="principal.php" class="btn btn-primary">⬅ Volver al Menú</a>
    </div>

    <div class="contenedor-principal">
        
        <!-- VISTA 1: LISTA DE TEMAS -->
        <div id="vista-temas">
            <div class="tarjeta-formulario">
                <h3 class="titulo-seccion">Crear nuevo Tema de Debate</h3>
                <input type="text" id="foro-titulo" placeholder="Título del debate" maxlength="255">
                <textarea id="foro-contenido" placeholder="Explica tu tema..." maxlength="2000"></textarea>
                <button onclick="crearHilo()" class="btn btn-success btn-block">Publicar Tema</button>
            </div>

            <h2 class="titulo-seccion">Temas de Discusión</h2>
            <div id="foro-box">Cargando temas...</div>
        </div>

        <!-- VISTA 2: RESPUESTAS DE UN TEMA -->
        <div id="vista-respuestas" style="display:none;">
            <button onclick="volverATemas()" class="btn btn-primary" style="margin-bottom: 15px;">⬅ Volver a los Temas</button>
            
            <div class="tarjeta-formulario">
                <h3 id="titulo-tema-actual" class="titulo-seccion" style="color: #007bff;">Tema</h3>
                <div id="lista-respuestas" style="margin-bottom: 20px;"></div>
                
                <hr style="border:0; border-top:1px solid #eee; margin: 20px 0;">
                
                <h4>Tu Respuesta:</h4>
                <textarea id="nueva-respuesta" placeholder="Escribe tu respuesta aquí..." maxlength="1000"></textarea>
                <button onclick="enviarRespuesta()" class="btn btn-primary btn-block">Enviar Respuesta</button>
            </div>
        </div>

    </div>

    <script src="js/foro.js"></script>
    <script>
        cargarHilos();
    </script>
</body>
</html>
