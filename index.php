<?php
// Obtenemos la ruta que el usuario está intentando visitar
$ruta_solicitada = $_SERVER['REQUEST_URI'];

// Si la ruta es exactamente la raíz ('/' o '/index.php'), lo mandamos al login
if ($ruta_solicitada === '/' || $ruta_solicitada === '/index.php') {
    header("Location: login.php");
    exit();
} else {
    // Si intenta acceder a algo que no existe, forzamos el 404
    http_response_code(404);
    require '404.php';
    exit();
}
?>
