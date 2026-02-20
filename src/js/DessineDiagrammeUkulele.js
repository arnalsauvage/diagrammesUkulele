// import Grille from './grille.js';
// import CouleurOutils from './couleurOutils.js';
class DessineDiagrammeUkulele {
    constructor(canvasId, options) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.taille = options.taille;
        this.grille = new Grille(this.canvas, this.taille, options);
        this.couleurOutils = new CouleurOutils();
        
        // On récupère les éléments du DOM une seule fois
        this.inputValeurs = document.getElementById("valeurs");
        this.inputNomAccord = document.getElementById("name");
        this.inputCaseDepart = document.getElementById("caseDepart");
        this.inputCaseDepartAuto = document.getElementById("caseDepartAuto");
        
        this.penseDiagrammeUkulele = new PenseDiagrammeUkulele(
            this.inputNomAccord.value, 
            this.inputValeurs.value, 
            -1
        );
    }

    startup() {
        this.updateColors();

        // Gestion des événements
        document.querySelector("#couleurRemplissage").addEventListener("input", () => { this.updateColors(); this.dessineDiagramme(); });
        document.querySelector("#couleurReperes").addEventListener("input", () => { this.updateColors(); this.dessineDiagramme(); });
        document.querySelector("#couleurTrait").addEventListener("input", () => { this.updateColors(); this.dessineDiagramme(); });
        document.querySelector("#couleurGrille").addEventListener("input", () => { this.updateColors(); this.dessineDiagramme(); });

        this.canvas.addEventListener("click", this.clicSurDiagramme.bind(this));
        
        // Support tactile pour les loupes
        const loupeNom = document.getElementById("loupeChercheAccordParNom");
        const loupeVal = document.getElementById("loupeChercheAccordParValeurs");
        if (loupeNom) loupeNom.addEventListener("touchend", (e) => { e.preventDefault(); this.chercheAccordParNom(); });
        if (loupeVal) loupeVal.addEventListener("touchend", (e) => { e.preventDefault(); this.chercheAccordParPosition(); });

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

    // Met à jour les champs HTML à partir de l'état "Pense"
    syncPenseToUI() {
        this.inputValeurs.value = this.penseDiagrammeUkulele.chaineValeur();
        this.inputNomAccord.value = this.penseDiagrammeUkulele.nomAccord;
    }

    // Met à jour l'état "Pense" à partir des champs HTML
    syncUIToPense() {
        this.penseDiagrammeUkulele.setValeursByString(this.inputValeurs.value);
        this.penseDiagrammeUkulele.setNomAccord(this.inputNomAccord.value);
        if (this.inputCaseDepartAuto.checked) {
            this.penseDiagrammeUkulele.setCaseDepart(-1);
        } else {
            this.penseDiagrammeUkulele.setCaseDepart(Number(this.inputCaseDepart.value));
        }
    }

    dessineDiagramme() {
        this.blank();
        let caseDepartEffective = this.getCaseDepartEffective();
        
        // On ne dessine le sillet (frette 0 épaisse) que si on commence à la case 1
        this.grille.options.dessineSillet = (caseDepartEffective === 1);
        this.grille.dessineGrille();
        
        let fretteZeroDuDiagramme = caseDepartEffective - 1;

        const reperesSimples = [5, 7, 10, 15];
        for (const numeroFretteRepere of reperesSimples) {
            if (numeroFretteRepere >= fretteZeroDuDiagramme && numeroFretteRepere <= fretteZeroDuDiagramme + 5) {
                this.repereSimple(numeroFretteRepere, fretteZeroDuDiagramme);
            }
        }

        if (fretteZeroDuDiagramme >= 8 && fretteZeroDuDiagramme <= 13) {
            this.repereDouble(12, fretteZeroDuDiagramme);
        }

        this.ctx.strokeStyle = this.couleurOutils.couleurTrait;
        this.ctx.lineWidth = this.grille.options.epaisseurLigne;
        this.metLesDoigts(caseDepartEffective);
        this.ecritNomAccord(this.penseDiagrammeUkulele.nomAccord);
        this.updateStringNotes();
        this.ctx.stroke();
    }

    updateStringNotes() {
        const display = document.getElementById("string-notes-display");
        if (!display) return;

        // On récupère les valeurs actuelles (tableau d'entiers)
        const positions = this.penseDiagrammeUkulele.valeurs;
        // On utilise notre instance globale UkuleleGCEA (définie dans Instrument.js)
        const notes = UkuleleGCEA.getNotesForPosition(positions);

        // Mise à jour de l'affichage HTML
        display.innerHTML = notes.map(n => `<span>${n}</span>`).join('');

        // Analyse de l'accord
        const analyzer = new ChordAnalyzer(notes);
        const analysisDisplay = document.getElementById("chord-analysis-display");
        if (analysisDisplay) {
            const chordName = analyzer.identifyChord();
            const inversions = analyzer.getInversions();
            const isPlayable = this.penseDiagrammeUkulele.estJouable();
            const playableStatus = isPlayable 
                ? '<span style="color: green">✅ Jouable</span>' 
                : '<span style="color: red">❌ Trop difficile (écartement)</span>';

            analysisDisplay.innerHTML = `<strong>Accord détecté : ${chordName}</strong> | ${playableStatus}<br/>
                                        <small>Notes : ${inversions.map(inv => inv.join('-')).join(' | ')}</small>`;
        }
    }

    repereSimple(numeroFretteDuRepere, fretteZeroDuDiagramme) {
        this.ctx.beginPath();
        this.ctx.lineWidth = this.grille.options.taille / 30;
        this.ctx.strokeStyle = this.couleurOutils.couleurReperes;
        this.ctx.fillStyle = this.couleurOutils.couleurReperes;
        let caseDuPoint = numeroFretteDuRepere - fretteZeroDuDiagramme;
        let monx = this.grille.options.margeGaucheGrille + 1.5 * this.taille;
        let mony = this.grille.options.margeHauteurGrille + caseDuPoint * this.taille - this.taille / 2;

        if (caseDuPoint > 0 && caseDuPoint <= 5) {
            this.ctx.arc(monx, mony, this.taille / 6, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        this.ctx.stroke();
    }

    repereDouble(numeroFretteDuRepere, fretteZeroDuDiagramme) {
        this.ctx.beginPath();
        this.ctx.lineWidth = this.grille.options.taille / 30;
        this.ctx.strokeStyle = this.couleurOutils.couleurReperes;
        this.ctx.fillStyle = this.couleurOutils.couleurReperes;
        let caseDuPoint = numeroFretteDuRepere - fretteZeroDuDiagramme;
        let x1 = this.grille.options.margeGaucheGrille + 0.5 * this.taille ;
        let y1 = this.grille.options.margeHauteurGrille + caseDuPoint * this.taille - this.taille / 2;
        let x2 = this.grille.options.margeGaucheGrille + 2.5 * this.taille;
        let y2 = y1;

        if (caseDuPoint > 0 && caseDuPoint <= 5) {
            this.ctx.arc(x1, y1,  this.taille / 8, 0, 2 * Math.PI);
            this.ctx.arc(x2, y2,  this.taille / 8, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        this.ctx.stroke();
    }

    metLesDoigts(caseDepart) {
        if (caseDepart > 1) {
            this.ctx.beginPath();
            this.ctx.font = `bold ${this.taille / 1.8}px Verdana, Arial, serif`;
            this.ctx.fillStyle = this.couleurOutils.couleurTrait;
            this.ctx.fillText(
                caseDepart.toString(),
                this.grille.options.margeGaucheGrille - 0.45 * this.taille,
                this.grille.options.margeHauteurGrille + 0.7 * this.taille
            );
            this.ctx.stroke();
        }

        for (let corde = 0; corde < CORDES_MAX; corde++) {
            const valeur = this.penseDiagrammeUkulele.getValeurCorde(corde);
            if (valeur === -1) {
                this.dessinePoint(corde + 1, "x");
            } else if (valeur === 0) {
                this.dessinePoint(corde + 1, 0);
            } else {
                const fretteRelative = valeur - caseDepart + 1;
                this.dessinePoint(corde + 1, fretteRelative);
            }
        }
    }

    dessinePoint(nCorde, nfrette) {
        if (nfrette !== "x" && nfrette > 5) return;

        this.ctx.beginPath();
        this.ctx.strokeStyle = this.couleurOutils.couleurTrait;
        this.ctx.lineWidth = this.taille / 20;
        let monx = this.grille.options.margeGaucheGrille + (nCorde - 1) * this.taille;
        let mony;

        if (nfrette > 0) {
            this.ctx.fillStyle = this.couleurOutils.couleurRemplissage;
            mony = this.grille.options.margeHauteurGrille + nfrette * this.taille - this.taille / 2;
            this.ctx.arc(monx, mony, this.taille / 4, 0, 2 * Math.PI);
            this.ctx.fill();
        } else if (nfrette === 0) {
            this.ctx.fillStyle = this.couleurOutils.couleurFond;
            mony = this.grille.options.margeHauteurGrille;
            this.ctx.arc(monx, mony, this.taille / 6, 0, 2 * Math.PI);
            this.ctx.fill();
        } else if (nfrette === "x") {
            mony = this.grille.options.margeHauteurGrille;
            this.ctx.lineWidth = this.taille / 10;
            const ecart = this.taille / 6;
            this.ctx.moveTo(monx - ecart, mony - ecart);
            this.ctx.lineTo(monx + ecart, mony + ecart);
            this.ctx.moveTo(monx + ecart, mony - ecart);
            this.ctx.lineTo(monx - ecart, mony + ecart);
        }
        this.ctx.stroke();
    }

    ecritNomAccord(nomAccord) {
        if (!nomAccord) return;
        
        let tonale = nomAccord[0];
        let alteration = "";
        let suffixe = nomAccord.slice(1);

        // Découpage en 3 parties
        if (nomAccord.length > 1 && (nomAccord[1] === '#' || nomAccord[1] === 'b')) {
            alteration = nomAccord[1];
            suffixe = nomAccord.slice(2);
        }
        
        this.ctx.fillStyle = this.couleurOutils.couleurTrait;
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "ideographic";

        // Définition des 3 tailles
        let tailleTonale = this.taille;
        let tailleAlteration = this.taille * 0.75; // Taille intermédiaire
        let tailleSuffixe = this.taille * 0.6;

        // Mesures
        this.ctx.font = `bold ${tailleTonale}px Verdana, Arial, serif`;
        let largeurTonale = this.ctx.measureText(tonale).width;
        
        this.ctx.font = `bold ${tailleAlteration}px Verdana, Arial, serif`;
        let largeurAlteration = alteration ? this.ctx.measureText(alteration).width : 0;
        
        this.ctx.font = `bold ${tailleSuffixe}px Verdana, Arial, serif`;
        let largeurSuffixe = this.ctx.measureText(suffixe).width;

        // Calcul du centrage global
        let largeurTotale = largeurTonale + largeurAlteration + largeurSuffixe;
        let xCurrent = (this.canvas.width / 2) - (largeurTotale / 2);
        let yBase = this.taille;

        // 1. Dessiner la tonale
        this.ctx.font = `bold ${tailleTonale}px Verdana, Arial, serif`;
        this.ctx.fillText(tonale, xCurrent, yBase);
        xCurrent += largeurTonale;

        // 2. Dessiner l'altération (# ou b)
        if (alteration) {
            this.ctx.font = `bold ${tailleAlteration}px Verdana, Arial, serif`;
            // On remonte un tout petit peu l'altération pour l'équilibre visuel
            this.ctx.fillText(alteration, xCurrent, yBase * 0.95);
            xCurrent += largeurAlteration;
        }

        // 3. Dessiner le suffixe
        this.ctx.font = `bold ${tailleSuffixe}px Verdana, Arial, serif`;
        this.ctx.fillText(suffixe, xCurrent, yBase);
    }

    clicSurDiagramme(event) {
        const rect = this.canvas.getBoundingClientRect();
        let relatifX = event.clientX - this.grille.options.margeGaucheGrille - rect.left;
        let relatifY = event.clientY - this.grille.options.margeHauteurGrille - rect.top;

        if (relatifY < -this.taille/2) return;

        let xGrille = Math.round(relatifX / this.taille);
        let yGrille = Math.round(relatifY / this.taille + 0.5);

        if (xGrille >= 0 && xGrille < 4 && yGrille >= 0 && yGrille <= 5) {
            this.penseDiagrammeUkulele.modifieValeursSurClic(xGrille, yGrille, this.getCaseDepartEffective());
            this.syncPenseToUI();
            this.dessineDiagramme();
        }
    }

    getCaseDepartEffective() {
        const popup = document.getElementById("popupMessage");
        if (popup) popup.style.display = "none";

        let caseDepart;
        if (this.inputCaseDepartAuto.checked) {
            caseDepart = this.penseDiagrammeUkulele.calculeCaseDepart();
        } else {
            caseDepart = Number(this.inputCaseDepart.value) || 1;
        }

        const min = this.penseDiagrammeUkulele.getValeurCaseMin();
        const max = this.penseDiagrammeUkulele.getValeurCaseMax();
        if (caseDepart > min || (caseDepart + 4) < max) {
            if (popup) popup.style.display = "block";
        }
        return caseDepart;
    }

    chercheAccordParNom() {
        this.penseDiagrammeUkulele.chercheAccordParNom(this.inputNomAccord.value);
        this.syncPenseToUI();
        this.dessineDiagramme();
    }

    chercheAccordSuivant() {
        this.penseDiagrammeUkulele.chercheAccordSuivant();
        this.syncPenseToUI();
        this.dessineDiagramme();
    }

    chercheAccordPrecedent() {
        this.penseDiagrammeUkulele.chercheAccordPrecedent();
        this.syncPenseToUI();
        this.dessineDiagramme();
    }

    chercheAccordParPosition() {
        this.penseDiagrammeUkulele.chercheAccordParPosition(this.inputValeurs.value);
        this.syncPenseToUI();
        this.dessineDiagramme();
    }

    setAccordAuHasard() {
        this.penseDiagrammeUkulele.setAccordAuHasard();
        this.syncPenseToUI();
        this.dessineDiagramme();
    }

    download_img(el) {
        const nom = this.inputNomAccord.value || "accord";
        const pos = this.inputValeurs.value || "0000";
        el.download = `${nom}-${pos}.png`;
        el.href = this.canvas.toDataURL("image/png");
    }
}


// Exporter la classe
// export default DiagrammeUkulele;

