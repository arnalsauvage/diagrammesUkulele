
    // Exemple d'initialisation du diagramme
    document.addEventListener("DOMContentLoaded", () => {
      // console.log("DOM complètement chargé et analysé."); // Ajoutez un log pour vérifier

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

  window.diagramme = new DessineDiagrammeUkulele("diagramme1", options);
  window.diagramme.startup();
  checkcaseDepartAuto();
});

