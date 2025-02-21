// import Grille from './grille.js';
// import CouleurOutils from './couleurOutils.js';
class DessineDiagrammeUkulele {
    constructor(canvasId, options) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.taille = options.taille;
        this.grille = new Grille(this.canvas, this.taille, options);
        this.couleurOutils = new CouleurOutils();
        this.valeurs = document.getElementById("valeurs");
        this.nomAccord = document.getElementById("name");
        this.caseDepart = document.getElementById("caseDepart");
        this.caseDepartAuto = document.getElementById("caseDepartAuto");
        this.penseDiagrammeUkulele = new PenseDiagrammeUkulele( this.nomAccord.value, this.valeurs.value, -1);
    }

    startup() {
        // Initialisation des couleurs des outils
        this.updateColors();

        // Gestion des événements de changement de couleur
        document
            .querySelector("#couleurRemplissage")
            .addEventListener("input", this.updateColors.bind(this));
        document
            .querySelector("#couleurReperes")
            .addEventListener("input", this.updateColors.bind(this));
        document
            .querySelector("#couleurTrait")
            .addEventListener("input", this.updateColors.bind(this));
        document
            .querySelector("#couleurGrille")
            .addEventListener("input", this.updateColors.bind(this));

        this.canvas.addEventListener("click", this.clicSurDiagramme.bind(this));
        document
            .getElementById("loupeChercheAccordParNom")
            .addEventListener("touchend", this.chercheAccordParNom.bind(this));
        document
            .getElementById("loupeChercheAccordParValeurs")
            .addEventListener("touchend", this.chercheAccordParPosition.bind(this));

        this.changeTaille(this.taille);
        this.dessineDiagramme();
    }

    // Cette méthode applique les changements de couleurs
    // Todo à réécrire !
    updateColors() {
        this.couleurOutils.updateColors(
            document.querySelector("#couleurRemplissage").value,
            document.querySelector("#couleurReperes").value,
            document.querySelector("#couleurTrait").value,
            document.querySelector("#couleurGrille").value
        );
        this.grille.setCouleurGrille(
            document.querySelector("#couleurGrille").value
        );
    }

    // Change la taille du diagramme
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

    // Cette méthode efface le canvas
    blank() {
        // Efface le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "white"; // Couleur de fond
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Remplir le canvas

    }

    // Get values from penseDiagrammeUkulele
    getValuesFromPense(){
        this.valeurs.value = this.penseDiagrammeUkulele.chaineValeur();
        this.nomAccord.value = this.penseDiagrammeUkulele.nomAccord;
    }

    // Cette méthode relance le dessin du diagramme avec son style
    dessineDiagramme() {
        this.blank();
        this.grille.dessineGrille();
        let fretteZeroDuDiagramme = this.getCaseDepart() - 1;

        // Dessiner les repères de frettes
        const reperesSimples = [5, 7, 10, 15];
        for (const numeroFretteRepere of reperesSimples) {
            if (
                numeroFretteRepere >= fretteZeroDuDiagramme &&
                numeroFretteRepere <= fretteZeroDuDiagramme + 5
            ) {
                this.repereSimple(numeroFretteRepere, fretteZeroDuDiagramme);
            }
        }

        if (fretteZeroDuDiagramme >= 8 && fretteZeroDuDiagramme <= 13) {
            this.repereDouble(12, fretteZeroDuDiagramme);
        }

        this.ctx.strokeStyle = this.couleurOutils.couleurTrait;
        this.ctx.lineWidth = this.grille.options.epaisseurLigne;
        this.ctx.strokeStyle = this.couleurOutils.couleurRemplissage;
        this.metLesDoigts(this.valeurs.value);
        this.ecritNomAccord(this.nomAccord.value);
        this.ctx.stroke();
    }

    // Cette méthode dessine un repère simple sur le manche : un rond au centre
    repereSimple(numeroFretteDuRepere, fretteZeroDuDiagramme) {
        this.ctx.beginPath();
        this.ctx.lineWidth = this.grille.options.taille / 30;
        this.ctx.strokeStyle = this.couleurOutils.couleurReperes;
        this.ctx.fillStyle = this.couleurOutils.couleurReperes;
        let caseDuPoint = numeroFretteDuRepere - fretteZeroDuDiagramme;
        let monx = this.grille.options.margeGaucheGrille + 1.5 * this.taille;
        let mony =
            this.grille.options.margeHauteurGrille +
            caseDuPoint * this.taille -
            this.taille / 2;

        if (caseDuPoint > 0) {
            this.ctx.arc(monx, mony, this.taille / 6, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        this.ctx.stroke();
    }

    // Cette méthode dessine un repère double sur le manche : deux ronds au centre
    repereDouble(numeroFretteDuRepere, fretteZeroDuDiagramme) {
        this.ctx.beginPath();
        this.ctx.lineWidth = this.grille.options.taille / 30;
        this.ctx.strokeStyle = this.couleurOutils.couleurReperes;
        this.ctx.fillStyle = this.couleurOutils.couleurReperes;
        let caseDuPoint = numeroFretteDuRepere - fretteZeroDuDiagramme;
        let x1 = this.grille.options.margeGaucheGrille + 0.5 * this.taille ;
        let y1 =
            this.grille.options.margeHauteurGrille +
            caseDuPoint * this.taille -
            this.taille / 2;
        let x2 = this.grille.options.margeGaucheGrille + 2.5 * this.taille;

        let y2 =
            this.grille.options.margeHauteurGrille +
            caseDuPoint * this.taille -
            this.taille / 2;
        this.ctx.arc(x1, y1,  this.taille / 8, 0,2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(x2, y2,  this.taille / 8, 0,2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
    }

    // Cette méthode ajoute les ronds sur le diagramme correspondants aux positions appuyées
    // Todo : ajouter la gestion des barrés !
    metLesDoigts() {
        // Ecrit la frette de départ si ce n'est pas zéro
        let caseDepart = this.getCaseDepart();
        if (caseDepart > 1) {
            this.ctx.beginPath();
            this.ctx.font = "bold " + this.taille / 1.8 + "px Verdana, Arial, serif";
            this.ctx.fillStyle = this.couleurOutils.couleurTrait;
            this.ctx.fillText(
                caseDepart.toString(),
                this.grille.options.margeGaucheGrille - 0.45 * this.taille,
                this.grille.options.margeHauteurGrille + 0.7 * this.taille
            );
            this.ctx.stroke();
        }

        for (let corde = 0; corde < CORDES_MAX; corde++) {
            // Si la corde n'est pas jouée, on dessine une croix
            if (this.penseDiagrammeUkulele.getValeurCorde(corde)===-1) {
                this.dessinePoint(corde + 1, "x");
            } else {
                let numeroFrette = this.penseDiagrammeUkulele.getValeurCorde(corde);
                if (numeroFrette === 0) {
                    this.dessinePoint(corde + 1, 0);
                }
                if (caseDepart > 0) {
                    this.dessinePoint(corde + 1, numeroFrette - caseDepart + 1);
                } else {
                    this.dessinePoint(corde + 1, numeroFrette);
                }
            }
        }
    }

    // dessine un point représentant un doigt sur le diagramme
    dessinePoint(nCorde, nfrette) {
        if (nfrette>5)
        {
            return;
        }
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.couleurOutils.couleurTrait;
        this.ctx.lineWidth = this.taille / 20;
        let monx =
            this.grille.options.margeGaucheGrille + (nCorde - 1) * this.taille;
        let mony;
        // Corde jouée
        if (nfrette > 0) {
            this.ctx.fillStyle = this.couleurOutils.couleurRemplissage;
            mony =
                this.grille.options.margeHauteurGrille +
                nfrette * this.taille -
                this.taille / 2;
            this.ctx.arc(monx, mony, this.taille / 4, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        // Corde à vide
        if (nfrette === 0) {
            this.ctx.fillStyle = this.couleurOutils.couleurFond;
            mony = this.grille.options.margeHauteurGrille;
            this.ctx.arc(monx, mony, this.taille / 6, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        // Corde non jouée
        if (nfrette === "x") {
            mony = this.grille.options.margeHauteurGrille;
            this.ctx.strokeStyle = this.couleurOutils.couleurTrait;
            this.ctx.lineWidth = this.taille / 10;
            const ecart = this.taille / 6;
            this.ctx.moveTo(monx - ecart, mony - ecart);
            this.ctx.lineTo(monx + ecart, mony + ecart);
            this.ctx.moveTo(monx + ecart, mony - ecart);
            this.ctx.moveTo(monx + ecart, mony - ecart);
            this.ctx.lineTo(monx - ecart, mony + ecart);
        }
        this.ctx.stroke();
    }

    // Cette méthode ecrit le nom de l'accord en haut du diagramme
    ecritNomAccord(nomAccord) {
        this.ctx.fillStyle = this.couleurOutils.couleurTrait;
        this.ctx.font = "bold " + this.taille + "px Verdana, Arial, serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(nomAccord, this.canvas.width / 2, this.taille / 2);
    }

    clicSurDiagramme(event) {
        // Gérer le clic sur le diagramme, pour interagir avec les éléments
        const diagramme = document.getElementById("diagramme1");
        const rect = diagramme.getBoundingClientRect();
        let relatifX = event.clientX - this.grille.options.margeGaucheGrille - rect.left;
        let relatifY = event.clientY - this.grille.options.margeHauteurGrille - rect.top;

        console.log(`event.clientX: ${event.clientX}`);
        console.log(`event.clientY: ${event.clientY}`);
        console.log(`margeGaucheGrille: ${this.grille.options.margeGaucheGrille}`);
        console.log(`margeHauteurGrille: ${this.grille.options.margeHauteurGrille}`);
        console.log(`diagramme1 bounding rect:`, rect);
        console.log(`taille: ${this.taille}`);

        let relatifXDansGrille = Math.round(relatifX / this.taille);
        let relatifYDansGrille = Math.round(relatifY / this.taille + 0.5);

        console.log(`Coordonnées du clic: (${relatifXDansGrille}, ${relatifYDansGrille})`);
        console.log("Clic sur relatif " + relatifXDansGrille + " y : " + relatifYDansGrille + " case départ = " + this.caseDepart.value);

        // Si l'utilisateur a cliqué dans la grille
        if (relatifXDansGrille < 4 && relatifYDansGrille < 6) {
            this.penseDiagrammeUkulele.modifieValeursSurClic(relatifXDansGrille, relatifYDansGrille);
            this.getValuesFromPense();
            this.dessineDiagramme();
        }
    }

    // Calcule la case de départ qui semble le plus appropriée pour la position
    getCaseDepart() {
        // On masque l'alerte par défaut
        document.getElementById("popupMessage").style.display = "none";

        let caseDepart;
        // Si l'utilisateur a choisi une caseDepartAuto
        if (document.getElementById("caseDepartAuto").checked) {
            caseDepart = this.penseDiagrammeUkulele.calculeCaseDepart();
        }
        else {
            caseDepart = Number(document.getElementById("caseDepart").value);
        }
        if (
            (caseDepart > this.penseDiagrammeUkulele.getValeurCaseMin()) ||
            ((caseDepart + 4) < this.penseDiagrammeUkulele.getValeurCaseMax()))
        {
            // Afficher une alerte à l'utilisateur : certaines notes ne seront pas visible !
            document.getElementById("popupMessage").style.display = "block";
        }
        return caseDepart;
    }

    chercheAccordParNom() {
        let nom = this.nomAccord.value;
        this.penseDiagrammeUkulele.chercheAccordParNom(nom);
        this.valeurs.value = this.penseDiagrammeUkulele.chaineValeur();
        this.getValuesFromPense();
        this.dessineDiagramme();
    }

    chercheAccordSuivant() {
        this.penseDiagrammeUkulele.chercheAccordSuivant();
        this.valeurs.value = this.penseDiagrammeUkulele.chaineValeur();
        this.nomAccord.value = this.penseDiagrammeUkulele.nomAccord;
        this.getValuesFromPense();
        this.dessineDiagramme();
    }

    chercheAccordPrecedent() {
        this.penseDiagrammeUkulele.chercheAccordPrecedent();
        this.valeurs.value = this.penseDiagrammeUkulele.chaineValeur();
        this.nomAccord.value = this.penseDiagrammeUkulele.nomAccord;
        this.getValuesFromPense();
        this.dessineDiagramme();
    }

    chercheAccordParPosition() {
        // Logique pour chercher un accord par position et mettre à jour le diagramme
        let position = document.getElementById("valeurs").value;
        console.log(`Cherche accord par valeurs: ${position}`);
        this.penseDiagrammeUkulele.chercheAccordParPosition(position);
        this.nomAccord.value = this.penseDiagrammeUkulele.nomAccord;
        this.getValuesFromPense();
        this.dessineDiagramme();
    }

    // Tire un accord au hasard dans la bibliothèque !
    setAccordAuHasard() {
        this.penseDiagrammeUkulele.setAccordAuHasard();
        this.nomAccord.value = this.penseDiagrammeUkulele.nomAccord;
        this.valeurs.value = this.penseDiagrammeUkulele.chaineValeur();
        this.getValuesFromPense();
        this.dessineDiagramme();
    }

    // Transformer en lien de download l'élément el
    // pour télécharger le diagramme affiché avec le nom d'accord - position comme nom de fichier
    download_img(el) {
        let lienDownload = document.getElementById("download");
        let nomAccord = document.getElementById("name").value;
        let position = document.getElementById("valeurs").value;

        // Générer le nom de fichier dynamique
        lienDownload.download = nomAccord + "-" + position + ".png";
        console.log("Nom de fichier:", lienDownload.download);

        // Générer l'URL de téléchargement à partir du canvas
        let canvas = document.getElementById("diagramme1");
        el.href = canvas.toDataURL("image/png");
        console.log("Lien href:", el.href);
    }

    majVersPense() {
        this.penseDiagrammeUkulele.setValeursByString(this.valeurs.value);
        this.penseDiagrammeUkulele.setNomAccord(this.nomAccord.value);

        // Si l'utilisateur a choisi une caseDepartAuto
        if (document.getElementById("caseDepartAuto").checked) {
            this.penseDiagrammeUkulele.setCaseDepart(-1);

        }
        else{
            let caseDepart = Number(document.getElementById("caseDepart").value);
            this.penseDiagrammeUkulele.setCaseDepart(caseDepart);
        }

    }
}

// Exporter la classe
// export default DiagrammeUkulele;

