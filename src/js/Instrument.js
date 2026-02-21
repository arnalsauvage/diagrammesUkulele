import { NoteUtils } from './NoteUtils.js';

export class Instrument {
    constructor(nom, cordes) {
        this.nom = nom;
        this.cordes = cordes; // Tableau de notes de base, ex: ['G', 'C', 'E', 'A']
    }

    getNotesForPosition(positions) {
        // positions: tableau de chiffres, ex: [2, 2, 1, 0]
        return this.cordes.map((baseNote, index) => {
            const fret = positions[index];
            return NoteUtils.getNoteAt(baseNote, fret);
        });
    }
}

// Instance par défaut pour le Ukulélé
export const UkuleleGCEA = new Instrument("Ukulélé GCEA", ['G', 'C', 'E', 'A']);
