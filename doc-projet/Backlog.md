# Backlog projet diagrammes ukulélé

### Mettre en place des tests autos Cypress ou Vitest

### Mettre en place des tests unitaires Vitest

### Gestion des barrés
Proposer une option de présentation d'une position avec barrés ou sans


## DOING

### Passage à Vite & Modules ES
**En tant que** développeur, **je veux** utiliser un outil de build moderne et une structure de modules, **afin de** supprimer la pollution de l'espace global, gérer les dépendances proprement et optimiser l'application (minification).
*   **Action** : Initialiser npm, installer Vite.js.
*   **Refacto** : Convertir les fichiers JS en modules ES (`export`/`import`).
*   **Nettoyage** : Supprimer l'usage abusif de `globalThis`.
*   **Entrée** : Créer un point d'entrée unique (`main.js`).

## DONE

### Ajouter des favoris 20/02/2026
  Etq utilisateur, je peux cocher un accord comme "favori" pour le repérer plus facilement.
  Par ailleurs, les accords favoris seront présentés en priorité par l'appli aux utilisateurs.
  Les favoris sont stockés dans le localstorage

  Attention, c'est bien une des positions d'accord qui doit être mise en favori, et pas
  juste l'accord... Exemple on met en favori la position 2120 pour le F#m du coup, parmi
  toutes les positions possibles poue un F#m la  2120 est notée en favorite

### Responsive 20/02/2026
la page doit se recharger dès qu'un point est modifié sur le diagramme.
si la recherche identifie un accord, son nom est modifié pour correspondre

### palette de la page 21/02/2026
  en tant qu'asso Canopée, je veux que la palette de la page soit conforme à mes couleurs, comme dans l'image
  doc-projet\palette-canopee.png

### pied de page 21/02/2026
  ETQ Canopée je veux mettre en avant mes sites dans le bas de page :

```html
<div class="starter-template">
Canopee Musique - Partoches :
<a href="https://canopee-musique.fr" target="_blank">Site web</a> |
<a href="http://partoches.canopee-musique.fr" target="_blank">Partoches</a> |
<a href="https://ateliers.canopee-musique.fr" target="_blank">Ateliers uku en ligne</a> |
<a href="https://www.youtube.com/@ArnaudMedina" target="_blank" title="YouTube">
<img src="https://cdn3.iconfinder.com/data/icons/peelicons-vol-1/50/YouTube-128.png" width="30" height="30" alt="YouTube" style="vertical-align:middle;">
</a> |
<a href="https://bsky.app/profile/arnaud-ukulele.bsky.social" target="_blank" title="Bluesky" style="margin-left:10px;"> |
<img src="../../images/icones/bluesky.png" width="30" height="30" alt="Bluesky" style="vertical-align:middle;">
</a>
</div>
```

### Collecte de données 21/02/2026
  En tant qu'admin Canopée, je voudrais bénéficier des interactions de mes utilisateurs avec l'application,
  pour définir les accords les plus populaires. Aussi, sans mettre en place de bdd, je voudrais mettre dans un dossier
  log les interactions des utilisateurs. La mise en favori sera un tag addFavori. On fera un fichier de log par jour
  la ligne comme par heure minute seconde, nomTag, objet
  exemple : 2026-02-20 12:00:00 addFavori,D7|2.0.2.0
  On peut ajouter comme tag les "télécharger" , nom de tag download,A7|0.1.0.0 sur le clic sur le bouton télécharger

### présentation de la page 21/02/2026
  modifier le look de la page html
  logo canopéee à gauche du titre, de la meme hauteur que le titre, Titre, et, à droite les outils langue...

### mini diagrammes alternatifs mieux 'cadrés' 21/02/2026
pour l'instant les mini diagrammes d'alternatives sont affichés frette 0...
Il faudrait les afficher à la bonne frette : la première frette jouée

### Ui 

#### supprimer le bouton actualiser 21/02/2026
On peut supprimer le  bouton "Actualiser" car l'appli s'actualise toute seule maintenant !

#### masquer le bouton db 21/02/2026
Le bouton "db" ne devrait être actif qu'en mod dev débugage pour se générer les accords... On pourrait ajouter un
fichier config qui indique si on est en dev ou en prod

#### Ajustements UX 21/02/2026
- On a perdu les bulles d'aide pour les champs de recherche ? Elles ne s'affichent plus
- les zones de saisie pour les noms des accords sont trop longues, 12 caractères max serait mieux
- pareil pour les noms des positions

### mes palettes 21/02/2026
ETQ Utilisateur, je peux sauvegarder des palettes de couleurs et leur donner un nom.
Elles sont stockées dans mon localstorage.
Je peux me créer jusqu'à 3 palettes, assortiments de réglages de couleur

### Proposer un lien "partager cet accord" 21/02/2026
Proposer un lien vers le diagramme de l'accord pour pouvoir le partager

### Refacto resolution dette technique build Vite 21/02/2026



### Afficher l'accord du jour 21/02/2026
Afficher l'accord du jour dans la page d'accueil
