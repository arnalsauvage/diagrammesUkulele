import { DessineDiagrammeUkulele } from './DessineDiagrammeUkulele.js';

export class DiagrammeUIHelper {
    /**
     * Crée un mini-diagramme dans un conteneur donné
     * @param {HTMLElement} container - L'élément parent (ex: alternatives-container)
     * @param {Object} data - { name, position, isFavorite }
     * @param {Function} onClick - Action au clic sur la miniature
     */
    static createThumbnail(container, data, onClick) {
        const wrapper = document.createElement("div");
        wrapper.className = "diagram-thumbnail"; // Utiliser une classe CSS pour le style
        wrapper.style.cursor = "pointer";
        wrapper.style.border = "1px solid #ddd";
        wrapper.style.borderRadius = "4px";
        wrapper.style.padding = "2px";
        wrapper.style.background = data.isFavorite ? "#fff9c4" : "white";
        if (data.isFavorite) wrapper.style.borderColor = "gold";

        const canvas = document.createElement("canvas");
        canvas.width = 60;
        canvas.height = 90;
        wrapper.appendChild(canvas);
        container.appendChild(wrapper);

        const miniOptions = {
            taille: 12,
            tailleGrillex: 4,
            tailleGrilley: 6,
            margeHauteurGrille: 15,
            margeGaucheGrille: 8,
            epaisseurLigne: 1,
            couleurGrille: "#666",
            bGrilleTordue: false,
            isMiniature: true,
            isFavorite: data.isFavorite
        };

        const miniDiag = new DessineDiagrammeUkulele(canvas, miniOptions);
        miniDiag.penseDiagrammeUkulele.setNomAccord(data.name || "");
        miniDiag.penseDiagrammeUkulele.setValeursByString(data.position);
        
        const caseDep = miniDiag.penseDiagrammeUkulele.calculeCaseDepart();
        miniDiag.penseDiagrammeUkulele.setCaseDepart(caseDep);
        
        miniDiag.dessineDiagramme();

        if (onClick) {
            wrapper.addEventListener("click", () => onClick(data));
        }

        return miniDiag;
    }
}
