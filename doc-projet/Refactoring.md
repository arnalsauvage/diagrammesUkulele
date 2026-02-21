# Plan de Refactoring - Atelier Ukulélé Canopée

Ce document liste les améliorations techniques nécessaires pour transformer le prototype actuel en une application robuste, maintenable et sécurisée.

## Analyse et Priorisation (MoSCoW)

| Réf. | Sujet | Coût | Bénéfices | Risques | Impact User | Priorité |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Passage à Vite & Modules ES** | Moyen | Très Élevé | Moyen | Faible | **Must** |
| **2** | **Sécurité PHP (Validation/Quota)** | Faible | Moyen | Faible | Nul | **Must** |
| **3** | **Centralisation du localStorage** | Faible | Moyen | Faible | Nul | **Should** |
| **4** | **DRY : Unification Logique UI** | Faible | Moyen | Moyen | Nul | **Should** |
| **5** | **Harmonisation Langue (Français)** | Faible | Moyen | Nul | Nul | **Could** |
| **6** | **Accessibilité (ARIA/Alt text)** | Moyen | Moyen | Faible | Moyen | **Could** |
| **7** | **Renommage .htm -> .html** | Très Faible| Faible | Nul | Nul | **Won't** |

---

## Détails des Chantiers

### 1. Modernisation de l'Architecture (Must)
*   **Action** : Installer **Vite.js** et convertir le code en **Modules ES** (`import`/`export`).
*   **Objectif** : Supprimer la pollution de `globalThis`, gérer les dépendances proprement et permettre la minification.
*   **Solution technique** : Créer un `index.js` comme point d'entrée, exporter les classes `DessineDiagrammeUkulele`, etc.

### 2. Sécurisation des Logs (Must)
*   **Action** : Renforcer `log_interaction.php`.
*   **Objectif** : Empêcher le spam et l'injection de scripts.
*   **Solution technique** : 
    *   Utiliser `filter_var` pour nettoyer les entrées.
    *   Vérifier la taille du fichier log avant écriture (limite à 1Mo/jour).
    *   Ajouter un jeton de sécurité simple (CSRF ou clé API interne).

### 3. Centralisation des Données (Should)
*   **Action** : Créer un fichier de constantes pour le `localStorage` et la configuration.
*   **Objectif** : Éviter les erreurs de frappe sur les clés de stockage et faciliter la maintenance.
*   **Solution technique** : Regrouper dans `config.js` : `STORAGE_KEYS = { FAVS: '...', PALETTES: '...' }`.

### 4. Unification de la Logique de Dessin (Should)
*   **Action** : Fusionner la logique de création des miniatures.
*   **Objectif** : Respecter le principe DRY (Don't Repeat Yourself).
*   **Solution technique** : Créer une méthode statique ou un helper `DiagrammeFactory.createThumbnail(container, data)`.

### 5. Harmonisation du Code (Could)
*   **Action** : Traduire tout le code source (variables, fonctions, commentaires) en **Français**.
*   **Objectif** : Cohérence totale pour les développeurs de l'association.
*   **Exemple** : `logInteraction` -> `enregistreInteraction`, `objectData` -> `donneesObjet`.

### 6. Accessibilité (Could)
*   **Action** : Générer des descriptions textuelles pour les diagrammes Canvas.
*   **Objectif** : Rendre l'outil utilisable par les non-voyants.
*   **Solution technique** : Ajouter un attribut `aria-label` dynamique sur le canvas décrivant l'accord (ex: "Accord de Sol Majeur, cordes 0 2 3 2").

### 7. Cosmétique système (Won't)
*   **Action** : Renommer les fichiers `.htm` en `.html`.
*   **Objectif** : Respecter les standards web modernes.
*   **Note** : Faible priorité car purement esthétique.

---
*Document généré le 21/02/2026 pour l'Asso Canopée.*
