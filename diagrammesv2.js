// Classe pour gérer le diagramme du ukulélé
class DiagrammeUkulele {
  constructor(canvasId, options) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.taille = options.taille;
    this.grille = new Grille(this.canvas, this.taille, options);
    this.couleurOutils = new CouleurOutils();
    this.valeurs = document.getElementById("valeurs");
    this.nomAccord = document.getElementById("name");
    this.caseDepart = document.getElementById("caseDepart");
    this.caseDepartAuto = document.getElementById("caseDepartAuto");
    this.tableauAccords = {}; // À remplir avec les accords
  }

  startup() {
    // Initialisation des couleurs des outils
    this.updateColors();

    // Gestion des événements de changement de couleur
    document
      .querySelector("#couleurRemplissage")
      .addEventListener("input", this.updateColors.bind(this));
    document
      .querySelector("#couleurReperes")
      .addEventListener("input", this.updateColors.bind(this));
    document
      .querySelector("#couleurTrait")
      .addEventListener("input", this.updateColors.bind(this));
    document
      .querySelector("#couleurGrille")
      .addEventListener("input", this.updateColors.bind(this));

    this.canvas.addEventListener("click", this.clicSurDiagramme.bind(this));
    document
      .getElementById("loupeChercheAccordParNom")
      .addEventListener("touchend", this.chercheAccordParNom.bind(this));
    document
      .getElementById("loupeChercheAccordParValeurs")
      .addEventListener("touchend", this.chercheAccordParPosition.bind(this));

    this.changeTaille(this.taille);
    this.dessineDiagramme();
  }

  // Cette méthode applique les changements de couleurs
  // Todo à réécrire !
  updateColors() {
    this.couleurOutils.updateColors(
      document.querySelector("#couleurRemplissage").value,
      document.querySelector("#couleurReperes").value,
      document.querySelector("#couleurTrait").value,
      document.querySelector("#couleurGrille").value
    );
    this.grille.setCouleurGrille(
      document.querySelector("#couleurGrille").value
    );
    this.dessineDiagramme();
  }

  // Change la taille du diagramme
  changeTaille(nouvelleTaille) {
    this.taille = nouvelleTaille;
    this.grille.taille = nouvelleTaille;
    this.grille.options.epaisseurLigne = nouvelleTaille / 12;
    this.grille.options.margeHauteurGrille = (nouvelleTaille * 70) / 50;
    this.grille.options.margeGaucheGrille = (nouvelleTaille * 2) / 3;
    this.canvas.width = 4 * nouvelleTaille;
    this.canvas.height = 7 * nouvelleTaille;
    this.grille.setTaille(nouvelleTaille);
  }

  // Cette méthode relance le dessin du diagramme avec son style
  dessineDiagramme() {
    this.blank();
    this.grille.dessineGrille();
    let fretteZeroDuDiagramme = this.calculeCaseDepart(this.valeurs.value) - 1;

    // Dessiner les repères de frettes
    const reperesSimples = [5, 7, 10, 15];
    for (const numeroFretteRepere of reperesSimples) {
      if (
        numeroFretteRepere >= fretteZeroDuDiagramme &&
        numeroFretteRepere <= fretteZeroDuDiagramme + 5
      ) {
        this.repereSimple(numeroFretteRepere, fretteZeroDuDiagramme);
      }
    }

    if (fretteZeroDuDiagramme >= 8 && fretteZeroDuDiagramme <= 13) {
      this.repereDouble(12 - fretteZeroDuDiagramme);
    }

    this.ctx.strokeStyle = this.couleurOutils.couleurTrait;
    this.ctx.lineWidth = this.grille.options.epaisseurLigne;
    this.ctx.strokeStyle = this.couleurOutils.couleurRemplissage;
    this.metLesDoigts(this.valeurs.value);
    this.ecritNomAccord(this.nomAccord.value);
    this.ctx.stroke();
  }

  // Cette méthode dessine un repère simple sur le manche : un rond au centre
  repereSimple(numeroFretteDuRepere, fretteZeroDuDiagramme) {
    this.ctx.beginPath();
    this.ctx.lineWidth = this.grille.options.taille / 30;
    this.ctx.strokeStyle = this.couleurOutils.couleurReperes;
    this.ctx.fillStyle = this.couleurOutils.couleurReperes;
    let caseDuPoint = numeroFretteDuRepere - fretteZeroDuDiagramme;
    let monx = this.grille.options.margeGaucheGrille + 1.5 * this.taille;
    let mony =
      this.grille.options.margeHauteurGrille +
      caseDuPoint * this.taille -
      this.taille / 2;

    if (caseDuPoint > 0) {
      this.ctx.arc(monx, mony, this.taille / 6, 0, 2 * Math.PI);
      this.ctx.fill();
    }
    this.ctx.stroke();
  }

  // Cette méthode dessine un repère double sur le manche : deux ronds au centre
  repereDouble(numeroFretteDuRepere) {
    this.ctx.lineWidth = this.grille.options.taille / 30;
    this.ctx.strokeStyle = this.couleurOutils.couleurReperes;
    this.ctx.fillStyle = this.couleurOutils.couleurReperes;
    let marge = this.taille / 4;
    let x1 = this.grille.options.margeGaucheGrille + 1.5 * this.taille;
    let y1 =
      this.grille.options.margeHauteurGrille +
      (12 - numeroFretteDuRepere) * this.taille -
      this.taille / 2;
    let x2 = this.grille.options.margeGaucheGrille + 3.5 * this.taille;
    let y2 =
      this.grille.options.margeHauteurGrille +
      (12 - numeroFretteDuRepere) * this.taille -
      this.taille / 2;

    this.ctx.beginPath();
    this.ctx.arc(x1, y1, marge, 0, 2 * Math.PI);
    this.ctx.arc(x2, y2, marge, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }

  // Calcule la case de départ qui semble le plus appropriée pour la position
  calculeCaseDepart(valeurs) {
    let caseDepart = 1;
    // Si l'utilisateur a choisi une caseDepartAuto
    if (!document.getElementById("caseDepartAuto").checked) {
      if (
        this.getValeurCaseMin(valeurs) > 1 &&
        this.getValeurCaseMax(valeurs) > 5
      ) {
        caseDepart = this.getValeurCaseMin(valeurs);
      }
    } else {
      caseDepart = document.getElementById("caseDepart").value;
      console.log(
        "caseDepart : " + document.getElementById("caseDepart").value
      );
    }
    return caseDepart;
  }

  // Cette méthode ajoute les ronds sur le diagramme correspondants aux positions appuyées
  // Todo : ajouter la gestion des barrés !
  metLesDoigts(valeurs) {
    // Ecrit la frette de départ si ce n'est pas zéro
    let caseDepart = this.calculeCaseDepart(valeurs);
    if (caseDepart > 1) {
      this.ctx.beginPath();
      this.ctx.font = "bold " + this.taille / 1.8 + "px Verdana, Arial, serif";
      this.ctx.fillStyle = this.couleurOutils.couleurTrait;
      this.ctx.fillText(
        caseDepart.toString(),
        this.grille.options.margeGaucheGrille - 0.45 * this.taille,
        this.grille.options.margeHauteurGrille + 0.7 * this.taille
      );
      this.ctx.stroke();
    }

    for (let corde = 0; corde < 4; corde++) {
      // Si la corde n'est pas jouée, on dessine une croix
      if (isNaN(valeurs[corde])) {
        this.dessinePoint(corde + 1, valeurs[corde]);
      } else {
        let numeroFrette = parseInt(valeurs[corde]);
        if (numeroFrette === 0) {
          this.dessinePoint(corde + 1, 0);
        }
        if (caseDepart > 0) {
          this.dessinePoint(corde + 1, numeroFrette - caseDepart + 1);
        } else {
          this.dessinePoint(corde + 1, numeroFrette);
        }
      }
    }
  }

  // dessine un point représentant un doigt sur le diagramme
  dessinePoint(nCorde, nfrette) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.couleurOutils.couleurTrait;
    this.ctx.lineWidth = this.taille / 20;
    let monx =
      this.grille.options.margeGaucheGrille + (nCorde - 1) * this.taille;
    let mony;
    // Corde jouée
    if (nfrette > 0) {
      this.ctx.fillStyle = this.couleurOutils.couleurRemplissage;
      mony =
        this.grille.options.margeHauteurGrille +
        nfrette * this.taille -
        this.taille / 2;
      this.ctx.arc(monx, mony, this.taille / 4, 0, 2 * Math.PI);
      this.ctx.fill();
    }
    // Corde à vide
    if (nfrette === 0) {
      this.ctx.fillStyle = this.couleurOutils.couleurFond;
      mony = this.grille.options.margeHauteurGrille;
      this.ctx.arc(monx, mony, this.taille / 6, 0, 2 * Math.PI);
      this.ctx.fill();
    }
    // Corde non jouée
    if (nfrette === "x") {
      mony = this.grille.options.margeHauteurGrille;
      this.ctx.strokeStyle = this.couleurOutils.couleurTrait;
      this.ctx.lineWidth = this.taille / 10;
      const ecart = this.taille / 6;
      this.ctx.moveTo(monx - ecart, mony - ecart);
      this.ctx.lineTo(monx + ecart, mony + ecart);
      this.ctx.moveTo(monx + ecart, mony - ecart);
      this.ctx.moveTo(monx + ecart, mony - ecart);
      this.ctx.lineTo(monx - ecart, mony + ecart);
    }
    this.ctx.stroke();
  }

  // Cette méthode ecrit le nom de l'accord en haut du diagramme
  ecritNomAccord(nomAccord) {
    this.ctx.fillStyle = this.couleurOutils.couleurTrait;
    this.ctx.font = "bold " + this.taille + "px Verdana, Arial, serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(nomAccord, this.canvas.width / 2, this.taille / 2);
  }

  clicSurDiagramme(event) {
    // Gérer le clic sur le diagramme, pour interagir avec les éléments

    let relatifX =
      event.clientX -
      this.grille.options.margeGaucheGrille -
      document.getElementById("diagramme1").getBoundingClientRect().left;
    let relatifY =
      event.clientY -
      this.grille.options.margeHauteurGrille -
      document.getElementById("diagramme1").getBoundingClientRect().top;

    console.log(`event.clientX: ${event.clientX}`);
    console.log(`event.clientY: ${event.clientY}`);
    console.log(`margeGaucheGrille: ${this.grille.options.margeGaucheGrille}`);
    console.log(
      `margeHauteurGrille: ${this.grille.options.margeHauteurGrille}`
    );
    console.log(
      `diagramme1 bounding rect:`,
      document.getElementById("diagramme1").getBoundingClientRect()
    );
    console.log(`taille: ${taille}`);
    relatifX = Math.round(relatifX / this.taille);
    relatifY = Math.round(relatifY / this.taille + 0.5);

    console.log(`Coordonnées du clic: (${relatifX}, ${relatifY})`);
    console.log("Clic sur relatif " + relatifX + " y : " + relatifY);

    if (relatifX < 4 && relatifY < 6) {
      let position = document.getElementById("valeurs");
      // Convertir la chaîne en un tableau de caractères
      let valeurArray = position.value.split("");
      // Modifier l'élément souhaité
      if (relatifX < valeurArray.length) {
        valeurArray[relatifX] = relatifY.toString(); // Assurez-vous que relatifY est converti en chaîne
      }

      // Reconvertir le tableau en une chaîne et mettre à jour la valeur de l'élément
      position.value = valeurArray.join("");
      let maNouvelleChaine = "";
      for (let i = 0; i < 4; i++) {
        if (i === relatifX) {
          maNouvelleChaine += relatifY;
        } else {
          maNouvelleChaine += position.value.substr(i, 1);
        }
      }
      console.log("nouvelle position : " + maNouvelleChaine);
      position.value = maNouvelleChaine;
      dessineDiagramme();
    }
  }

  chercheAccordParNom() {
    let nom = this.nomAccord.value;
    // Logique pour chercher un accord par nom et mettre à jour le diagramme
    console.log(`Cherche accord par nom: ${nom}`);
    let accord = document.getElementById("name").value;
    let saisieValeurs = document.getElementById("valeurs");
    saisieValeurs.value = tableauAccords[accord];
    dessineDiagramme();
  }

  chercheAccordSuivant() {
    let accord = document.getElementById("name").value;

    // Trouver l'index de l'accord actuel dans le tableau
    let index = Object.keys(tableauAccords).indexOf(accord);

    if (index !== -1 && index < Object.keys(tableauAccords).length - 1) {
      // Passer à l'accord suivant (n+1)
      let prochainAccord = Object.keys(tableauAccords)[index + 1];

      // Afficher l'accord suivant dans la zone de saisie
      let saisieValeurs = document.getElementById("valeurs");
      saisieValeurs.value = tableauAccords[prochainAccord];

      let saisieNom = document.getElementById("name");
      saisieNom.value = prochainAccord;

      // Mettre à jour le diagramme
      dessineDiagramme();

      console.log(`Accord suivant: ${prochainAccord}`);
    } else {
      console.log("Pas d'accord suivant disponible.");
    }
  }

  chercheAccordPrecedent() {
    let accord = document.getElementById("name").value;

    // Trouver l'index de l'accord actuel dans le tableau
    let index = Object.keys(tableauAccords).indexOf(accord);

    if (index > 0) {
      // Passer à l'accord précédent (n-1)
      let accordPrecedent = Object.keys(tableauAccords)[index - 1];

      // Afficher l'accord précédent dans la zone de saisie
      let saisieValeurs = document.getElementById("valeurs");
      saisieValeurs.value = tableauAccords[accordPrecedent];

      let saisieNom = document.getElementById("name");
      saisieNom.value = accordPrecedent;

      // Mettre à jour le diagramme
      dessineDiagramme();

      console.log(`Accord précédent: ${accordPrecedent}`);
    } else {
      console.log("Pas d'accord précédent disponible.");
    }
  }

  chercheAccordParPosition() {
    // Logique pour chercher un accord par position et mettre à jour le diagramme
    console.log(`Cherche accord par valeurs: ${valeurs}`);
    let position = document.getElementById("valeurs").value;
    //ex : tableauAccords["C"] = "0003";
    let saisieName = document.getElementById("name");
    saisieName.value = "non repertorié";
    for (let key in tableauAccords) {
      if (tableauAccords[key] === position) {
        saisieName.value = key;
        break;
      }
    }
    dessineDiagramme();
  }

  calculeCaseDepart(valeurs) {
    // Calculer la case de départ en fonction des valeurs
    // On masque l'alerte par défaut
    document.getElementById("popupMessage").style.display = "none";
    let caseDepart = 1;
    // Si l'utilisateur a choisi une caseDepartAuto
    if (document.getElementById("caseDepartAuto").checked) {
      if (
        this.getValeurCaseMin(valeurs) > 1 &&
        this.getValeurCaseMax(valeurs) > 5
      ) {
        caseDepart = this.getValeurCaseMin(valeurs) - 1;
      }
    } else {
      caseDepart = parseInt(document.getElementById("caseDepart").value, 10);
      if (
        caseDepart > this.getValeurCaseMin(valeurs) ||
        caseDepart + 4 < this.getValeurCaseMax(valeurs)
      ) {
        // Afficher une alerte à l'utilisateur : certaines notes ne seront pas visible !
        // alert("La case de départ que vous avez choisie ne correspond pas à la plage de notes");
        document.getElementById("popupMessage").style.display = "block";
      }
      console.log(
        "caseDepart : " + document.getElementById("caseDepart").value
      );
    }
    return caseDepart;
  }

  blank() {
    // Efface le canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Tire un accord au hasard dans la bibliothèque !
  setAccordAuHasard() {
    const accords = Object.keys(tableauAccords);
    let nombreDaccords = accords.length;
    const numeroAccord = getRandomInt(nombreDaccords);
    let saisieName = document.getElementById("name");
    saisieName.value = accords[numeroAccord];
    // console.log("Saisiename : " + accords[numeroAccord]);
    this.chercheAccordParNom();
  }

  // trouve la frette la plus basse jouée dans l'accord
  getValeurCaseMin(valeurs) {
    let valMin = 12;
    for (let compteur = 0; compteur < 4; compteur++) {
      if (valeurs[compteur] > 0 && valeurs[compteur] < valMin) {
        valMin = valeurs[compteur];
      }
    }
    // console.log("CaseMin  de " + valeurs + " = " + valMin);
    return parseInt(valMin);
  }

  // trouve la frette la plus hautee jouée dans l'accord
  getValeurCaseMax(valeurs) {
    let valMax = 0;
    for (let compteur = 0; compteur < 4; compteur++) {
      if (valeurs[compteur] > 0 && valeurs[compteur] > valMax) {
        valMax = valeurs[compteur];
      }
    }
    // console.log("CaseMax  de " + valeurs + " = " + valMax);
    return parseInt(valMax);
  }

  // Transformer en lien de download l'élément el
  // pour télécharger le diagramme affiché avec le nom d'accord - position comme nom de fichier
  download_img(el) {
    let lienDownload = document.getElementById("download");
    let nomAccord = document.getElementById("name").value;
    let position = document.getElementById("valeurs").value;

  // Générer le nom de fichier dynamique
  lienDownload.download = nomAccord + "-" + position + ".jpg";
  console.log("Nom de fichier:", lienDownload.download);

  // Générer l'URL de téléchargement à partir du canvas
    let canvas = document.getElementById("diagramme1");
    el.href = canvas.toDataURL("image/jpg");
    console.log("Lien href:", el.href);
  }
}

// Fonction utilitaire pour obtenir un entier aléatoire entre 0 et n-1
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

let diagramme;
// Exemple d'initialisation du diagramme
document.addEventListener("DOMContentLoaded", () => {
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
  diagramme.startup();
  checkcaseDepartAuto();
});
