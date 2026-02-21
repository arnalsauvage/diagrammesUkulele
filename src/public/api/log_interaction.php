<?php
// Script de log sécurisé pour les interactions utilisateurs Canopée

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Désactiver l'affichage des erreurs en production
ini_set('display_errors', 0);
error_reporting(0);

// Jeton de sécurité simple (doit correspondre à celui dans src/js/config.js)
$SECURITY_TOKEN = "canopee-stats-2026-secure";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // 1. Vérification du jeton de sécurité
    if (!isset($data['token']) || $data['token'] !== $SECURITY_TOKEN) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Accès refusé"]);
        exit;
    }

    if (isset($data['tag']) && isset($data['object'])) {
        // 2. Nettoyage des entrées avec filter_var
        $tag = filter_var($data['tag'], FILTER_SANITIZE_SPECIAL_CHARS);
        $object = filter_var($data['object'], FILTER_SANITIZE_SPECIAL_CHARS);
        
        // Limiter la longueur pour éviter les abus
        $tag = substr($tag, 0, 50);
        $object = substr($object, 0, 255);

        $logDir = __DIR__ . '/logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $date = date('Y-m-d');
        $filename = $logDir . '/' . $date . '.log';
        
        // 3. Vérification de la taille du fichier (Limite à 1 Mo par jour)
        $max_size = 1024 * 1024; // 1 Mo
        if (file_exists($filename) && filesize($filename) > $max_size) {
            echo json_encode(["status" => "error", "message" => "Quota de log journalier atteint"]);
            exit;
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $logLine = "$timestamp $tag,$object" . PHP_EOL;
        
        if (file_put_contents($filename, $logLine, FILE_APPEND) !== false) {
            echo json_encode(["status" => "success"]);
            exit;
        }
    }
}

http_response_code(400);
echo json_encode(["status" => "error", "message" => "Requête invalide"]);
?>
