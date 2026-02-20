class NoteUtils {
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
        let index = this.notes.indexOf(note.toUpperCase());
        if (index === -1) index = this.notesAlt.indexOf(note.toUpperCase());
        return index;
    }
}
