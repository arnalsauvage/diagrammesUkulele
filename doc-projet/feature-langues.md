# Gestion des Langues (i18n)

Ce projet utilise un système simple et léger pour gérer le multilingue (Français et Anglais).

## Structure des fichiers
- **`src/js/i18n.js`** : Contient le dictionnaire de traductions et la logique de basculement.
- **`src/pageDiagrammes.htm`** (et autres pages) : Utilisent des attributs spécifiques pour marquer les éléments à traduire.

## Comment ça fonctionne ?

### 1. Le dictionnaire de traductions
Dans `i18n.js`, l'objet `translations` contient les clés et leurs valeurs pour chaque langue :

```javascript
const translations = {
    fr: {
        title: "Atelier Diagrammes Ukulélé",
        // ...
    },
    en: {
        title: "Ukulele Chord Workshop",
        // ...
    }
};
```

### 2. Traduction automatique (HTML)
Pour traduire un élément HTML, ajoutez l'attribut `data-i18n` avec la clé correspondante :

```html
<!-- Traduit le texte intérieur (innerHTML) -->
<h1 data-i18n="title">Atelier Diagrammes Ukulélé</h1>

<!-- Traduit la valeur (pour les boutons) -->
<input type="button" data-i18n="refresh" value="Actualiser">
```

La méthode `translatePage()` parcourt tous les éléments ayant cet attribut au chargement de la page.

### 3. Traduction manuelle (JavaScript)
Pour obtenir une traduction dans votre code JavaScript, utilisez `window.i18n.t(key)` :

```javascript
const label = window.i18n.t('playable'); // Retourne "Jouable" ou "Playable"
```

### 4. Variables dans les traductions
Certaines clés supportent le remplacement de variables (ex: `{n}`) :

```javascript
const msg = window.i18n.t('alternativesMsg').replace('{n}', count);
```

### 5. Persistance
La langue choisie est sauvegardée dans le `localStorage`. Au rechargement, le système tente de récupérer la langue sauvegardée, sinon il détecte la langue du navigateur.

## Ajouter une nouvelle langue
1. Ajoutez une nouvelle entrée (ex: `es: { ... }`) dans l'objet `translations` de `i18n.js`.
2. Ajoutez un drapeau ou un bouton de sélection dans le HTML avec l'attribut `data-lang="es"`.
