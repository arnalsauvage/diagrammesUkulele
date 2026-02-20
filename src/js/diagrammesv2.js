
    // Exemple d'initialisation du diagramme
    document.addEventListener("DOMContentLoaded", () => {
      // console.log("DOM complètement chargé et analysé."); // Ajoutez un log pour vérifier

      // ✅ Documenter et lier aux constantes existantes
      const options = {
        taille: 50,                          // taille d'une case en pixels
        tailleGrillex: CORDES_MAX,           // 4 cordes - lié à la constante !
        tailleGrilley: 6,                    // frettes affichées
        margeHauteurGrille: 35,              // px, espace pour le nom de l'accord
        margeGaucheGrille: 20,               // px
        epaisseurLigne: 9,                   // px
        couleurGrille: "#444444",
        bGrilleTordue: true,
      };


      window.diagramme = new DessineDiagrammeUkulele("diagramme1", options);
  window.diagramme.startup();
  checkcaseDepartAuto();
});

