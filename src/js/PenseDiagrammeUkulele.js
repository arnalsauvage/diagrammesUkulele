const CASE_MAX = 12;

const CORDES_MAX = 4;

class PenseDiagrammeUkulele
{
    // caseDepart : entier positif (de 0 à 12)
    // nomAccord:  Chaîne de caractères
    // valeurs: tableau de 4 valeurs entières (de -1 à 18)

    constructor( nomAccord, valeurs, caseDepart) {
        // Initialisation des attributs
        this.setCaseDepart(caseDepart);
        this.setNomAccord(nomAccord);
        this.setValeursByString(valeurs);
    }

    setValeursByString(maChaine){
        if (maChaine.length===CORDES_MAX){
            this.convertitChaineSimple(maChaine);
        }
        else {
            this.convertitChaineComplexe(maChaine);
        }

    }

    getValeurCorde(numeroCorde){
        return this.valeurs[numeroCorde];
    }

     convertitChaineSimple(maChaine) {
         this.valeurs = maChaine.split('').map(Number);
        }

    convertitChaineComplexe(maChaine) {
        // Diviser la chaîne par les points pour obtenir un tableau de valeurs
        const valeursArray = maChaine.split('.');

        // Vérifier que le tableau contient exactement 4 valeurs
        if (valeursArray.length !== CORDES_MAX) {
            throw new Error("La chaîne doit contenir exactement 4 valeurs séparées par des points.");
        }

        // Convertir les valeurs en entiers et valider
        this.valeurs = valeursArray.map(val => {
            const nombre = parseInt(val, 10); // Convertir en entier
            if (!Number.isInteger(nombre) || nombre < -1 || nombre > 20) {
                throw new Error("Chaque valeur doit être un entier entre -1 et 20.");
            }
            return nombre;
        });
    }

    setCaseDepart(value) {
        if (Number.isInteger(value) && value >= -1 && value <= CASE_MAX) {
            this.caseDepart = value;
        } else {
            throw new Error("caseDepart doit être un entier positif entre -1 et " + CASE_MAX);
        }
    }

    setNomAccord(value) {
        if (typeof value === "string") {

            this.nomAccord = value;
        } else {
            throw new Error("nomAccord doit être une chaîne de caractères.");
        }
    }

    chaineValeur() {
        // Vérifier si toutes les valeurs sont comprises entre 0 et 9.
        if (!Array.isArray(this.valeurs)) {
            throw new Error("this.valeurs n'est pas un tableau.");
        }

        // Vérifier si toutes les valeurs sont comprises entre 0 et 9.
        const toutesValides = this.valeurs.every(val => val >= 0 && val <= 9);

        if (toutesValides) {
            // Si toutes les valeurs sont entre 0 et 9, créer une chaîne simple
            return this.valeurs.join('');
        } else {
            // Sinon, créer une chaîne avec les valeurs séparées par des points
            return this.valeurs.join('.');
        }
    }

// Cette méthode modifie la valeur de l'accord suite à un clic sur la grille
    modifieValeursSurClic(relatifXDansGrille, relatifYDansGrille)
    {
        // Modifier l'élément souhaité
        if (relatifXDansGrille < this.valeurs.length) {
            let absoluY = relatifYDansGrille + (parseInt(this.caseDepart) - 1);
            this.valeurs[relatifXDansGrille] = absoluY.toString(); // Assurez-vous que relatifYDansGrille est converti en chaîne
            console.log("Clic sur case " + absoluY);
        }
        // Reconvertir le tableau en une chaîne et mettre à jour la valeur de l'élément
        return this.chaineValeur();
    }

// Calcule la case de départ qui semble le plus appropriée pour la position
    calculeCaseDepart() {
        let caseDepart = 1;

        if (
            this.getValeurCaseMin() > 1 &&
            this.getValeurCaseMax() > 5
        ) {
            caseDepart = this.getValeurCaseMin();
        }
        return caseDepart;
    }

    chercheAccordParNom(nomAccord)
    {
        this.setNomAccord(nomAccord);
        this.setValeursByString(tableauAccords[this.nomAccord]);
    }

    chercheAccordSuivant() {
        // Trouver l'index de l'accord actuel dans le tableau
        let index = Object.keys(tableauAccords).indexOf(this.nomAccord);

        if (index !== Object.keys(tableauAccords).length - 1) {
            // Passer à l'accord suivant (n+1)
            index += 1;
        } else {
            index = 0;
        }
        let prochainAccord = Object.keys(tableauAccords)[index];
        this.valeurs = tableauAccords[prochainAccord];
        this.nomAccord = prochainAccord;
        console.log("Accord suivant: " + this.nomAccord);
        this.chercheAccordParNom(this.nomAccord);
    }

    chercheAccordPrecedent() {
        let index = Object.keys(tableauAccords).indexOf(this.nomAccord);

        if (index > 0) {
            index -= 1;
        } else {
            index = Object.keys(tableauAccords).length - 1;
        }

        let accordPrecedent = Object.keys(tableauAccords)[index];
        this.valeurs = tableauAccords[accordPrecedent];
        this.nomAccord = accordPrecedent;
        document.getElementById("name").value = this.nomAccord;
        this.chercheAccordParNom(this.nomAccord);
        console.log(`Accord précédent: ${this.nomAccord}`);
    }

    // Cherche la position donnée par chaine dans le dico d'accords, et donne un nom
    chercheAccordParPosition(sPosition)
    {
        this.nomAccord = "non répertorié";
        for (let key in tableauAccords) {
            if (tableauAccords[key] === sPosition) {
                this.nomAccord = key;
                break;
            }
        }
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

// Tire un accord au hasard dans la bibliothèque !
    setAccordAuHasard()
    {
        const accords = Object.keys(tableauAccords);
        let nombreDaccords = accords.length;
        const numeroAccord = this.getRandomInt(nombreDaccords);
        let saisieName = document.getElementById("name");
        saisieName.value = accords[numeroAccord];
        console.log("Saisiename : " + accords[numeroAccord]);
        this.chercheAccordParNom(saisieName.value);
    }

// trouve la frette la plus basse jouée dans l'accord
    getValeurCaseMin()
    {
        let valMin = CASE_MAX;
        for (let compteur = 0; compteur < CORDES_MAX; compteur++) {
            if (this.valeurs[compteur] > 0 && this.valeurs[compteur] < valMin) {
                valMin = this.valeurs[compteur];
            }
        }
        console.log("CaseMin  de " + this.valeurs + " = " + valMin);
        return parseInt(valMin);
    }

// trouve la frette la plus haute jouée dans l'accord
    getValeurCaseMax()
    {
        let valMax = 0;
        for (let compteur = 0; compteur < CORDES_MAX; compteur++) {
            if (this.valeurs[compteur] > 0 && this.valeurs[compteur] > valMax) {
                valMax = this.valeurs[compteur];
            }
        }
        console.log("CaseMax  de " + this.valeurs + " = " + valMax);
        return parseInt(valMax);
    }


}