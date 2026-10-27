<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'proyecto_web';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';
$port = getenv('DB_PORT') ?: '3306';

try {
    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    // Guardamos el error real en el log del servidor (para el programador)
    error_log("Error de BD: " . $e->getMessage());
    
    // Mostramos un mensaje genérico (para el usuario)
    echo json_encode([
        'error' => true, 
        'mensaje' => 'Error interno del servidor. Por favor, intenta más tarde.'
    ]);
    exit();
}
?>
