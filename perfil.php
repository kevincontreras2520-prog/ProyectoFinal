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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Perfil</title>
    <link rel="stylesheet" href="css/css.css">
</head>
<body class="body-center">
    <div class="panel-auth">
        <h2 class="panel-titulo">Mi Perfil</h2>
        
        <label class="label-avatar">Cambiar Avatar:</label>
        <div class="avatar-grid" id="avatarPicker">
            <div class="avatar-item" onclick="seleccionarAvatar('😀')">😀</div>
            <div class="avatar-item" onclick="seleccionarAvatar('😎')">😎</div>
            <div class="avatar-item" onclick="seleccionarAvatar('🤖')">🤖</div>
            <div class="avatar-item" onclick="seleccionarAvatar('🦊')">🦊</div>
            <div class="avatar-item" onclick="seleccionarAvatar('🐱')">🐱</div>
            <div class="avatar-item" onclick="seleccionarAvatar('😜')">😜</div>
        </div>

        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
        
        <h3>Cambiar Contraseña</h3>
        <input type="password" id="pass-actual" placeholder="Contraseña Actual">
        <input type="password" id="pass-nueva" placeholder="Nueva Contraseña">
        
        <button onclick="guardarPerfil()" class="btn btn-success btn-block">Guardar Cambios</button>
        <a href="principal.php" class="btn btn-primary btn-block" style="margin-top:10px;">⬅ Volver al Menú</a>
    </div>

    <script>
        let avatarSeleccionado = '😀'; // Aquí guardaremos el avatar nuevo

        function seleccionarAvatar(emoji) {
            avatarSeleccionado = emoji;
            document.querySelectorAll('#avatarPicker .avatar-item').forEach(el => {
                el.classList.toggle('seleccionado', el.innerText === emoji);
            });
        }

        function guardarPerfil() {
            const passActual = document.getElementById('pass-actual').value;
            const passNueva = document.getElementById('pass-nueva').value;

            fetch('api/index.php?modulo=auth&accion=actualizar_perfil', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ avatar: avatarSeleccionado, pass_actual: passActual, pass_nueva: passNueva })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.mensaje);
                if (!data.error) window.location.href = 'principal.php';
            });
        }
    </script>
</body>
</html>
