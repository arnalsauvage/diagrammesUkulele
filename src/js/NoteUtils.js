export class NoteUtils {
    static notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Pour l'affichage plus "propre" (avec bémols si nécessaire plus tard)
    static notesAlt = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    static getNoteAt(baseNote, fret) {
        if (fret === -1) return "X"; // Corde étouffée
        
        let index = this.getNoteIndex(baseNote);
        if (index === -1) return "?";
        
        const targetIndex = (index + fret) % 12;
        return this.notes[targetIndex];
    }

    static getNoteIndex(note) {
        if (!note) return -1;
        const normalizedNote = note.charAt(0).toUpperCase() + note.slice(1).toLowerCase();
        let index = this.notes.indexOf(normalizedNote);
        if (index === -1) index = this.notesAlt.indexOf(normalizedNote);
        return index;
    }
}
