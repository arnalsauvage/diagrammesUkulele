const translations = {
    fr: {
        title: "Atelier Diagrammes Ukulélé",
        navToGrid: "Aller à la page Grille &rarr;",
        navToAtelier: "&larr; Retour à l'atelier",
        generatorTitle: "Générateur de Grille d'Accords",
        chordDefinition: "Définition de l'Accord",
        appearance: "Apparence",
        name: "Nom :",
        position: "Position :",
        autoFret: "Frette Auto :",
        size: "Taille :",
        dotFill: "Remplissage :",
        dotOutline: "Contour :",
        gridColor: "Couleur Grille :",
        markers: "Repères :",
        download: "Télécharger",
        refresh: "Actualiser",
        prev: "&larr; Précédent",
        next: "Suivant &rarr;",
        random: "Hasard",
        generate: "Générer la grille",
        inputPlaceholder: "Saisissez vos accords séparés par des espaces :",
        helpName: "A B C D E F G (La Si Do Re Mi Fa Sol)<br/>b : bémol, # : dièse<br/>Exemple : Am, G7, Cmaj7, Ddim",
        helpValue: "Valeurs des cordes de Sol à La.<br/>Exemple : 0003 pour Do.<br/>Points pour les cases hautes : 0.10.11.12<br/>'x' pour une corde étouffée.",
        errorFret: "⚠️ La case de départ choisie ne permet pas d'afficher toutes les notes.",
        alternativesMsg: "Alternatives : découvre {n} positions jouables pour cet accord",
        detectedChord: "Accord détecté :",
        playable: "Jouable",
        difficult: "Trop difficile",
        favTooltip: "Enregistrer en favori cette position d'accord",
        share: "Partager",
        shareSuccess: "Lien de l'accord copié !",
        shareTooltip: "Copier le lien de cet accord"
    },
    en: {
        title: "Ukulele Chord Workshop",
        navToGrid: "Go to Chord Grid Page &rarr;",
        navToAtelier: "&larr; Back to Workshop",
        generatorTitle: "Chord Grid Generator",
        chordDefinition: "Chord Definition",
        appearance: "Appearance",
        name: "Name:",
        position: "Position:",
        autoFret: "Auto Fret:",
        size: "Size:",
        dotFill: "Dot Fill:",
        dotOutline: "Dot Outline:",
        gridColor: "Grid Color:",
        markers: "Markers:",
        download: "Download",
        refresh: "Refresh",
        prev: "&larr; Prev",
        next: "Next &rarr;",
        random: "Random",
        generate: "Generate Grid",
        inputPlaceholder: "Enter chords separated by spaces:",
        helpName: "A B C D E F G (La Si Do Re Mi Fa Sol)<br/>b: flat, #: sharp<br/>Example: Am, G7, Cmaj7, Ddim",
        helpValue: "String values from G to A.<br/>Example: 0003 for C.<br/>Use dots for high frets: 0.10.11.12<br/>Use 'x' for muted strings.",
        errorFret: "⚠️ Selected starting fret doesn't allow all notes to be shown.",
        alternativesMsg: "Alternatives: discover {n} playable positions for this chord",
        detectedChord: "Detected chord:",
        playable: "Playable",
        difficult: "Too difficult",
        favTooltip: "Save this chord position as favorite",
        share: "Share",
        shareSuccess: "Chord link copied!",
        shareTooltip: "Copy link for this chord"
    }
};

export class I18n {
    constructor() {
        this.lang = localStorage.getItem('lang') || 
                    (navigator.language.startsWith('fr') ? 'fr' : 'en');
    }

    setLang(lang) {
        this.lang = lang;
        localStorage.setItem('lang', lang);
        this.translatePage();
        this.updateFlags();
    }

    t(key) {
        return translations[this.lang][key] || key;
    }

    translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (el.tagName === 'INPUT' && el.type === 'button') {
                el.value = this.t(key);
            } else if (el.tagName === 'TEXTAREA' && el.placeholder) {
              el.placeholder = this.t(key);
            } else {
                el.innerHTML = this.t(key);
            }
        });
        
        const inputAccords = document.getElementById('accordsSaisis');
        if (inputAccords) {
            const label = inputAccords.previousElementSibling;
            if (label && label.tagName === 'P') label.innerHTML = this.t('inputPlaceholder');
        }
    }

    updateFlags() {
        document.querySelectorAll('.lang-flag').forEach(el => {
            el.style.opacity = el.getAttribute('data-lang') === this.lang ? '1' : '0.3';
            el.style.cursor = 'pointer';
            el.style.border = el.getAttribute('data-lang') === this.lang ? '2px solid var(--primary-color)' : 'none';
        });
    }

    init() {
        this.translatePage();
        this.updateFlags();
        document.querySelectorAll('.lang-flag').forEach(flag => {
            flag.addEventListener('click', () => {
                this.setLang(flag.getAttribute('data-lang'));
            });
        });
    }
}

export const i18n = new I18n();
