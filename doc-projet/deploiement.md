# Guide de Déploiement - Atelier Ukulélé Canopée

Ce document explique comment générer la version de production de l'application et la mettre en ligne sur votre hébergement PHP.

## 🚀 Étape 1 : Préparation locale

Avant d'envoyer les fichiers, vous devez "compiler" l'application pour qu'elle soit optimisée.

1.  Ouvrez un terminal à la racine du projet.
2.  Lancez la commande suivante :
    ```powershell
    npm run build
    ```
3.  Vite va générer un dossier nommé **`dist`** à la racine du projet. Ce dossier contient la version finale, optimisée et prête à l'emploi.

## 📂 Étape 2 : Contenu du dossier `dist`

Le dossier `dist` est structuré ainsi :
*   `index.html` : L'application principale (Atelier).
*   `accords.html` : Le générateur de grille.
*   `assets/` : Contient le JavaScript et le CSS minifiés.
*   `api/` : Contient votre script PHP `log_interaction.php` (copié automatiquement depuis `src/public/api`).
*   `images/` : Vos icônes et images (logo, clé de sol, etc.).

## 📤 Étape 3 : Mise en ligne (FTP)

1.  Connectez-vous à votre serveur via votre client FTP (FileZilla, WinSCP, etc.).
2.  Naviguez jusqu'au dossier racine de votre site (généralement `www/` ou `public_html/`).
3.  **Transférez le CONTENU du dossier `dist`** vers le serveur.
    *   *Note : Ne transférez pas le dossier `dist` lui-même, mais bien les fichiers et dossiers qui sont à l'intérieur.*

## ⚙️ Configuration du Serveur PHP

### Permissions pour les logs
Pour que le système de statistiques fonctionne, le serveur PHP doit avoir le droit d'écrire dans le dossier `api`.
1.  Une fois les fichiers envoyés, assurez-vous que le dossier `/api` sur votre serveur possède les droits d'écriture (CHMOD 755 ou 777 selon votre hébergeur).
2.  Le dossier `api/logs/` sera créé automatiquement lors de la première interaction utilisateur.

### URL du site
L'application est conçue pour fonctionner à la racine de votre domaine ou dans un sous-dossier. Si vous l'installez dans un sous-dossier (ex: `mon-site.fr/ukulele/`), assurez-vous de mettre à jour la configuration si nécessaire.

---
*Dernière mise à jour : 21/02/2026*
