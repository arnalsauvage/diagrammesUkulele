/**
 * Script de génération exhaustive des accords de Ukulélé
 * Parcourt toutes les combinaisons, filtre par jouabilité,
 * et identifie le nom de l'accord.
 */

class ChordDataGenerator {
    static generate() {
        console.log("Démarrage de la génération (38 416 combinaisons)...");

        const instrument = new Instrument("Ukulele", ['G', 'C', 'E', 'A']);
        const positions = this.generatePositions();
        const results = {};

        positions
            .filter(pos => this.isPlayable(pos))
            .forEach(pos => this.processPosition(pos, instrument, results));

        console.log(`Génération terminée : ${Object.values(results).flat().length} positions jouables trouvées.`);
        return results;
    }

    // --- Méthodes privées ---

    static generatePositions(frets = Array.from({ length: 13 }, (_, i) => i)) {
        return frets.flatMap(c1 =>
            frets.flatMap(c2 =>
                frets.flatMap(c3 =>
                    frets.map(c4 => [c1, c2, c3, c4])
                )
            )
        );
    }

    static processPosition(pos, instrument, results) {
        const notes = instrument.getNotesForPosition(pos);
        const names = new ChordAnalyzer(notes).identifyChord();

        if (this.isValidChordName(names)) {
            this.addToResults(results, pos, names);
        }
    }

    static isValidChordName(name) {
        return name !== "inconnu" && name !== "---";
    }

    static addToResults(results, pos, names) {
        const posString = this.formatPos(pos);

        names.split(' ou ').forEach(name => {
            results[name] ??= [];
            if (!results[name].includes(posString)) {
                results[name].push(posString);
            }
        });
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
