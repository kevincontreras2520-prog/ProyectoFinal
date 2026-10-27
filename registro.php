<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro - Proyecto Web</title>
    <link rel="stylesheet" href="css/css.css">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body class="body-center">
    <div class="panel-auth">
        <h2 class="panel-titulo">Crear Cuenta</h2>
        <p class="panel-subtitulo">Regístrate para acceder al sistema</p>
        
        <input type="text" id="auth-nombre" placeholder="Tu Nombre Completo">
        <input type="email" id="auth-correo" placeholder="Correo Electrónico">
        <input type="password" id="auth-password" placeholder="Contraseña">
        
        <label class="label-avatar">Elige tu Avatar:</label>
        <div class="avatar-grid" id="avatarPicker">
            <div class="avatar-item seleccionado" onclick="seleccionarAvatar('😀')">😀</div>
            <div class="avatar-item" onclick="seleccionarAvatar('😎')">😎</div>
            <div class="avatar-item" onclick="seleccionarAvatar('🤖')">🤖</div>
            <div class="avatar-item" onclick="seleccionarAvatar('🦊')">🦊</div>
            <div class="avatar-item" onclick="seleccionarAvatar('🐱')">🐱</div>
            <div class="avatar-item" onclick="seleccionarAvatar('👑')">👑</div>
        </div>
        
        <button onclick="registrarUsuario()" class="btn btn-success btn-block">Registrarse</button>
        <p class="texto-enlace">¿Ya tienes cuenta? <a href="login.php">Inicia Sesión</a></p>
    </div>
    <script src="js/auth.js"></script>
</body>
</html>
