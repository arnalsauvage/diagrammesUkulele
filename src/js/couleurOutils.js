// Classe pour gérer les couleurs des outils
class CouleurOutils {
  constructor() {
    this.couleurRemplissage = "#ff4444";
    this.couleurReperes = "#ffb0b0";
    this.couleurTrait = "#000000";
    this.couleurGrille = "#333333";
    this.couleurFond = "#FFFFFF";
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

// Exporter les classes en tant qu'objet
// export default CouleurOutils;