<?php
// Script de log robuste avec diagnostic

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Activer le rapport d'erreurs pour le debug (à désactiver en prod plus tard)
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['tag']) && isset($data['object'])) {
        $tag = $data['tag'];
        $object = $data['object'];
        
        // On essaye de créer le dossier 'logs' au même niveau que le script
        // C'est souvent plus facile pour les permissions
        $logDir = __DIR__ . '/logs';
        
        if (!is_dir($logDir)) {
            if (!mkdir($logDir, 0777, true)) {
                $error = error_get_last();
                echo json_encode(["status" => "error", "message" => "Impossible de créer le dossier logs. Erreur PHP : " . $error['message']]);
                exit;
            }
        }
        
        $date = date('Y-m-d');
        $filename = $logDir . '/' . $date . '.log';
        
        $timestamp = date('Y-m-d H:i:s');
        $logLine = "$timestamp $tag,$object" . PHP_EOL;
        
        // On essaye d'écrire et on vérifie le résultat
        if (file_put_contents($filename, $logLine, FILE_APPEND) === false) {
            $error = error_get_last();
            echo json_encode(["status" => "error", "message" => "Impossible d'écrire dans le fichier. Erreur PHP : " . $error['message']]);
            exit;
        }
        
        echo json_encode(["status" => "success", "file" => $filename]);
        exit;
    }
}

echo json_encode(["status" => "error", "message" => "Données invalides"]);
?>
