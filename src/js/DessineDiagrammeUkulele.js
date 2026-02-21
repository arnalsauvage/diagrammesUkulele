import { Grille } from './grille.js';
import { CouleurOutils } from './couleurOutils.js';
import { PenseDiagrammeUkulele } from './PenseDiagrammeUkulele.js';
import { UkuleleGCEA } from './Instrument.js';
import { ChordAnalyzer } from './ChordAnalyzer.js';
import { i18n } from './i18n.js';
import { StorageManager } from './StorageManager.js';
import { DiagrammeUIHelper } from './DiagrammeUIHelper.js';
import { tableauAccords } from './accords.js';
import { generatedChords } from './generatedChords.js';

const CORDES_MAX = 4;

export class DessineDiagrammeUkulele {
    constructor(canvasOrId, options) {
        this.canvas = (typeof canvasOrId === 'string') ? document.getElementById(canvasOrId) : canvasOrId;
        if (!this.canvas) throw new Error(`Canvas introuvable : ${canvasOrId}`);

        this.ctx = this.canvas.getContext("2d");
        this.options = options;
        this.taille = options.taille;
        this.grille = new Grille(this.canvas, this.taille, options);
        this.couleurOutils = new CouleurOutils();
        
        this.couleurOutils.updateColors("#FF5555", "#FFBBBB", "#111111", "#333333");
        this.changeTaille(this.taille);

        this.isFavorite = options.isFavorite || false; 

        if (options.isMiniature) {
            this.penseDiagrammeUkulele = new PenseDiagrammeUkulele("", "0000", -1);
        } else {
            this.inputValeurs = document.getElementById("valeurs");
            this.inputNomAccord = document.getElementById("name");
            this.inputCaseDepart = document.getElementById("caseDepart");
            this.inputCaseDepartAuto = document.getElementById("caseDepartAuto");
            this.penseDiagrammeUkulele = new PenseDiagrammeUkulele(this.inputNomAccord.value, this.inputValeurs.value, -1);
        }
    }

    startup() {
        if (this.options.isMiniature) return;
        this.updateColors();
        document.querySelector("#couleurRemplissage").addEventListener("input", () => { this.updateColors(); this.dessineDiagramme(); });
        document.querySelector("#couleurReperes").addEventListener("input", () => { this.updateColors(); this.dessineDiagramme(); });
        document.querySelector("#couleurTrait").addEventListener("input", () => { this.updateColors(); this.dessineDiagramme(); });
        document.querySelector("#couleurGrille").addEventListener("input", () => { this.updateColors(); this.dessineDiagramme(); });
        this.canvas.addEventListener("click", this.clicSurDiagramme.bind(this));
        this.changeTaille(this.taille);
        this.dessineDiagramme();
    }

    updateColors() {
        this.couleurOutils.updateColors(
            document.querySelector("#couleurRemplissage").value,
            document.querySelector("#couleurReperes").value,
            document.querySelector("#couleurTrait").value,
            document.querySelector("#couleurGrille").value
        );
        this.grille.setCouleurGrille(document.querySelector("#couleurGrille").value);
    }

    changeTaille(nouvelleTaille) {
        this.taille = nouvelleTaille;
        this.grille.taille = nouvelleTaille;
        this.grille.options.epaisseurLigne = nouvelleTaille / 12;
        this.grille.options.margeHauteurGrille = (nouvelleTaille * 70) / 50;
        this.grille.options.margeGaucheGrille = (nouvelleTaille * 2) / 3;
        this.canvas.width = 4 * nouvelleTaille;
        this.canvas.height = 7 * nouvelleTaille;
        this.grille.setTaille(nouvelleTaille);
    }

    blank() {
        this.ctx.fillStyle = this.couleurOutils.couleurFond;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    syncPenseToUI() {
        if (this.options.isMiniature) return;
        if (this.inputValeurs) this.inputValeurs.value = this.penseDiagrammeUkulele.chaineValeur();
        if (this.inputNomAccord) this.inputNomAccord.value = this.penseDiagrammeUkulele.nomAccord;
    }

    syncUIToPense() {
        if (this.options.isMiniature) return;
        this.penseDiagrammeUkulele.setValeursByString(this.inputValeurs.value);
        this.penseDiagrammeUkulele.setNomAccord(this.inputNomAccord.value);
        this.penseDiagrammeUkulele.setCaseDepart(this.inputCaseDepartAuto.checked ? -1 : Number(this.inputCaseDepart.value));
    }

    drawFavoriteIcon() {
        if (!this.ctx) return;
        const iconSize = this.taille * 0.8, margin = this.taille * 0.3;
        const x = this.canvas.width - margin - iconSize / 2, y = margin + iconSize / 2;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(x, y);
        this.ctx.rotate(Math.PI / 4);
        const numPoints = 5, outerRadius = iconSize / 2, innerRadius = iconSize / 4;
        this.ctx.moveTo(0, -outerRadius);
        for (let i = 0; i < numPoints * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = Math.PI / numPoints * i - Math.PI / 2;
            this.ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = 'gold';
        this.ctx.fill();
        this.ctx.strokeStyle = 'darkgoldenrod';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        this.ctx.restore();
    }

    dessineDiagramme() {
        this.blank();
        let caseDepartEffective = this.getCaseDepartEffective();
        this.grille.options.dessineSillet = (caseDepartEffective === 1);
        this.grille.dessineGrille();
        let fretteZero = caseDepartEffective - 1;
        [5, 7, 10, 15].forEach(num => {
            if (num >= fretteZero && num <= fretteZero + 5) this.repereSimple(num, fretteZero);
        });
        if (fretteZero >= 8 && fretteZero <= 13) this.repereDouble(12, fretteZero);
        this.ctx.strokeStyle = this.couleurOutils.couleurTrait;
        this.ctx.lineWidth = this.grille.options.epaisseurLigne;
        this.metLesDoigts(caseDepartEffective);
        this.ecritNomAccord(this.penseDiagrammeUkulele.nomAccord);
        if (this.isFavorite) this.drawFavoriteIcon();

        if (!this.options.isMiniature) {
            const notes = UkuleleGCEA.getNotesForPosition(this.penseDiagrammeUkulele.valeurs);
            this.updateStringNotes(notes);
            const analyzer = new ChordAnalyzer(notes);
            const chordName = analyzer.identifyChord();
            this.updateAnalysisUI(chordName, analyzer);
        }
        this.ctx.stroke();
    }

    updateStringNotes(notes) {
        const display = document.getElementById("string-notes-display");
        if (display) display.innerHTML = notes.map(n => `<span>${n}</span>`).join('');
    }

    updateAnalysisUI(chordName, analyzer) {
        const display = document.getElementById("chord-analysis-display");
        if (display) {
            const status = this.penseDiagrammeUkulele.estJouable() 
                ? `<span style="color: green">✅ ${i18n.t('playable')}</span>` 
                : `<span style="color: red">❌ ${i18n.t('difficult')}</span>`;
            display.innerHTML = `<strong>${i18n.t('detectedChord')} ${chordName}</strong> | ${status}<br/>
                                 <small>Notes : ${analyzer.getInversions().map(inv => inv.join('-')).join(' | ')}</small>`;
        }
    }

    showAlternatives(targetName) {
        if (this.options.isMiniature) return; 
        const container = document.getElementById("alternatives-container");
        const title = document.getElementById("alternatives-title");
        if (!container) return;
        
        container.innerHTML = "";
        const positions = generatedChords[targetName];
        if (!positions) {
            if (title) title.style.display = "none";
            return;
        }

        const fullPositions = positions.filter(pos => !pos.includes('x'));
        if (fullPositions.length <= 1) {
            if (title) title.style.display = "none";
            return;
        }

        if (title) {
            title.style.display = "block";
            title.innerHTML = i18n.t('alternativesMsg').replace('{n}', fullPositions.length);
        }

        const sortedPositions = fullPositions
            .map(pos => ({ name: targetName, position: pos, isFavorite: StorageManager.isFavorite(pos) }))
            .sort((a, b) => (b.isFavorite - a.isFavorite));

        sortedPositions.forEach(data => {
            DiagrammeUIHelper.createThumbnail(container, data, (clickedData) => {
                this.penseDiagrammeUkulele.setValeursByString(clickedData.position);
                this.syncPenseToUI();
                this.dessineDiagramme();
                if (globalThis.updateMainDiagramFavoriteStatus) globalThis.updateMainDiagramFavoriteStatus();
                if (globalThis.updateFavoriteIconState) globalThis.updateFavoriteIconState();
            });
        });
    }

    displaySearchList(resultsArray) {
        if (this.options.isMiniature) return;
        const container = document.getElementById("alternatives-container");
        const title = document.getElementById("alternatives-title");
        if (!container) return;
        
        container.innerHTML = "";
        if (resultsArray.length <= 1) {
            if (title) title.style.display = "none";
            return;
        }

        if (title) {
            title.style.display = "block";
            title.innerHTML = `Suggestions (${resultsArray.length})`;
        }

        resultsArray.forEach((res) => {
            DiagrammeUIHelper.createThumbnail(container, res, (clickedData) => {
                this.penseDiagrammeUkulele.setNomAccord(clickedData.name);
                this.penseDiagrammeUkulele.setValeursByString(clickedData.position);
                this.syncPenseToUI();
                this.dessineDiagramme();
                if (globalThis.updateMainDiagramFavoriteStatus) globalThis.updateMainDiagramFavoriteStatus();
                if (globalThis.updateFavoriteIconState) globalThis.updateFavoriteIconState();
            });
        });
    }

    repereSimple(num, fretteZero) {
        this.ctx.beginPath();
        this.ctx.lineWidth = this.grille.options.taille / 30;
        this.ctx.strokeStyle = this.couleurOutils.couleurReperes;
        this.ctx.fillStyle = this.couleurOutils.couleurReperes;
        let casePoint = num - fretteZero;
        let monx = this.grille.options.margeGaucheGrille + 1.5 * this.taille;
        let mony = this.grille.options.margeHauteurGrille + casePoint * this.taille - this.taille / 2;
        if (casePoint > 0 && casePoint <= 5) { this.ctx.arc(monx, mony, this.taille / 6, 0, 2 * Math.PI); this.ctx.fill(); }
        this.ctx.stroke();
    }

    repereDouble(num, fretteZero) {
        this.ctx.lineWidth = this.grille.options.taille / 30;
        this.ctx.strokeStyle = this.couleurOutils.couleurReperes;
        this.ctx.fillStyle = this.couleurOutils.couleurReperes;
        let casePoint = num - fretteZero;
        let x1 = this.grille.options.margeGaucheGrille + 0.5 * this.taille, x2 = this.grille.options.margeGaucheGrille + 2.5 * this.taille;
        let y1 = this.grille.options.margeHauteurGrille + casePoint * this.taille - this.taille / 2;
        if (casePoint > 0 && casePoint <= 5) {
            this.ctx.beginPath(); this.ctx.arc(x1, y1, this.taille / 8, 0, 2 * Math.PI); this.ctx.fill(); this.ctx.stroke();
            this.ctx.beginPath(); this.ctx.arc(x2, y1, this.taille / 8, 0, 2 * Math.PI); this.ctx.fill(); this.ctx.stroke();
        }
    }

    metLesDoigts(caseDepart) {
        if (caseDepart > 1) {
            this.ctx.beginPath();
            this.ctx.font = `bold ${this.taille / 1.8}px Verdana, Arial, serif`;
            this.ctx.fillStyle = this.couleurOutils.couleurTrait; this.ctx.textAlign = "right"; 
            this.ctx.fillText(caseDepart.toString(), this.grille.options.margeGaucheGrille - (0.25 * this.taille), this.grille.options.margeHauteurGrille + 0.7 * this.taille);
            this.ctx.stroke(); this.ctx.textAlign = "left"; 
        }
        for (let corde = 0; corde < CORDES_MAX; corde++) {
            const v = this.penseDiagrammeUkulele.getValeurCorde(corde);
            if (v === -1) this.dessinePoint(corde + 1, "x");
            else if (v === 0) this.dessinePoint(corde + 1, 0);
            else this.dessinePoint(corde + 1, v - caseDepart + 1);
        }
    }

    dessinePoint(nCorde, nfrette) {
        if (nfrette !== "x" && nfrette > 5) return;
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.couleurOutils.couleurTrait;
        this.ctx.lineWidth = this.taille / 20;
        let monx = this.grille.options.margeGaucheGrille + (nCorde - 1) * this.taille, mony;
        if (nfrette > 0) {
            this.ctx.fillStyle = this.couleurOutils.couleurRemplissage; mony = this.grille.options.margeHauteurGrille + nfrette * this.taille - this.taille / 2;
            this.ctx.arc(monx, mony, this.taille / 4, 0, 2 * Math.PI); this.ctx.fill();
        } else if (nfrette === 0) {
            this.ctx.fillStyle = this.couleurOutils.couleurFond; mony = this.grille.options.margeHauteurGrille;
            this.ctx.arc(monx, mony, this.taille / 6, 0, 2 * Math.PI); this.ctx.fill();
        } else if (nfrette === "x") {
            mony = this.grille.options.margeHauteurGrille; this.ctx.lineWidth = this.taille / 10;
            const ecart = this.taille / 6; this.ctx.moveTo(monx - ecart, mony - ecart); this.ctx.lineTo(monx + ecart, mony + ecart); this.ctx.moveTo(monx + ecart, mony - ecart); this.ctx.lineTo(monx - ecart, mony + ecart);
        }
        this.ctx.stroke();
    }

    ecritNomAccord(nomAccord) {
        if (!nomAccord) return;
        let tonale = nomAccord[0], alt = "", suffixe = nomAccord.slice(1);
        if (nomAccord.length > 1 && (nomAccord[1] === '#' || nomAccord[1] === 'b')) { alt = nomAccord[1]; suffixe = nomAccord.slice(2); }
        this.ctx.fillStyle = this.couleurOutils.couleurTrait; this.ctx.textAlign = "left"; this.ctx.textBaseline = "ideographic";
        this.ctx.font = `bold ${this.taille}px Verdana, Arial, serif`; let wT = this.ctx.measureText(tonale).width;
        this.ctx.font = `bold ${this.taille * 0.75}px Verdana, Arial, serif`; let wA = alt ? this.ctx.measureText(alt).width : 0;
        this.ctx.font = `bold ${this.taille * 0.6}px Verdana, Arial, serif`; let wS = this.ctx.measureText(suffixe).width;
        let x = (this.canvas.width / 2) - ((wT + wA + wS) / 2), y = this.taille;
        this.ctx.font = `bold ${this.taille}px Verdana, Arial, serif`; this.ctx.fillText(tonale, x, y);
        if (alt) { this.ctx.font = `bold ${this.taille * 0.75}px Verdana, Arial, serif`; this.ctx.fillText(alt, x + wT, y * 0.95); }
        this.ctx.font = `bold ${this.taille * 0.6}px Verdana, Arial, serif`; this.ctx.fillText(suffixe, x + wT + wA, y);
    }

    clicSurDiagramme(event) {
        const rect = this.canvas.getBoundingClientRect();
        let relatifX = event.clientX - this.grille.options.margeGaucheGrille - rect.left;
        let relatifY = event.clientY - this.grille.options.margeHauteurGrille - rect.top;
        if (relatifY < -this.taille/2) return;
        let xG = Math.round(relatifX / this.taille), yG = Math.round(relatifY / this.taille + 0.5);
        if (xG >= 0 && xG < 4 && yG >= 0 && yG <= 5) {
            this.penseDiagrammeUkulele.modifieValeursSurClic(xG, yG, this.getCaseDepartEffective());
            const analyzer = new ChordAnalyzer(UkuleleGCEA.getNotesForPosition(this.penseDiagrammeUkulele.valeurs));
            const chordName = analyzer.identifyChord();
            this.penseDiagrammeUkulele.setNomAccord((chordName !== "inconnu" && chordName !== "---") ? chordName.split(' ou ')[0] : "");
            this.syncPenseToUI();
            this.dessineDiagramme();
            if (this.penseDiagrammeUkulele.nomAccord) {
                const result = this.penseDiagrammeUkulele.chercheAccordParNom(
                    this.penseDiagrammeUkulele.nomAccord, 
                    tableauAccords, 
                    StorageManager.isFavorite, 
                    generatedChords
                );
                if (result.found) this.displaySearchList(result.results);
            }
            if (globalThis.updateMainDiagramFavoriteStatus) globalThis.updateMainDiagramFavoriteStatus();
            if (globalThis.updateFavoriteIconState) globalThis.updateFavoriteIconState();
        }
    }

    getCaseDepartEffective() {
        if (this.options.isMiniature) return (this.penseDiagrammeUkulele.caseDepart > 0) ? this.penseDiagrammeUkulele.caseDepart : 1;
        const popup = document.getElementById("popupMessage"); if (popup) popup.style.display = "none";
        let caseDepart = this.inputCaseDepartAuto.checked ? this.penseDiagrammeUkulele.calculeCaseDepart() : (Number(this.inputCaseDepart.value) || 1);
        if (caseDepart > this.penseDiagrammeUkulele.getValeurCaseMin() || (caseDepart + 4) < this.penseDiagrammeUkulele.getValeurCaseMax()) if (popup) popup.style.display = "block";
        return caseDepart;
    }

    chercheAccordParNom() {
        if (this.inputNomAccord) {
            const result = this.penseDiagrammeUkulele.chercheAccordParNom(
                this.inputNomAccord.value, 
                tableauAccords, 
                StorageManager.isFavorite, 
                generatedChords
            );
            if (result.found) this.displaySearchList(result.results);
            this.syncPenseToUI();
            this.dessineDiagramme();
        }
    }

    chercheAccordParPosition() {
        if (this.inputValeurs) {
            this.penseDiagrammeUkulele.chercheAccordParPosition(this.inputValeurs.value, tableauAccords);
            this.syncPenseToUI();
            this.dessineDiagramme();
        }
    }

    download_img(el) {
        const nom = (this.inputNomAccord ? this.inputNomAccord.value : "accord") || "accord";
        const pos = this.penseDiagrammeUkulele.chaineValeur();
        el.download = `${nom}-${pos}.png`;
        el.href = this.canvas.toDataURL("image/png");
    }
}
