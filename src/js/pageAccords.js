import { DessineDiagrammeUkulele } from './DessineDiagrammeUkulele.js';
import { tableauAccords } from './accords.js';
import { i18n } from './i18n.js';
import { CONFIG } from './config.js';

document.addEventListener("DOMContentLoaded", () => {
    i18n.init();
    
    const versionEl = document.getElementById("app-version");
    if (versionEl) versionEl.textContent = `v${CONFIG.VERSION}`;
    
    const input = document.getElementById("accordsSaisis");
    const button = document.getElementById("btnMajAccords");
    const container = document.getElementById("listeAccords");

    const renderAccords = () => {
        container.innerHTML = "";
        if (!input.value) return;
        const accordsSaisis = input.value.trim().split(/\s+/);
        
        accordsSaisis.forEach((nom) => {
            if (!nom) return;

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

            const options = {
                taille: 30,
                tailleGrillex: 4,
                tailleGrilley: 6,
                isMiniature: true,
                bGrilleTordue: true
            };

            const diag = new DessineDiagrammeUkulele(canvas, options);
            
            const pos = tableauAccords[nom] || "0000";
            diag.penseDiagrammeUkulele.setNomAccord(nom);
            diag.penseDiagrammeUkulele.setValeursByString(pos);
            diag.dessineDiagramme();
        });
    };

    if (button) button.addEventListener("click", renderAccords);
    renderAccords();
});
