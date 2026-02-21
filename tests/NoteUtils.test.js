import { describe, it, expect } from 'vitest';
import { NoteUtils } from '../src/js/NoteUtils.js';

describe('NoteUtils', () => {
    it('doit trouver l index correct pour une note', () => {
        expect(NoteUtils.getNoteIndex('C')).toBe(0);
        expect(NoteUtils.getNoteIndex('A')).toBe(9);
        expect(NoteUtils.getNoteIndex('Bb')).toBe(10);
    });

    it('doit retourner la note correcte à une certaine frette', () => {
        // Corde de Sol (G), frette 2 -> La (A)
        expect(NoteUtils.getNoteAt('G', 2)).toBe('A');
        
        // Corde de Do (C), frette 0 -> Do (C)
        expect(NoteUtils.getNoteAt('C', 0)).toBe('C');
        
        // Corde étouffée (-1) -> X
        expect(NoteUtils.getNoteAt('G', -1)).toBe('X');
    });

    it('doit gérer les notes en minuscules', () => {
        expect(NoteUtils.getNoteIndex('c')).toBe(0);
        expect(NoteUtils.getNoteIndex('bb')).toBe(10);
    });
});
