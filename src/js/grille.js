// Classe pour gérer la grille du diagramme
export class Grille {
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

    this.dessinerLignes(maxCasesVerticales, maxCasesHorizontales);
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


  dessinerLignes(maxCasesVerticales, maxCasesHorizontales) {
    // 1. Dessiner les lignes horizontales
    for (let y = 0; y < maxCasesVerticales; y++) {
      this.ctx.beginPath();
      
      // Si c'est le sillet (y=0) et qu'on doit l'afficher
      if (y === 0 && this.options.dessineSillet) {
        this.ctx.lineWidth = this.options.epaisseurLigne * 2;
      } else {
        this.ctx.lineWidth = this.options.epaisseurLigne;
      }

      for (let x = 0; x < maxCasesHorizontales - 1; x++) {
        const x1 = this.getx(x, y);
        const y1 = this.gety(x, y);
        const x2 = this.getx(x + 1, y);
        const y2 = this.gety(x + 1, y);
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
      }
      this.ctx.stroke();
    }

    // 2. Dessiner les lignes verticales
    this.ctx.lineWidth = this.options.epaisseurLigne;
    this.ctx.beginPath();
    for (let x = 0; x < maxCasesHorizontales; x++) {
      for (let y = 0; y < maxCasesVerticales - 1; y++) {
        const x1 = this.getx(x, y);
        const y1 = this.gety(x, y);
        const x2 = this.getx(x, y + 1);
        const y2 = this.gety(x, y + 1);
        // On dépasse un peu pour que les angles soient propres
        this.ctx.moveTo(x1, y1 - this.ctx.lineWidth / 2);
        this.ctx.lineTo(x2, y2 + this.ctx.lineWidth / 2);
      }
    }
    this.ctx.stroke();
  }


  getPoint(x, y, coord) {
    try {
      const point = this.pointsGrille[x + this.options.tailleGrillex * y];
      if (!point) throw new Error(`Point (${x},${y}) inexistant`);
      return point[coord];
    } catch (error) {
      console.error(`Erreur dans getPoint(${x}, ${y}, ${coord}) : ${error.message}`);
      throw error;
    }
  }

  getx(x, y) { return this.getPoint(x, y, 'x'); }
  gety(x, y) { return this.getPoint(x, y, 'y'); }


// ✅ Uniformiser et déclencher un redessin
  setCouleurGrille(couleurGrille) {
    this.options.couleurGrille = couleurGrille;
    this.dessineGrille(); // redessiner
  }

  setTaille(maTaille) {
    this.taille = maTaille;
    this.options.taille = maTaille; // garder la synchro ou supprimer l'un des deux
    this.dessineGrille();
  }

}
