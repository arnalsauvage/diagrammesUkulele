import { describe, it, expect } from 'vitest';
import { PenseDiagrammeUkulele } from '../src/js/PenseDiagrammeUkulele.js';

describe('PenseDiagrammeUkulele', () => {
    it('doit initialiser correctement un accord', () => {
        const pense = new PenseDiagrammeUkulele('C', '0003', 1);
        expect(pense.nomAccord).toBe('C');
        expect(pense.valeurs).toEqual([0, 0, 0, 3]);
    });

    it('doit identifier les accords enharmoniques', () => {
        const pense = new PenseDiagrammeUkulele('Bb', '3211', 1);
        const enh = pense.getEnharmonique('Bb');
        expect(enh).toBe('A#');
        
        const enh7 = pense.getEnharmonique('C#7');
        expect(enh7).toBe('Db7');
    });

    it('doit valider si un accord est jouable', () => {
        const easy = new PenseDiagrammeUkulele('C', '0003', 1);
        expect(easy.estJouable()).toBe(true);

        // Accord impossible (écart entre frette 1 et frette 10)
        const impossible = new PenseDiagrammeUkulele('?', '1.10.0.0', 1);
        expect(impossible.estJouable()).toBe(false);
    });

    it('doit générer la chaîne de valeur correcte', () => {
        const simple = new PenseDiagrammeUkulele('C', '0003', 1);
        expect(simple.chaineValeur()).toBe('0003');

        const complexe = new PenseDiagrammeUkulele('?', '0.10.11.12', 1);
        expect(complexe.chaineValeur()).toBe('0.10.11.12');
    });
});
