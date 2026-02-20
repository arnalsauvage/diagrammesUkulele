# Backlog projet diagrammes ukulélé

## Ui

- mes palettes
ETQ Utilisateur, je peux sauvegarder des palettes de couelurs et leur donner un nom. Elles sont dans mon localstorage
doc-projet\palette-canopee.png

- palette de la page 
en tant qu'asso Canopée, je veux que la palette de la page soit conforme à mes couleurs, comme dans l'image 

- pied de page
ETQ Canopée je veux mettre en avant mes sites dans le bas de page : 


```html
<div class="starter-template">
            <br>
            Canopee Musique - Partoches :
<a href="https://canopee-musique.fr" target="_blank">Site web</a> |
<a href="http://partoches.canopee-musique.fr" target="_blank">Partoches</a>

|

<a href="https://ateliers.canopee-musique.fr" target="_blank">Ateliers uku en ligne</a>
|

    <a href="https://www.youtube.com/@ArnaudMedina" target="_blank" title="YouTube">
        <img src="https://cdn3.iconfinder.com/data/icons/peelicons-vol-1/50/YouTube-128.png" width="30" height="30" alt="YouTube" style="vertical-align:middle;">
    </a>

|

<a href="https://bsky.app/profile/arnaud-ukulele.bsky.social" target="_blank" title="Bluesky" style="margin-left:10px;">

|

  <img src="../../images/icones/bluesky.png" width="30" height="30" alt="Bluesky" style="vertical-align:middle;">
</a>


            <br>
            <a href="../../html/mentionsLegales.html" target="_blank" class="lienMentionsLegales">Mentions légales</a>
            <a href="../../html/merci.html" target="_blank" class="lienMentionsLegales">Mercis</a>

            <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr.min.js"></script>
            <script src="../../js/precise-star-rating.js"></script>
        </div>

```


- mini diagrammes alternatifs mieux 'cadrés'
pour l'instant les mini diagrammes d'alternatives sont affichés frette 0... Il faudrait les afficher à la bonne frette : la première fette jouée

## DOING

- Ajouter des favoris
  Etq utilisateur, je peux cocher un accord comme "favori" pour le repérer plus facilement.
  Par ailleurs, les accords favoris seront présentés en priorité par l'appli aux utilisateurs.
  Les favoris sont stockés dans le localstorage
    
  Attention, c'est bien une des positions d'accord qui doit être mise en favori, et pas
  juste l'accord... Exemple on met en favori la position 2120 pour le F#m du coup, parmi 
  toutes les positions possibles poue un F#m la  2120 est notée en favorite


## DONE

- Responsive
la page doit se recharger dès qu'un point est modifié sur le diagramme.
si la recherche identifie un accord, son nom est modifié pour correspondre
