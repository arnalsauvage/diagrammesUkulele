document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("accordsSaisis");
    const button = document.getElementById("btnMajAccords");
    const container = document.getElementById("listeAccords");

    const renderAccords = () => {
        container.innerHTML = "";
        const accordsSaisis = input.value.trim().split(/\s+/);
        
        accordsSaisis.forEach((nom, index) => {
            if (!nom) return;

            // Créer un conteneur pour ce diagramme
            const wrapper = document.createElement("div");
            wrapper.style.display = "inline-block";
            wrapper.style.margin = "10px";
            wrapper.style.textAlign = "center";
            wrapper.style.background = "white";
            wrapper.style.padding = "10px";
            wrapper.style.borderRadius = "8px";
            wrapper.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

            const canvasId = `chord-${index}`;
            const canvas = document.createElement("canvas");
            canvas.id = canvasId;
            // Taille réduite pour la grille
            canvas.width = 120; 
            canvas.height = 180;
            
            wrapper.appendChild(canvas);
            container.appendChild(wrapper);

            // Initialiser le dessin
            const options = {
                taille: 25, // Plus petit que la page principale
                tailleGrillex: 4,
                tailleGrilley: 6,
                margeHauteurGrille: 25,
                margeGaucheGrille: 15,
                epaisseurLigne: 2,
                couleurGrille: "#444444",
                bGrilleTordue: true,
            };

            // On crée un mini-pont pour adapter à DessineDiagrammeUkulele
            // qui attend des inputs réels. On va lui donner des objets "mockés" 
            // ou adapter un peu DessineDiagrammeUkulele si besoin.
            // Pour l'instant on va utiliser une version simplifiée ou adapter l'existant.
            
            // On va tricher un peu en créant des éléments invisibles pour satisfaire le constructeur
            const mockValues = document.createElement("input");
            mockValues.value = tableauAccords[nom] || "0000";
            const mockName = document.createElement("input");
            mockName.value = nom;
            const mockCaseAuto = document.createElement("input");
            mockCaseAuto.type = "checkbox";
            mockCaseAuto.checked = true;
            const mockCase = document.createElement("input");
            mockCase.value = "1";

            // On remplace temporairement getElementById pour ce canvas
            const originalGetId = document.getElementById;
            document.getElementById = (id) => {
                if (id === canvasId) return canvas;
                if (id === "valeurs") return mockValues;
                if (id === "name") return mockName;
                if (id === "caseDepartAuto") return mockCaseAuto;
                if (id === "caseDepart") return mockCase;
                if (id === "couleurRemplissage") return { value: "#FF5555" };
                if (id === "couleurReperes") return { value: "#FFBBBB" };
                if (id === "couleurTrait") return { value: "#111111" };
                if (id === "couleurGrille") return { value: "#333333" };
                if (id === "popupMessage") return { style: {} };
                return originalGetId.call(document, id);
            };

            const diag = new DessineDiagrammeUkulele(canvasId, options);
            diag.dessineDiagramme();

            // Restaurer getElementById
            document.getElementById = originalGetId;
        });
    };

    button.addEventListener("click", renderAccords);
    
    // Rendu initial
    renderAccords();
});
