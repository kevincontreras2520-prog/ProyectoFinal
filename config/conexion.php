<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Lectura de variables de entorno (Railway o Local)
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
    // Muestra el detalle exacto del error para diagnosticar fácilmente
    echo json_encode([
        'error' => true, 
        'mensaje' => 'Error de BD: ' . $e->getMessage()
    ]);
    exit();
}
?>
