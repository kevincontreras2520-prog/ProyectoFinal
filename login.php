<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Iniciar Sesión - Proyecto Web</title>
    <link rel="stylesheet" href="css/css.css">
</head>
<body class="body-center">
    <div class="panel-auth">
        <h2 class="panel-titulo">Iniciar Sesión</h2>
        <p class="panel-subtitulo">Ingresa tus credenciales</p>
        
        <input type="email" id="auth-correo" placeholder="Correo Electrónico">
        <input type="password" id="auth-password" placeholder="Contraseña">
        
        <button onclick="iniciarSesion()" class="btn btn-primary btn-block">Entrar</button>
        <p class="texto-enlace">¿No tienes cuenta? <a href="registro.php">Regístrate</a></p>
    </div>
    <script src="js/auth.js"></script>
</body>
</html>