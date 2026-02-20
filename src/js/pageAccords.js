document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("accordsSaisis");
    const button = document.getElementById("btnMajAccords");
    const container = document.getElementById("listeAccords");

    const renderAccords = () => {
        container.innerHTML = "";
        const accordsSaisis = input.value.trim().split(/\s+/);
        
        accordsSaisis.forEach((nom, index) => {
            if (!nom) return;

            // Créer un wrapper pour le style
            const wrapper = document.createElement("div");
            wrapper.style.display = "inline-block";
            wrapper.style.margin = "10px";
            wrapper.style.background = "white";
            wrapper.style.padding = "10px";
            wrapper.style.borderRadius = "8px";
            wrapper.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

            const canvas = document.createElement("canvas");
            wrapper.appendChild(canvas);
            container.appendChild(wrapper);

            // Utiliser la classe avec une taille fixe pour la grille
            const options = {
                taille: 30, // Un peu plus grand pour la lisibilité
                tailleGrillex: 4,
                tailleGrilley: 6,
                isMiniature: true,
                bGrilleTordue: true
            };

            const diag = new DessineDiagrammeUkulele(canvas, options);
            
            // Chercher la position et dessiner
            const pos = tableauAccords[nom] || "0000";
            diag.penseDiagrammeUkulele.setNomAccord(nom);
            diag.penseDiagrammeUkulele.setValeursByString(pos);
            diag.dessineDiagramme();
        });
    };

    button.addEventListener("click", renderAccords);
    renderAccords();
});
