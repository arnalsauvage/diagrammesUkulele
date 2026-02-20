/**
 * Script de génération exhaustive des accords de Ukulélé
 * Parcourt toutes les combinaisons, filtre par jouabilité,
 * et identifie le nom de l'accord.
 */

class ChordDataGenerator {
    static generate() {
        const results = {};
        const instrument = new Instrument("Ukulele", ['G', 'C', 'E', 'A']);
        const frets = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        
        console.log("Démarrage de la génération (38 416 combinaisons)...");
        let count = 0;
        let playables = 0;

        for (let c1 of frets) {
            for (let c2 of frets) {
                for (let c3 of frets) {
                    for (let c4 of frets) {
                        count++;
                        const pos = [c1, c2, c3, c4];
                        
                        // 1. Vérifier jouabilité
                        if (this.isPlayable(pos)) {
                            playables++;
                            
                            // 2. Récupérer les notes
                            const notes = instrument.getNotesForPosition(pos);
                            
                            // 3. Identifier l'accord
                            const analyzer = new ChordAnalyzer(notes);
                            const names = analyzer.identifyChord(); // Peut renvoyer "C ou Am7"
                            
                            if (names !== "inconnu" && names !== "---") {
                                const posString = this.formatPos(pos);
                                
                                // Gérer les noms multiples (ex: C ou Am7)
                                names.split(' ou ').forEach(name => {
                                    if (!results[name]) results[name] = [];
                                    // Éviter les doublons de positions pour un même nom
                                    if (!results[name].includes(posString)) {
                                        results[name].push(posString);
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }

        console.log(`Génération terminée : ${playables} positions jouables trouvées.`);
        return results;
    }

    static isPlayable(pos) {
        let min = 13;
        let max = 0;
        let pressed = false;

        for (let v of pos) {
            if (v > 12) return false;
            if (v > 0) {
                if (v < min) min = v;
                if (v > max) max = v;
                pressed = true;
            }
        }
        if (!pressed) return true;
        return (max - min) <= 3;
    }

    static formatPos(pos) {
        // Convertit [2, 2, 1, 0] en "2210" ou "2.2.1.0"
        const needsDots = pos.some(v => v > 9 || v === -1);
        return needsDots ? pos.map(v => v === -1 ? 'x' : v).join('.') : pos.join('');
    }

    static saveAsFile(data) {
        const content = "const generatedChords = " + JSON.stringify(data, null, 2) + ";";
        const blob = new Blob([content], {type: "text/javascript"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "generatedChords.js";
        a.click();
    }
}
