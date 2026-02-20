const CASE_MAX = 12;

const CORDES_MAX = 4;

class PenseDiagrammeUkulele {
    // caseDepart : entier positif (de 0 à 12)
    // nomAccord:  Chaîne de caractères
    // valeurs: tableau de 4 valeurs entières (de -1 à 18)

    constructor(nomAccord, valeurs, caseDepart) {
        this.valeurs = [0, 0, 0, 0];
        this.setCaseDepart(caseDepart);
        this.setNomAccord(nomAccord);
        this.setValeursByString(valeurs);
    }

    setValeursByString(maChaine) {
        if (!maChaine) {
            this.valeurs = [0, 0, 0, 0];
            return;
        }
        if (maChaine.length === CORDES_MAX) {
            this.convertitChaineSimple(maChaine);
        } else {
            this.convertitChaineComplexe(maChaine);
        }
    }

    getValeurCorde(numeroCorde) {
        return this.valeurs[numeroCorde];
    }

    convertitChaineSimple(maChaine) {
        this.valeurs = maChaine.split('').map(val => val === 'x' ? -1 : parseInt(val, 10));
    }

    convertitChaineComplexe(maChaine) {
        const valeursArray = maChaine.split('.');
        if (valeursArray.length !== CORDES_MAX) {
            throw new Error("La chaîne doit contenir exactement 4 valeurs séparées par des points.");
        }
        this.valeurs = valeursArray.map(val => {
            if (val === 'x') return -1;
            const nombre = parseInt(val, 10);
            if (!Number.isInteger(nombre) || nombre < -1 || nombre > 20) {
                throw new Error("Chaque valeur doit être un entier entre -1 et 20 ou 'x'.");
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
        if (!Array.isArray(this.valeurs)) {
            throw new Error("this.valeurs n'est pas un tableau.");
        }
        const toutesValides = this.valeurs.every(val => val >= 0 && val <= 9);
        if (toutesValides) {
            return this.valeurs.map(v => v === -1 ? 'x' : v).join('');
        } else {
            return this.valeurs.map(v => v === -1 ? 'x' : v).join('.');
        }
    }

    modifieValeursSurClic(relatifXDansGrille, relatifYDansGrille, caseDepartEffective) {
        if (relatifXDansGrille >= 0 && relatifXDansGrille < CORDES_MAX) {
            // Si on clique sur la frette 0 (sillet), on alterne entre 0 et -1 (corde étouffée)
            if (relatifYDansGrille === 0) {
                this.valeurs[relatifXDansGrille] = (this.valeurs[relatifXDansGrille] === 0) ? -1 : 0;
            } else {
                let absoluY = relatifYDansGrille + (caseDepartEffective - 1);
                // Si on reclique sur la même frette, on libère la corde (0)
                this.valeurs[relatifXDansGrille] = (this.valeurs[relatifXDansGrille] === absoluY) ? 0 : absoluY;
            }
        }
        return this.chaineValeur();
    }

    calculeCaseDepart() {
        let caseDepart = 1;
        if (this.getValeurCaseMin() > 1 && this.getValeurCaseMax() > 5) {
            caseDepart = this.getValeurCaseMin();
        }
        return caseDepart;
    }

    chercheAccordParNom(nomAccord, dictionnaire = tableauAccords) {
        if (dictionnaire[nomAccord]) {
            this.setNomAccord(nomAccord);
            this.setValeursByString(dictionnaire[nomAccord]);
            return true;
        }
        return false;
    }

    chercheAccordSuivant(dictionnaire = tableauAccords) {
        const keys = Object.keys(dictionnaire);
        let index = keys.indexOf(this.nomAccord);
        index = (index + 1) % keys.length;
        this.chercheAccordParNom(keys[index], dictionnaire);
    }

    chercheAccordPrecedent(dictionnaire = tableauAccords) {
        const keys = Object.keys(dictionnaire);
        let index = keys.indexOf(this.nomAccord);
        if (index <= 0) {
            index = keys.length - 1;
        } else {
            index -= 1;
        }
        this.chercheAccordParNom(keys[index], dictionnaire);
    }

    chercheAccordParPosition(sPosition, dictionnaire = tableauAccords) {
        this.nomAccord = "non répertorié";
        for (let key in dictionnaire) {
            if (dictionnaire[key] === sPosition) {
                this.nomAccord = key;
                break;
            }
        }
    }

    setAccordAuHasard(dictionnaire = tableauAccords) {
        const accords = Object.keys(dictionnaire);
        const numeroAccord = Math.floor(Math.random() * accords.length);
        this.chercheAccordParNom(accords[numeroAccord], dictionnaire);
    }

    getValeurCaseMin() {
        let valMin = CASE_MAX;
        let aDesNotesAppuyees = false;
        for (let i = 0; i < CORDES_MAX; i++) {
            if (this.valeurs[i] > 0) {
                if (this.valeurs[i] < valMin) valMin = this.valeurs[i];
                aDesNotesAppuyees = true;
            }
        }
        return aDesNotesAppuyees ? parseInt(valMin) : 1;
    }

    getValeurCaseMax() {
        let valMax = 0;
        for (let i = 0; i < CORDES_MAX; i++) {
            if (this.valeurs[i] > 0 && this.valeurs[i] > valMax) {
                valMax = this.valeurs[i];
            }
        }
        return parseInt(valMax);
    }
}

