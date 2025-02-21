// tests/diagrammeUkulele.test.js
import DiagrammeUkulele from '../src/js/DessineDiagrammeUkulele.js';
import * as test from "node:test";

describe('TEstDiagrammeUkulele', () => {
  let diagramme;

  beforeEach(() => {
    // Créez une instance de DiagrammeUkulele avant chaque test
    document.body.innerHTML = `  <h1>Atelier diagrammes ukulélé Top 5</h1>
    <a href="./pageAccords.htm">aller à la page grille</a>
    <br />
    <canvas height="330" id="diagramme1" width="190"></canvas>

    <div class="form-group">
      <label for="name">Nom de l'accord :</label>
      <input
        id="name"
        maxlength="8"
        minlength="1"
        name="name"
        size="8"
        type="text"
        value="Dm7"
        onkeyup="if(event.keyCode===13) chercherAccordParNom()"
      />
      <span role="img" aria-label="loupe" onclick="chercherAccordParNom()"
        >🔍</span
      >
      <img
        src="../images/petite-info-bulle.png"
        alt="cherche accord"
        id="loupeChercheAccordParNom"
        class="infobulle-icone"
        width="16"
        height="15"
        onmouseover="afficher_aide(document.getElementById('aide_nomaccord'))"
        onmouseout="masquer_aide(document.getElementById('aide_nomaccord'))"
      />
    </div>

    <div class="infobulle">
      <div class="infobulle-texte" id="aide_nomaccord" style="display: none">
        A B C D E F G pour la si do re mi fa sol , <br />b pour bémol, # pour
        dièse, <br />
        désignation des accords : A, Am, A7M pour la 7ème majeure Am7, Asus2
        <br />
        Asus4, Aaug pour la 5ème augmentée, Aaug7, Adim, Adim7, A5, A6, Am6
      </div>
    </div>

    <div class="form-group">
      <label for="valeurs">Valeurs (0 à 9):</label>
      <input
        id="valeurs"
        maxlength="4"
        minlength="1"
        name="valeurs"
        size="4"
        type="text"
        value="2210"
        onkeyup="if(event.keyCode===13) chercherAccordParPosition()"
      />
      <span
        onclick="chercherAccordParPosition()"
        id="loupeChercheAccordParValeurs"
        >🔍</span
      >
    </div>
    <div
      id="popupMessage"
      style="
        display: none;
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #f8d7da;
        color: #721c24;
        padding: 20px;
        border: 1px solid #f5c6cb;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        z-index: 1000;
      "
    >
      <p>
        La case de départ que vous avez choisie ne correspond pas à la plage de
        notes.<br />
        Certaines notes ne seront pas affichées.
      </p>
    </div>
    <script>
      function afficherPopup() {
        document.getElementById("popupMessage").style.display = "block";
      }

      function masquerPopup() {
        document.getElementById("popupMessage").style.display = "none";
      }
    </script>

    <div class="form-group">
      <label for="caseDepart">Case de départ (auto)</label>
      <input
        id="caseDepart"
        type="number"
        min="1"
        max="12"
        value="1"
        style="display: none"
        onclick="dessineDiagramme();"
      />
      <input
        type="checkbox"
        id="caseDepartAuto"
        onchange="checkcaseDepartAuto(); dessineDiagramme();"
        checked
      />
    </div>
    <button id="button-dessine" class="leBouton" onclick="dessineDiagramme();">
      dessine
    </button>
    <div>
      <input
        id="couleurGrille"
        name="couleurGrille"
        type="color"
        value="#333333"
      />
      <label for="couleurGrille">couleur de traits pour la grille</label>
    </div>
    <div>
      <input
        id="couleurTrait"
        name="couleurTrait"
        type="color"
        value="#111111"
      />
      <label for="couleurTrait">couleur de traits pour les ronds et le nom de l'accord</label>
    </div>

    <div>
      <input
        id="couleurRemplissage"
        name="couleurRemplissage"
        type="color"
        value="#FF5555"
      />
      <label for="couleurRemplissage"
        >couleur de remplissage pour les ronds</label
      >
    </div>

    <div>
      <input
        id="couleurReperes"
        name="couleurReperes"
        type="color"
        value="#FF9090"
      />
      <label for="couleurReperes">couleur des repères sur le manche</label>
    </div>

    <div class="row">
      <label class="inline col-sm-3" for="fader">Taille :</label>
      <div class="col-sm-5">
        <input
          id="fader"
          max="50"
          min="10"
          name="ftempo"
          oninput="outputUpdate(value)"
          step="1"
          type="range"
          value="40"
        />
        <output class="inline col-sm-2" for="fader" id="taille">40</output>
      </div>
    </div>

    <div>
      <a
        class="leBouton"
        download="myImage.jpg"
        id="download"
        onclick="console.log('Test de clic'); diagramme.download_img(this);"
        >Télécharger Diagramme</a
      >
      <button class="leBouton" id="randomChord" onclick="setAccordAuHasard();">
        Accord au hasard
      </button>
      <button
        class="leBouton"
        id="btnPrecChord"
        onclick="diagramme.chercheAccordPrecedent();"
      >
        Accord précédent
      </button>
      <button
        class="leBouton"
        id="btnNextChord"
        onclick="diagramme.chercheAccordSuivant();"
      >
        Accord suivant
      </button>
    </div>`;
    // Exemple d'initialisation du diagramme

    const options = {
      taille: 50,
      tailleGrillex: 4,
      tailleGrilley: 6,
      margeHauteurGrille: 35,
      margeGaucheGrille: 20,
      epaisseurLigne: 9,
      couleurGrille: "#444444",
      bGrilleTordue: true,
    };
    diagramme = new DiagrammeUkulele("diagramme1", options);

    diagramme.valeurs = document.createElement('div');
    diagramme.valeurs.id = 'valeurs';
    document.body.appendChild(diagramme.valeurs);

    diagramme.nomAccord = document.createElement('div');
    diagramme.nomAccord.id = 'name';
    document.body.appendChild(diagramme.nomAccord);

    diagramme.caseDepart = document.createElement('div');
    diagramme.caseDepart.id = 'caseDepart';
    document.body.appendChild(diagramme.caseDepart);

    diagramme.caseDepartAuto = document.createElement('div');
    diagramme.caseDepartAuto.id = 'caseDepartAuto';
    document.body.appendChild(diagramme.caseDepartAuto);
    diagramme.valeurs = "2210";
    diagramme.nomAccord = document.getElementById("name");
    diagramme.caseDepart = 1;
    diagramme.caseDepartAuto = document.getElementById("caseDepartAuto");
    diagramme.startup();
    checkcaseDepartAuto();
  
  });

  test('should initialize with correct options', () => {
    expect(diagramme.taille).toBe(50);
    expect(diagramme.grille.options.epaisseurLigne).toBe(9);
  });

  test('should draw the diagram correctly', () => {
    // Vous pouvez simuler le dessin et vérifier les résultats
    expect(diagramme.calculeCaseDepart("2102")).toBe(0  );
    // Ajoutez des assertions pour vérifier l'état du canvas ou d'autres propriétés
  });

  // Ajoutez d'autres tests pour les méthodes de la classe
});