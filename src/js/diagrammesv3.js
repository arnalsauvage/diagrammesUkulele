document.addEventListener("DOMContentLoaded", () => {
    const FAVORITES_STORAGE_KEY = 'ukuleleChordFavorites';

    globalThis.getFavorites = () => {
        const favoritesJson = localStorage.getItem(FAVORITES_STORAGE_KEY);
        return favoritesJson ? JSON.parse(favoritesJson) : [];
    };

    const saveFavorites = (favorites) => {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    };

    globalThis.addFavorite = (positionString) => {
        if (!positionString) return;
        const favorites = globalThis.getFavorites();
        if (!favorites.includes(positionString)) {
            favorites.push(positionString);
            saveFavorites(favorites);
        }
    };

    globalThis.removeFavorite = (positionString) => {
        if (!positionString) return;
        let favorites = globalThis.getFavorites();
        favorites = favorites.filter(fav => fav !== positionString);
        saveFavorites(favorites);
    };

    globalThis.isFavorite = (positionString) => {
        if (!positionString) return false;
        return globalThis.getFavorites().includes(positionString);
    };

    const getCurrentPositionString = () => {
        const diagram = globalThis.diagramme;
        if (!diagram || !diagram.penseDiagrammeUkulele) return null;
        return diagram.penseDiagrammeUkulele.chaineValeur();
    };

    globalThis.updateFavoriteIconState = () => {
        const favoriteToggle = document.getElementById('favorite-toggle');
        const currentPositionStr = getCurrentPositionString();
        if (favoriteToggle && currentPositionStr) {
            if (globalThis.isFavorite(currentPositionStr)) {
                favoriteToggle.textContent = '★';
                favoriteToggle.style.color = 'gold';
            } else {
                favoriteToggle.textContent = '☆';
                favoriteToggle.style.color = 'inherit';
            }
        }
    };

    globalThis.updateMainDiagramFavoriteStatus = () => {
        const currentPositionStr = getCurrentPositionString();
        const diagram = globalThis.diagramme;
        if (diagram) {
            diagram.isFavorite = globalThis.isFavorite(currentPositionStr);
            diagram.dessineDiagramme(); 
        }
    };

    const options = {
        taille: 40,
        tailleGrillex: 4,
        tailleGrilley: 6,
        margeHauteurGrille: 35,
        margeGaucheGrille: 20,
        epaisseurLigne: 3,
        couleurGrille: "#333333",
        bGrilleTordue: true,
    };

    globalThis.diagramme = new DessineDiagrammeUkulele("diagramme1", options);
    globalThis.diagramme.startup();

    globalThis.updateMainDiagramFavoriteStatus();
    globalThis.updateFavoriteIconState();

    const inputName = document.getElementById("name");
    const inputValeurs = document.getElementById("valeurs"); 
    
    const handleChordUpdate = () => {
        globalThis.diagramme.dessineDiagramme();
        globalThis.updateMainDiagramFavoriteStatus();
        globalThis.updateFavoriteIconState();
    };

    inputName.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            globalThis.diagramme.chercheAccordParNom();
            handleChordUpdate();
        }
    });

    const searchByNameIcon = document.getElementById("loupeChercheAccordParNom");
    if (searchByNameIcon) {
        searchByNameIcon.addEventListener("click", () => {
            globalThis.diagramme.chercheAccordParNom();
            handleChordUpdate();
        });
    }

    inputValeurs.addEventListener("change", () => { 
        globalThis.diagramme.chercheAccordParPosition(); 
        handleChordUpdate();
    });

    document.getElementById("button-dessine").addEventListener("click", () => {
        globalThis.diagramme.syncUIToPense(); 
        handleChordUpdate();
    });

    const checkAuto = document.getElementById("caseDepartAuto");
    const inputCase = document.getElementById("caseDepart");
    const toggleCaseInput = () => {
        inputCase.style.display = checkAuto.checked ? "none" : "inline-block";
    };
    checkAuto.addEventListener("change", () => {
        toggleCaseInput();
        globalThis.diagramme.syncUIToPense();
        handleChordUpdate();
    });
    inputCase.addEventListener("change", () => {
        globalThis.diagramme.syncUIToPense();
        handleChordUpdate();
    });
    toggleCaseInput();

    const fader = document.getElementById("fader");
    const outputTaille = document.getElementById("taille");
    fader.addEventListener("input", (e) => {
        const nouvelleTaille = e.target.value;
        outputTaille.value = nouvelleTaille;
        globalThis.diagramme.changeTaille(nouvelleTaille);
        globalThis.diagramme.dessineDiagramme();
    });

    document.getElementById("randomChord").addEventListener("click", () => {
        globalThis.diagramme.setAccordAuHasard();
        handleChordUpdate();
    });
    document.getElementById("btnPrecChord").addEventListener("click", () => {
        globalThis.diagramme.chercheAccordPrecedent();
        handleChordUpdate();
    });
    document.getElementById("btnNextChord").addEventListener("click", () => {
        globalThis.diagramme.chercheAccordSuivant();
        handleChordUpdate();
    });

    document.getElementById("download").addEventListener("click", function(e) {
        globalThis.diagramme.download_img(this);
    });

    // --- FAVORITE TOGGLE ---
    const favoriteToggle = document.getElementById('favorite-toggle');
    if (favoriteToggle) {
        favoriteToggle.addEventListener('click', () => {
            const currentPositionStr = getCurrentPositionString();
            if (currentPositionStr) {
                if (globalThis.isFavorite(currentPositionStr)) {
                    globalThis.removeFavorite(currentPositionStr);
                } else {
                    globalThis.addFavorite(currentPositionStr);
                }
                handleChordUpdate();
            }
        });
    }

    // --- PALETTE ET BAGUETTE MAGIQUE (COULEURS ET ASSISTANT) ---
    const assistant = document.getElementById('chord-assistant');
    const toggleAssistantBtn = document.getElementById('toggle-assistant');
    if (toggleAssistantBtn && assistant) {
        toggleAssistantBtn.addEventListener('click', () => {
            const isHidden = assistant.style.display === 'none';
            assistant.style.display = isHidden ? 'block' : 'none';
            toggleAssistantBtn.style.filter = isHidden ? 'drop-shadow(0 0 5px var(--primary-color))' : 'none';
        });
    }

    const colorControls = document.getElementById('color-controls');
    const toggleColorsBtn = document.getElementById('toggle-colors');
    if (toggleColorsBtn && colorControls) {
        toggleColorsBtn.addEventListener('click', () => {
            const isHidden = colorControls.style.display === 'none';
            colorControls.style.display = isHidden ? 'block' : 'none';
            toggleColorsBtn.style.filter = isHidden ? 'drop-shadow(0 0 5px var(--primary-color))' : 'none';
        });
    }

    // Assistant logic (Simplified for clarity)
    let selection = { root: 'C', accidental: '', family: '' };
    const updateFromAssistant = () => {
        const fullName = selection.root + selection.accidental + selection.family;
        inputName.value = fullName;
        globalThis.diagramme.chercheAccordParNom();
        handleChordUpdate(); 
    };

    const setupAssistantGroup = (rowId, selectionKey) => {
        const buttons = document.querySelectorAll(`#${rowId} .mini-btn`);
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                selection[selectionKey] = btn.dataset.val; 
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateFromAssistant();
            });
        });
    };
    setupAssistantGroup('assistant-roots', 'root');
    setupAssistantGroup('assistant-accidentals', 'accidental');
    setupAssistantGroup('assistant-families', 'family');
});
