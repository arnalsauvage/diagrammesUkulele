class DessineDiagrammeUkulele {
    constructor(canvasOrId, options) {
        this.canvas = (typeof canvasOrId === 'string') 
            ? document.getElementById(canvasOrId) 
            : canvasOrId;

        if (!this.canvas) {
            throw new Error(`Canvas introuvable : ${canvasOrId}`);
        }

        this.ctx = this.canvas.getContext("2d");
        this.options = options;
        this.taille = options.taille;
        this.grille = new Grille(this.canvas, this.taille, options);
        this.couleurOutils = new CouleurOutils();
        
        // Initialiser les couleurs par défaut (au cas où startup n'est pas appelé)
        this.couleurOutils.updateColors("#FF5555", "#FFBBBB", "#111111", "#333333");

        // Initialiser les dimensions et marges
        this.changeTaille(this.taille);

        // --- New: Favorite status for this specific diagram instance ---
        this.isFavorite = options.isFavorite || false; 

        if (options.isMiniature) {
            this.penseDiagrammeUkulele = new PenseDiagrammeUkulele("", "0000", -1);
        } else {
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
    }

    startup() {
        if (this.options.isMiniature) return;

        this.updateColors();

        document.querySelector("#couleurRemplissage").addEventListener("input", () => { this.updateColors(); this.dessineDiagramme(); });
        document.querySelector("#couleurReperes").addEventListener("input", () => { this.updateColors(); this.dessineDiagramme(); });
        document.querySelector("#couleurTrait").addEventListener("input", () => { this.updateColors(); this.dessineDiagramme(); });
        document.querySelector("#couleurGrille").addEventListener("input", () => { this.updateColors(); this.dessineDiagramme(); });

        this.canvas.addEventListener("click", this.clicSurDiagramme.bind(this));
        
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

    syncPenseToUI() {
        if (this.options.isMiniature) return;
        this.inputValeurs.value = this.penseDiagrammeUkulele.chaineValeur();
        this.inputNomAccord.value = this.penseDiagrammeUkulele.nomAccord;
    }

    syncUIToPense() {
        if (this.options.isMiniature) return;
        this.penseDiagrammeUkulele.setValeursByString(this.inputValeurs.value);
        this.penseDiagrammeUkulele.setNomAccord(this.inputNomAccord.value);
        if (this.inputCaseDepartAuto.checked) {
            this.penseDiagrammeUkulele.setCaseDepart(-1);
        } else {
            this.penseDiagrammeUkulele.setCaseDepart(Number(this.inputCaseDepart.value));
        }
    }

    // --- New: Method to draw the favorite icon ---
    drawFavoriteIcon() {
        if (!this.ctx) return;

        // Use a fixed size relative to the diagram size or a set value
        const iconSize = this.taille * 0.8; // Size of the star
        const margin = this.taille * 0.3; // Margin from the edge

        // Position in the top-right corner of the drawing area
        const x = this.canvas.width - margin - iconSize / 2;
        const y = margin + iconSize / 2;

        this.ctx.save(); // Save context state
        this.ctx.beginPath();
        this.ctx.translate(x, y);
        this.ctx.rotate(Math.PI / 4); // Rotate for star shape

        // Drawing a simple star shape
        const numPoints = 5;
        const outerRadius = iconSize / 2;
        const innerRadius = iconSize / 4; // For a spikier star

        this.ctx.moveTo(0, -outerRadius);
        for (let i = 0; i < numPoints * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = Math.PI / numPoints * i - Math.PI / 2; // Start from top
            this.ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        this.ctx.closePath();

        this.ctx.fillStyle = 'gold'; // Star color
        this.ctx.fill();
        this.ctx.strokeStyle = 'darkgoldenrod'; // Outline color
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        this.ctx.restore(); // Restore context state
    }

    dessineDiagramme() {
        this.blank();
        let caseDepartEffective = this.getCaseDepartEffective();
        
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
        
        // On écrit le nom sur TOUS les diagrammes (y compris miniatures)
        this.ecritNomAccord(this.penseDiagrammeUkulele.nomAccord);

        // --- Draw favorite icon if this diagram instance is marked as favorite ---
        if (this.isFavorite) {
            this.drawFavoriteIcon();
        }

        if (!this.options.isMiniature) {
            const positions = this.penseDiagrammeUkulele.valeurs;
            const notes = UkuleleGCEA.getNotesForPosition(positions);
            this.updateStringNotes(notes);
            
            const analyzer = new ChordAnalyzer(notes);
            const chordName = analyzer.identifyChord();
            this.updateAnalysisUI(chordName, analyzer);
            
            const mainName = chordName.split(' ou ')[0];
            this.showAlternatives(mainName);
        }
        
        this.ctx.stroke();
    }

    updateStringNotes(notes) {
        const display = document.getElementById("string-notes-display");
        if (display) {
            display.innerHTML = notes.map(n => `<span>${n}</span>`).join('');
        }
    }

    updateAnalysisUI(chordName, analyzer) {
        const analysisDisplay = document.getElementById("chord-analysis-display");
        if (analysisDisplay) {
            const isPlayable = this.penseDiagrammeUkulele.estJouable();
            const playableStatus = isPlayable 
                ? `<span style="color: green">✅ ${globalThis.i18n.t('playable')}</span>` 
                : `<span style="color: red">❌ ${globalThis.i18n.t('difficult')}</span>`;

            analysisDisplay.innerHTML = `<strong>${globalThis.i18n.t('detectedChord')} ${chordName}</strong> | ${playableStatus}<br/>
                                        <small>Notes : ${analyzer.getInversions().map(inv => inv.join('-')).join(' | ')}</small>`;
        }
    }

    showAlternatives(targetName) {
        // This method is only meant for the main view, not for miniatures themselves
        if (this.options.isMiniature) return; 

        const container = document.getElementById("alternatives-container");
        const title = document.getElementById("alternatives-title");
        if (!container) return;
        
        container.innerHTML = "";
        if (title) title.style.display = "none";

        if (typeof generatedChords === 'undefined') return;

        const positions = generatedChords[targetName];
        if (!positions) return;

        const fullPositions = positions.filter(pos => !pos.includes('x'));
        if (fullPositions.length <= 1) return; // Not enough alternatives to show

        // Affichage du titre avec le compte
        if (title) {
            title.style.display = "block";
            const msg = globalThis.i18n.t('alternativesMsg').replace('{n}', fullPositions.length);
            title.innerHTML = msg;
        }

        // --- NEW LOGIC: Sort positions by favorites first ---
        const currentFavorites = globalThis.getFavorites ? globalThis.getFavorites() : [];
        
        // Créer un tableau d'objets pour trier
        const posObjects = fullPositions.map(pos => ({
            pos: pos,
            isFavorite: currentFavorites.includes(pos)
        }));

        // Trier : favoris en premier
        posObjects.sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return 0;
        });

        posObjects.forEach((obj, index) => {
            const pos = obj.pos;
            const isPosFavorite = obj.isFavorite;
            const wrapper = document.createElement("div");
            wrapper.style.cursor = "pointer";
            wrapper.style.border = "1px solid #ddd";
            wrapper.style.borderRadius = "4px";
            wrapper.style.padding = "2px";
            
            wrapper.style.background = isPosFavorite ? "#e8f5e9" : "white"; // Highlight if favorite

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
                // --- NEW: Pass favorite status to the mini diagram instance ---
                isFavorite: isPosFavorite 
            };

            const miniDiag = new DessineDiagrammeUkulele(canvas, miniOptions);
            miniDiag.penseDiagrammeUkulele.setValeursByString(pos);
            
            // Calculer et appliquer la case de départ pour le mini-diagramme
            const caseDep = miniDiag.penseDiagrammeUkulele.calculeCaseDepart();
            miniDiag.penseDiagrammeUkulele.setCaseDepart(caseDep);
            
            miniDiag.dessineDiagramme(); // This will now call drawFavoriteIcon if isFavorite is true

            wrapper.addEventListener("click", () => {
                // When a mini-diagram is clicked, update the main diagram's input and redraw
                this.inputValeurs.value = pos;
                this.penseDiagrammeUkulele.setValeursByString(pos);
                this.syncPenseToUI();
                this.dessineDiagramme(); // Redraw the main diagram

                // --- NEW: Update favorite status for the main diagram and toggle button ---
                // After the main diagram is redrawn, its favorite status needs to be reflected.
                // We call the global update functions to ensure synchronization.
                if (globalThis.updateMainDiagramFavoriteStatus) {
                    globalThis.updateMainDiagramFavoriteStatus();
                }
                if (globalThis.updateFavoriteIconState) {
                    globalThis.updateFavoriteIconState();
                }
            });
        });
    }

    displaySearchList(resultsArray) {
        if (this.options.isMiniature) return;

        const container = document.getElementById("alternatives-container");
        const title = document.getElementById("alternatives-title");
        if (!container) return;
        
        container.innerHTML = "";
        if (title) {
            title.style.display = "block";
            // On réutilise le message des alternatives ou on en met un générique
            title.innerHTML = `Suggestions (${resultsArray.length})`;
        }

        resultsArray.forEach((res) => {
            const wrapper = document.createElement("div");
            wrapper.style.cursor = "pointer";
            wrapper.style.border = "1px solid #ddd";
            wrapper.style.borderRadius = "4px";
            wrapper.style.padding = "2px";
            wrapper.style.background = res.isFavorite ? "#fff9c4" : "white"; // Fond légèrement jaune pour les favoris
            if (res.isFavorite) wrapper.style.borderColor = "gold";

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
                isFavorite: res.isFavorite
            };

            const miniDiag = new DessineDiagrammeUkulele(canvas, miniOptions);
            miniDiag.penseDiagrammeUkulele.setNomAccord(res.name);
            miniDiag.penseDiagrammeUkulele.setValeursByString(res.position);
            
            // Calculer la case de départ effective
            const caseDep = miniDiag.penseDiagrammeUkulele.calculeCaseDepart();
            miniDiag.penseDiagrammeUkulele.setCaseDepart(caseDep);
            
            miniDiag.dessineDiagramme();

            wrapper.addEventListener("click", () => {
                this.inputValeurs.value = res.position;
                this.inputNomAccord.value = res.name;
                this.penseDiagrammeUkulele.setNomAccord(res.name);
                this.penseDiagrammeUkulele.setValeursByString(res.position);
                this.dessineDiagramme();
                if (globalThis.updateMainDiagramFavoriteStatus) globalThis.updateMainDiagramFavoriteStatus();
                if (globalThis.updateFavoriteIconState) globalThis.updateFavoriteIconState();
            });
        });
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
        this.ctx.lineWidth = this.grille.options.taille / 30;
        this.ctx.strokeStyle = this.couleurOutils.couleurReperes;
        this.ctx.fillStyle = this.couleurOutils.couleurReperes;

        let caseDuPoint = numeroFretteDuRepere - fretteZeroDuDiagramme;
        let x1 = this.grille.options.margeGaucheGrille + 0.5 * this.taille;
        let y1 = this.grille.options.margeHauteurGrille + caseDuPoint * this.taille - this.taille / 2;
        let x2 = this.grille.options.margeGaucheGrille + 2.5 * this.taille;

        if (caseDuPoint > 0 && caseDuPoint <= 5) {
            // ✅ Premier cercle - son propre chemin
            this.ctx.beginPath();
            this.ctx.arc(x1, y1, this.taille / 8, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();

            // ✅ Deuxième cercle - son propre chemin
            this.ctx.beginPath();
            this.ctx.arc(x2, y1, this.taille / 8, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }

    metLesDoigts(caseDepart) {
        if (caseDepart > 1) {
            this.ctx.beginPath();
            this.ctx.font = `bold ${this.taille / 1.8}px Verdana, Arial, serif`;
            this.ctx.fillStyle = this.couleurOutils.couleurTrait;
            this.ctx.textAlign = "right"; 
            
            // On décale davantage à gauche (0.6 * taille) pour éviter les points sur la 1ère corde
            let xPos = this.grille.options.margeGaucheGrille - (0.25 * this.taille);
            
            this.ctx.fillText(
                caseDepart.toString(),
                xPos,
                this.grille.options.margeHauteurGrille + 0.7 * this.taille
            );
            this.ctx.stroke();
            this.ctx.textAlign = "left"; 
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
        if (nomAccord.length > 1 && (nomAccord[1] === '#' || nomAccord[1] === 'b')) {
            alteration = nomAccord[1];
            suffixe = nomAccord.slice(2);
        }
        this.ctx.fillStyle = this.couleurOutils.couleurTrait;
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "ideographic";
        let tailleTonale = this.taille;
        let tailleAlteration = this.taille * 0.75;
        let tailleSuffixe = this.taille * 0.6;
        this.ctx.font = `bold ${tailleTonale}px Verdana, Arial, serif`;
        let largeurTonale = this.ctx.measureText(tonale).width;
        this.ctx.font = `bold ${tailleAlteration}px Verdana, Arial, serif`;
        let largeurAlteration = alteration ? this.ctx.measureText(alteration).width : 0;
        this.ctx.font = `bold ${tailleSuffixe}px Verdana, Arial, serif`;
        let largeurSuffixe = this.ctx.measureText(suffixe).width;
        let largeurTotale = largeurTonale + largeurAlteration + largeurSuffixe;
        let xCurrent = (this.canvas.width / 2) - (largeurTotale / 2);
        let yBase = this.taille;
        this.ctx.font = `bold ${tailleTonale}px Verdana, Arial, serif`;
        this.ctx.fillText(tonale, xCurrent, yBase);
        xCurrent += largeurTonale;
        if (alteration) {
            this.ctx.font = `bold ${tailleAlteration}px Verdana, Arial, serif`;
            this.ctx.fillText(alteration, xCurrent, yBase * 0.95);
            xCurrent += largeurAlteration;
        }
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
            
            // Identification automatique après le clic
            const positions = this.penseDiagrammeUkulele.valeurs;
            const notes = UkuleleGCEA.getNotesForPosition(positions);
            const analyzer = new ChordAnalyzer(notes);
            const chordName = analyzer.identifyChord();
            
            // Mise à jour du nom si identifié, sinon vider
            if (chordName !== "inconnu" && chordName !== "---") {
                // On prend le premier nom si plusieurs sont trouvés (ex: C ou Am7)
                const mainName = chordName.split(' ou ')[0];
                this.penseDiagrammeUkulele.setNomAccord(mainName);
            } else {
                this.penseDiagrammeUkulele.setNomAccord("");
            }

            this.syncPenseToUI();
            this.dessineDiagramme();
            
            // --- NEW: Update global favorite status and icon state after drawing ---
            if (globalThis.updateMainDiagramFavoriteStatus) {
                globalThis.updateMainDiagramFavoriteStatus();
            }
            if (globalThis.updateFavoriteIconState) {
                globalThis.updateFavoriteIconState();
            }
        }
    }

    getCaseDepartEffective() {
        if (this.options.isMiniature) {
            return (this.penseDiagrammeUkulele.caseDepart > 0) ? this.penseDiagrammeUkulele.caseDepart : 1;
        }
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
