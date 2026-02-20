const CASE_MAX = 12;

const CORDES_MAX = 4;

// Assuming tableauAccords is globally available or imported elsewhere.
// For example, it might be loaded from a generated file.
// Example structure:
// const tableauAccords = {
//     "C": "0003",
//     "G": "0232",
//     "Am": "0100",
//     "Cmaj7": "0002",
//     // ... more chords
// };


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
        // Check if all values are simple digits (0-9) for 'simple' string format
        const toutesValides = this.valeurs.every(val => val >= 0 && val <= 9);
        if (toutesValides) {
            return this.valeurs.map(v => v === -1 ? 'x' : v).join('');
        } else {
            // Use complex format if any value is outside 0-9 or is -1 for 'x'
            return this.valeurs.map(v => v === -1 ? 'x' : v).join('.');
        }
    }

    modifieValeursSurClic(relatifXDansGrille, relatifYDansGrille, caseDepartEffective) {
        if (relatifXDansGrille >= 0 && relatifXDansGrille < CORDES_MAX) {
            // Si on clique sur la frette 0 (sillet), on alterne entre 0 (corde à vide) et -1 (corde étouffée)
            if (relatifYDansGrille === 0) {
                this.valeurs[relatifXDansGrille] = (this.valeurs[relatifXDansGrille] === 0) ? -1 : 0;
            } else {
                let absoluY = relatifYDansGrille + (caseDepartEffective - 1);
                // Si on reclique sur la même frette, on libère la corde (remet à 0 si ce n'était pas déjà étouffé)
                this.valeurs[relatifXDansGrille] = (this.valeurs[relatifXDansGrille] === absoluY) ? 0 : absoluY;
            }
        }
        return this.chaineValeur();
    }

    calculeCaseDepart() {
        let caseDepart = 1;
        const minFrette = this.getValeurCaseMin();
        const maxFrette = this.getValeurCaseMax();

        if (minFrette > 1 && maxFrette > 5) { // If the lowest pressed fret is > 1 and there are high frets too
            caseDepart = minFrette;
        } else if (maxFrette > 4) { // If any fret is above 4, set caseDepart to start near it
            caseDepart = Math.max(1, maxFrette - 3); // Start a few frets below the highest fret
        }
        return caseDepart;
    }

    // Modified function to search by name, handle partial matches, and sort results.
    // Returns an object: { found: boolean, exactMatch: boolean, results: Array<{name: string, position: string, isFavorite: boolean}> }
    chercheAccordParNom(nomAccordQuery, dictionnaire = tableauAccords) {
        console.log(`[PenseDiagrammeUkulele] Searching for chord: "${nomAccordQuery}"`);
        // Clean up the input query
        const nomAccord = nomAccordQuery ? nomAccordQuery.trim() : "";

        // If query is empty, clear the current accord and return no results
        if (!nomAccord) {
            console.log("[PenseDiagrammeUkulele] Search query is empty. Clearing chord.");
            this.setNomAccord("");
            this.valeurs = [0, 0, 0, 0]; // Clear diagram
            return { found: false, exactMatch: false, results: [] }; 
        }

        // Check for an exact match first
        if (dictionnaire[nomAccord]) {
            console.log(`[PenseDiagrammeUkulele] Exact match found for "${nomAccord}".`);
            this.setNomAccord(nomAccord);
            this.setValeursByString(dictionnaire[nomAccord]);
            // Return info about the exact match found
            const position = dictionnaire[nomAccord];
            // Ensure globalThis.isFavorite is available before calling
            const isFav = globalThis.isFavorite ? globalThis.isFavorite(position) : false; 
            console.log(`[PenseDiagrammeUkulele] Exact match is favorite: ${isFav}`);
            return { found: true, exactMatch: true, results: [{ name: nomAccord, position: position, isFavorite: isFav }] };
        } else {
            console.log(`[PenseDiagrammeUkulele] No exact match for "${nomAccord}". Searching for partial matches.`);
            // If no exact match, perform a search for partial matches (case-insensitive, startsWith) and sort
            const searchResults = [];
            const lowerCasePattern = nomAccord.toLowerCase();

            for (const name in dictionnaire) {
                // Check if the chord name starts with the query pattern (case-insensitive)
                if (name.toLowerCase().startsWith(lowerCasePattern)) { 
                    const position = dictionnaire[name];
                    // Ensure globalThis.isFavorite is available
                    const isFav = globalThis.isFavorite ? globalThis.isFavorite(position) : false; 
                    searchResults.push({ name, position, isFavorite: isFav });
                }
            }

            console.log(`[PenseDiagrammeUkulele] Found raw search results:`, searchResults);

            // Sort results: favorites first, then alphabetically by name
            searchResults.sort((a, b) => {
                if (a.isFavorite && !b.isFavorite) return -1; // a is favorite, b is not
                if (!a.isFavorite && b.isFavorite) return 1;  // a is not favorite, b is
                // If both are favorites or both are not, sort alphabetically by name
                return a.name.localeCompare(b.name);
            });

            console.log(`[PenseDiagrammeUkulele] Sorted search results (favorites first):`, searchResults);

            // If matches were found, update to the first one (most relevant/favorite)
            if (searchResults.length > 0) {
                const firstMatch = searchResults[0];
                this.setNomAccord(firstMatch.name);
                this.setValeursByString(firstMatch.position);
                console.log(`[PenseDiagrammeUkulele] Selected first match: "${firstMatch.name}" (Favorite: ${firstMatch.isFavorite})`);
                // Return info about the search results, with the first one being the chosen one.
                // The caller can use the `results` array to display other options if needed.
                return { found: true, exactMatch: false, results: searchResults };
            } else {
                // No matches found
                console.log(`[PenseDiagrammeUkulele] No partial matches found for "${nomAccord}".`);
                this.setNomAccord("non répertorié"); // Indicate no chord found
                this.valeurs = [0, 0, 0, 0]; // Clear diagram
                return { found: false, results: [] };
            }
        }
    }

    chercheAccordSuivant(dictionnaire = tableauAccords) {
        const keys = Object.keys(dictionnaire);
        // Ensure keys are sorted alphabetically before finding index for consistent navigation
        keys.sort(); 
        let index = keys.indexOf(this.nomAccord);
        index = (index + 1) % keys.length;
        // Call the modified chercheAccordParNom, but ignore its return value for now as per original implementation
        this.chercheAccordParNom(keys[index], dictionnaire);
        // For consistent navigation, we might want to return the found chord name, or just rely on state update.
        // Since original didn't return, we continue with state update.
    }

    chercheAccordPrecedent(dictionnaire = tableauAccords) {
        const keys = Object.keys(dictionnaire);
        // Ensure keys are sorted alphabetically for consistent navigation
        keys.sort(); 
        let index = keys.indexOf(this.nomAccord);
        if (index <= 0) {
            index = keys.length - 1; // Wrap around to the last element
        } else {
            index -= 1;
        }
        // Call the modified chercheAccordParNom, but ignore its return value for now as per original implementation
        this.chercheAccordParNom(keys[index], dictionnaire);
        // Similar to chercheAccordSuivant, relying on state update.
    }

    chercheAccordParPosition(sPosition, dictionnaire = tableauAccords) {
        // This method finds a chord name by its position string.
        this.setNomAccord("non répertorié"); // Default to not found
        for (const name in dictionnaire) {
            if (dictionnaire[name] === sPosition) {
                this.setNomAccord(name);
                break; // Found the first match, stop searching
            }
        }
        // It doesn't return results, just updates the current accord name.
    }

    setAccordAuHasard(dictionnaire = tableauAccords) {
        const accords = Object.keys(dictionnaire);
        // Ensure keys are sorted alphabetically for consistent random selection distribution if needed,
        // though Math.random should pick any key with equal probability.
        const numeroAccord = Math.floor(Math.random() * accords.length);
        this.chercheAccordParNom(accords[numeroAccord], dictionnaire);
    }

    getValeurCaseMin() {
        let valMin = CASE_MAX;
        let aDesNotesAppuyees = false;
        for (let i = 0; i < CORDES_MAX; i++) {
            if (this.valeurs[i] > 0) { // Ignore 'x' (-1) and '0' (open string) for min/max frette calculation
                if (this.valeurs[i] < valMin) valMin = this.valeurs[i];
                aDesNotesAppuyees = true;
            }
        }
        // If no fretted notes, return 1 (default start of fretboard)
        return aDesNotesAppuyees ? parseInt(valMin) : 1;
    }

    getValeurCaseMax() {
        let valMax = 0;
        for (let i = 0; i < CORDES_MAX; i++) {
            if (this.valeurs[i] > 0) { // Ignore 'x' (-1) and '0' (open string) for max frette calculation
                if (this.valeurs[i] > valMax) {
                    valMax = this.valeurs[i];
                }
            }
        }
        return parseInt(valMax);
    }

    // Un accord est jouable si :
    // 1. Les frettes sont entre 0 et 12 (ou -1 pour X)
    // 2. L'écart entre la frette la plus basse et la plus haute (hors cordes à vide et étouffées) est <= 3
    estJouable() {
        let minFrette = CASE_MAX + 1; // Initialize higher than max possible fret
        let maxFrette = 0;
        let aDesNotesAppuyees = false;

        for (let i = 0; i < CORDES_MAX; i++) {
            let v = this.valeurs[i];
            if (v > 12) return false; // Fret is too high on the neck
            if (v > 0) { // Consider only fretted notes
                if (v < minFrette) minFrette = v;
                if (v > maxFrette) maxFrette = v;
                aDesNotesAppuyees = true;
            }
        }

        if (!aDesNotesAppuyees) return true; // If no fretted notes, it's considered playable (e.g., open strings only)

        // Check if the span of fretted notes is within 3 frets
        return (maxFrette - minFrette) <= 3;
    }
}
