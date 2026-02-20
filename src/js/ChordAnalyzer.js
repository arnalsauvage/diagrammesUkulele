class ChordAnalyzer {
    // Bibliothèque des types d'accords (intervalles en demi-tons par rapport à la fondamentale)
    static formulas = {
        "": [0, 4, 7],          // Majeur
        "m": [0, 3, 7],         // Mineur
        "7": [0, 4, 7, 10],     // 7ème de dominante
        "7M": [0, 4, 7, 11],    // 7ème majeure
        "m7": [0, 3, 7, 10],    // Mineur 7
        "m7M": [0, 3, 7, 11],   // Mineur 7M
        "sus2": [0, 2, 7],      // Suspendu 2
        "sus4": [0, 5, 7],      // Suspendu 4
        "dim": [0, 3, 6],       // Diminué (triade)
        "dim7": [0, 3, 6, 9],   // Diminué 7
        "aug": [0, 4, 8],       // Quinte augmentée
        "6": [0, 4, 7, 9],      // Sixte
        "m6": [0, 3, 7, 9],     // Mineur 6
        "5": [0, 7]             // Power chord
    };

    constructor(notes) {
        this.rawNotes = notes.filter(n => n !== "X" && n !== "?");
        this.uniqueNotes = this.calculateUniqueSortedNotes();
    }

    calculateUniqueSortedNotes() {
        const unique = [...new Set(this.rawNotes)];
        return unique.sort((a, b) => NoteUtils.getNoteIndex(a) - NoteUtils.getNoteIndex(b));
    }

    getInversions() {
        const inversions = [];
        const n = this.uniqueNotes.length;
        for (let i = 0; i < n; i++) {
            const inversion = [...this.uniqueNotes.slice(i), ...this.uniqueNotes.slice(0, i)];
            inversions.push(inversion);
        }
        return inversions;
    }

    // Identifie l'accord en testant tous les renversements
    identifyChord() {
        if (this.uniqueNotes.length === 0) return "---";

        const possibleNames = [];
        const inversions = this.getInversions();

        for (const notes of inversions) {
            const root = notes[0];
            const intervals = this.calculateIntervals(notes);
            
            // On cherche une correspondance dans les formules
            for (const [suffix, formula] of Object.entries(ChordAnalyzer.formulas)) {
                if (this.arraysEqual(intervals, formula)) {
                    possibleNames.push(root + suffix);
                }
            }
        }

        return possibleNames.length > 0 ? possibleNames.join(' ou ') : "inconnu";
    }

    // Calcule les intervalles en demi-tons par rapport à la première note
    calculateIntervals(notes) {
        const rootIndex = NoteUtils.getNoteIndex(notes[0]);
        return notes.map(note => {
            let interval = NoteUtils.getNoteIndex(note) - rootIndex;
            if (interval < 0) interval += 12; // Gérer le passage à l'octave
            return interval;
        }).sort((a, b) => a - b);
    }

    arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
}
