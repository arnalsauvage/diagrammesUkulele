// Classe pour gérer les couleurs des outils
class CouleurOutils {

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

  couleurRemplissage = "#ff4444";
  couleurReperes = "#ffb0b0";
  couleurTrait = "#000000";
  couleurGrille = "#333333";
  couleurFond = "#FFFFFF";
}
