
// Classe pour gérer la grille du diagramme
class Grille {
  constructor(canvas, taille, options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.taille = taille;
    this.options = options;
    this.pointsGrille = [];
  }

  // Fonction utilitaire pour obtenir un entier aléatoire entre 0 et n-1
  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  dessineGrille() {
    const maxCasesVerticales = this.options.tailleGrilley;
    const maxCasesHorizontales = this.options.tailleGrillex;

    this.pointsGrille = this.creerPointsGrille(maxCasesVerticales, maxCasesHorizontales);

    this.ctx.strokeStyle = this.options.couleurGrille;
    this.ctx.lineWidth = this.options.epaisseurLigne;
    this.ctx.beginPath();

    this.dessinerLignes(maxCasesVerticales, maxCasesHorizontales);
    this.ctx.stroke();
  }

// Créer les points de la grille
  creerPointsGrille(maxCasesVerticales, maxCasesHorizontales) {
    const points = [];
    for (let y = 0; y < maxCasesVerticales; y++) {
      for (let x = 0; x < maxCasesHorizontales; x++) {
        let posX = this.options.margeGaucheGrille + x * this.taille;
        let posY = this.options.margeHauteurGrille + y * this.taille;

        if (this.options.bGrilleTordue && this.getRandomInt(120) < this.taille) {
          posX += this.getRandomInt(3) - 1;
          posY += this.getRandomInt(3) - 1;
        }
        points.push({ x: posX, y: posY });
      }
    }
    return points;
  }

// Dessiner les lignes de la grille
  dessinerLignes(maxCasesVerticales, maxCasesHorizontales) {
    for (let y = 0; y < maxCasesVerticales; y++) {
      for (let x = 0; x < maxCasesHorizontales; x++) {
        this.dessinerLigneHorizontale(x, y, maxCasesHorizontales);
        this.dessinerLigneVerticale(x, y, maxCasesVerticales);
      }
    }
  }

// Dessiner une ligne horizontale
  dessinerLigneHorizontale(x, y, maxCasesHorizontales) {
    if (x < maxCasesHorizontales - 1) {
      const x1 = this.getx(x, y);
      const y1 = this.gety(x, y);
      const x2 = this.getx(x + 1, y);
      const y2 = this.gety(x + 1, y);

      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);

      if (y === 0) {
        // Premier trait horizontal deux fois plus épais
        this.ctx.moveTo(
            x1 - this.options.epaisseurLigne / 2,
            y1 - this.options.epaisseurLigne
        );
        this.ctx.lineTo(
            x2 + this.options.epaisseurLigne / 2,
            y2 - this.options.epaisseurLigne
        );
      }
    }
  }

// Dessiner une ligne verticale
  dessinerLigneVerticale(x, y, maxCasesVerticales) {
    if (y < maxCasesVerticales - 1) {
      const x1 = this.getx(x, y);
      const y1 = this.gety(x, y);
      const x2 = this.getx(x, y + 1);
      const y2 = this.gety(x, y + 1);

      this.ctx.moveTo(x1, y1 - this.options.epaisseurLigne / 2);
      this.ctx.lineTo(x2, y2 + this.options.epaisseurLigne / 2);
    }
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
    try {
      return this.pointsGrille[x + this.options.tailleGrillex * y].y;
    } catch (error) {
      console.error(
        `Erreur dans getx : x = ${x}, y = ${y}, message = ${error.message}`
      );
      throw error; // Rejette l'erreur après l'avoir loguée
    }
  }

  setCouleurGrille(couleurGrille) {
    this.options.couleurGrille = couleurGrille;
  }

  setTaille(maTaille) {
    this.options.taille = maTaille;
    this.taille = maTaille;
  }
}

// Exporter les classes en tant qu'objet
// export default Grille;
