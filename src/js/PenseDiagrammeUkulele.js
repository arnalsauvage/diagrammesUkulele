const CASE_MAX = 12;
const CORDES_MAX = 4;

export class PenseDiagrammeUkulele {
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
            return nombre;
        });
    }

    setCaseDepart(value) {
        this.caseDepart = value;
    }

    setNomAccord(value) {
        this.nomAccord = value;
    }

    chaineValeur() {
        const toutesValides = this.valeurs.every(val => val >= 0 && val <= 9);
        if (toutesValides) {
            return this.valeurs.map(v => v === -1 ? 'x' : v).join('');
        } else {
            return this.valeurs.map(v => v === -1 ? 'x' : v).join('.');
        }
    }

    modifieValeursSurClic(relatifXDansGrille, relatifYDansGrille, caseDepartEffective) {
        if (relatifXDansGrille >= 0 && relatifXDansGrille < CORDES_MAX) {
            if (relatifYDansGrille === 0) {
                this.valeurs[relatifXDansGrille] = (this.valeurs[relatifXDansGrille] === 0) ? -1 : 0;
            } else {
                let absoluY = relatifYDansGrille + (caseDepartEffective - 1);
                this.valeurs[relatifXDansGrille] = (this.valeurs[relatifXDansGrille] === absoluY) ? 0 : absoluY;
            }
        }
        return this.chaineValeur();
    }

    calculeCaseDepart() {
        let caseDepart = 1;
        const minFrette = this.getValeurCaseMin();
        const maxFrette = this.getValeurCaseMax();
        if (minFrette > 1 && maxFrette > 5) {
            caseDepart = minFrette;
        } else if (maxFrette > 4) {
            caseDepart = Math.max(1, maxFrette - 3);
        }
        return caseDepart;
    }

    // RECHERCHE CORRIGEE : MATCH EXACT ET TRI DES POSITIONS (ALTERNATIVES)
    chercheAccordParNom(nomAccordQuery, dictionnaire, isFavoriteFn, generatedChords) {
        const nomAccord = nomAccordQuery ? nomAccordQuery.trim() : "";
        if (!nomAccord) {
            this.setNomAccord("");
            this.valeurs = [0, 0, 0, 0];
            return { found: false, results: [] }; 
        }

        const existeDansTableau = !!dictionnaire[nomAccord];
        const existeDansGenerated = (!!generatedChords && !!generatedChords[nomAccord]);

        if (!existeDansTableau && !existeDansGenerated) {
            this.setNomAccord("non répertorié");
            this.valeurs = [0, 0, 0, 0];
            return { found: false, results: [] };
        }

        this.setNomAccord(nomAccord);

        let positions = [];
        if (existeDansGenerated) {
            positions = [...generatedChords[nomAccord]].filter(pos => !pos.includes('x'));
        } else {
            positions = [dictionnaire[nomAccord]];
        }

        const searchResults = positions.map(pos => ({
            name: nomAccord,
            position: pos,
            isFavorite: isFavoriteFn ? isFavoriteFn(pos) : false
        }));

        searchResults.sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return 0;
        });

        if (searchResults.length > 0) {
            this.setValeursByString(searchResults[0].position);
        }

        return { found: true, results: searchResults };
    }

    chercheAccordSuivant(dictionnaire) {
        const keys = Object.keys(dictionnaire).sort();
        let index = keys.indexOf(this.nomAccord);
        index = (index + 1) % keys.length;
        this.chercheAccordParNom(keys[index], dictionnaire);
    }

    chercheAccordPrecedent(dictionnaire) {
        const keys = Object.keys(dictionnaire).sort();
        let index = keys.indexOf(this.nomAccord);
        if (index <= 0) index = keys.length - 1;
        else index -= 1;
        this.chercheAccordParNom(keys[index], dictionnaire);
    }

    chercheAccordParPosition(sPosition, dictionnaire) {
        this.setNomAccord("non répertorié");
        for (const name in dictionnaire) {
            if (dictionnaire[name] === sPosition) {
                this.setNomAccord(name);
                break;
            }
        }
    }

    setAccordAuHasard(dictionnaire) {
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

    estJouable() {
        let minFrette = CASE_MAX + 1;
        let maxFrette = 0;
        let aDesNotesAppuyees = false;
        for (let i = 0; i < CORDES_MAX; i++) {
            let v = this.valeurs[i];
            if (v > 12) return false;
            if (v > 0) {
                if (v < minFrette) minFrette = v;
                if (v > maxFrette) maxFrette = v;
                aDesNotesAppuyees = true;
            }
        }
        if (!aDesNotesAppuyees) return true;
        return (maxFrette - minFrette) <= 3;
    }
}
