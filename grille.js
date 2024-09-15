// Classe pour gérer les couleurs des outils
class CouleurOutils {
  constructor() {
    this.couleurRemplissage = "#ff4444";
    this.couleurReperes = "#ffb0b0";
    this.couleurTrait = "#000000";
    this.couleurGrille = "#444444";
  }

  updateColors(
    couleurRemplissage,
    couleurReperes,
    couleurTrait,
    couleurGrille
  ) {
    this.couleurRemplissage = couleurRemplissage;
    this.couleurReperes = couleurReperes;
    this.couleurTrait = couleurTrait;
    this.couleurGrille = couleurGrille;
  }
}
// Classe pour gérer la grille du diagramme
class Grille {
  constructor(canvas, taille, options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.taille = taille;
    this.options = options;
    this.pointsGrille = [];
  }

  dessineGrille() {
    let maxCasesVerticales = this.options.tailleGrilley - 1;
    let  maxCasesHorizontales = this.options.tailleGrillex;

    this.pointsGrille = [];

    // Création des points de la grille
    for (let y = 0; y <= maxCasesVerticales; y++) {
      for (let x = 0; x < this.options.tailleGrillex; x++) {
        let posX = this.options.margeGaucheGrille + x * this.taille;
        let posY = this.options.margeHauteurGrille + y * this.taille;
        if (this.options.bGrilleTordue && getRandomInt(120) < this.taille) {
          posX += getRandomInt(3) - 1;
          posY += getRandomInt(3) - 1;
        }
        this.pointsGrille.push({ x: posX, y: posY });
      }
    }

    // Dessin des lignes de la grille
    this.ctx.strokeStyle = this.options.couleurGrille;
    this.ctx.lineWidth = this.options.epaisseurLigne;
    this.ctx.beginPath();
    for (let y = 0; y < maxCasesVerticales + 1; y++) {
      for (let x = 0; x < maxCasesHorizontales; x++) {
        let x1 = this.getx(x, y);
        let y1 = this.gety(x, y);

        let x2, x3, y2, y3;

        if (y < maxCasesVerticales ) {
          x3 = this.getx(x, y + 1);
          y3 = this.gety(x, y + 1);
        }
        if (x !== 3) {
          x2 = this.getx(x + 1, y);
          y2 = this.gety(x + 1, y);
        }

        // Traits  horizontaux (3 x par ligne) n+1 fois
        if (x !== 3) {
          this.ctx.moveTo(x1, y1);
          this.ctx.lineTo(x2, y2);
        }

        // Traits verticaux
        if (y < maxCasesVerticales) {
          this.ctx.moveTo(x1, y1 - this.options.epaisseurLigne / 2);
          this.ctx.lineTo(x3, y3 + this.options.epaisseurLigne / 2);
        }
      }
    }
    this.ctx.strokeStyle = this.options.couleurGrille;
    this.ctx.stroke();
  }

  getx(x, y) {
    try {
      return this.pointsGrille[x + this.options.tailleGrillex * y].x;
    } catch (error) {
      console.error(
        `Erreur dans getx : x = ${x}, y = ${y}, message = ${error.message}`
      );
      throw error; // Rejette l'erreur après l'avoir loguée
    }
  }

  gety(x, y) {
    return this.pointsGrille[x + this.options.tailleGrillex * y].y;
  }

  setCouleurGrille(couleurGrille) {
    this.options.couleurGrille = couleurGrille;
  }

  setTaille(maTaille) {
    this.options.taille = maTaille;
    this.taille = maTaille;
  }
}
