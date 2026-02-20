document.addEventListener("DOMContentLoaded", () => {
    // --- Favorites Logic ---
    const FAVORITES_STORAGE_KEY = 'ukuleleChordFavorites'; // Stores position strings like "0232"

    // --- Global helper functions for favorites ---
    // These are made global so they can be accessed by DessineDiagrammeUkulele methods.
    globalThis.getFavorites = () => {
        const favoritesJson = localStorage.getItem(FAVORITES_STORAGE_KEY);
        return favoritesJson ? JSON.parse(favoritesJson) : [];
    };

    const saveFavorites = (favorites) => {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    };

    // Takes a position string (e.g., "0232")
    globalThis.addFavorite = (positionString) => {
        if (!positionString) return;
        const favorites = globalThis.getFavorites();
        if (!favorites.includes(positionString)) {
            favorites.push(positionString);
            saveFavorites(favorites);
            console.log(`[Favorites] Added favorite position: ${positionString}`);
        }
    };

    // Takes a position string (e.g., "0232")
    globalThis.removeFavorite = (positionString) => {
        if (!positionString) return;
        let favorites = globalThis.getFavorites();
        favorites = favorites.filter(fav => fav !== positionString);
        saveFavorites(favorites);
        console.log(`[Favorites] Removed favorite position: ${positionString}`);
    };

    // Takes a position string (e.g., "0232")
    globalThis.isFavorite = (positionString) => {
        // console.log(`[Favorites] Checking if position "${positionString}" is favorite.`); // Debugging log
        if (!positionString) {
            // console.log(`[Favorites] Position string is empty, returning false.`); // Debugging log
            return false;
        }
        const favorites = globalThis.getFavorites();
        const isFav = favorites.includes(positionString);
        // console.log(`[Favorites] Found favorites: [${favorites.join(', ')}]. Is "${positionString}" favorite? ${isFav}`); // Debugging log
        return isFav;
    };
    // --- End Global Favorites Logic ---


    // Helper to convert current diagram's values to position string
    const getCurrentPositionString = () => {
        const diagram = globalThis.diagramme;
        // Ensure diagram and its penseDiagrammeUkulele are initialized and have values
        if (!diagram || !diagram.penseDiagrammeUkulele || !Array.isArray(diagram.penseDiagrammeUkulele.valeurs)) return null;
        // Convert array [0, 2, 3, 2] to string "0232" (simple format) or "0.2.3.2" (complex format)
        // This should match the format stored in localStorage and tableauAccords
        // PenseDiagrammeUkulele.chaineValeur() handles this formatting.
        return diagram.penseDiagrammeUkulele.chaineValeur();
    };

    // Updates the star icon state (☆/★) based on the CURRENTLY DISPLAYED DIAGRAM'S POSITION
    // This function is now global so it can be called from DessineDiagrammeUkulele.showAlternatives
    globalThis.updateFavoriteIconState = () => {
        const favoriteToggle = document.getElementById('favorite-toggle');
        const currentPositionStr = getCurrentPositionString();

        if (favoriteToggle && currentPositionStr) {
            if (globalThis.isFavorite(currentPositionStr)) {
                favoriteToggle.textContent = '★'; // Filled star
                favoriteToggle.style.color = 'gold';
            } else {
                favoriteToggle.textContent = '☆'; // Unfilled star
                favoriteToggle.style.color = 'inherit'; // Default color
            }
        } else if (favoriteToggle) {
            // If no valid position, reset icon
            favoriteToggle.textContent = '☆';
            favoriteToggle.style.color = 'inherit';
        }
    };

    // --- Function to update the main diagram's favorite status ---
    // This is crucial because the DessineDiagrammeUkulele instance has its own `isFavorite` property.
    // This function is now global so it can be called from DessineDiagrammeUkulele.showAlternatives
    globalThis.updateMainDiagramFavoriteStatus = () => {
        const currentPositionStr = getCurrentPositionString();
        const diagram = globalThis.diagramme;
        if (diagram) {
            // Update the instance's property based on the current position's favorite status
            diagram.isFavorite = globalThis.isFavorite(currentPositionStr);
            // Re-draw the main diagram to show/hide the star if its favorite status changed.
            diagram.dessineDiagramme(); 
        }
    };
    // --- End Global Favorite Update Functions ---


    // 1. Initialisation des options par défaut
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

    // 2. Création et démarrage de l'instance globale du diagramme principal
    globalThis.diagramme = new DessineDiagrammeUkulele("diagramme1", options);
    globalThis.diagramme.startup();

    // --- Initial UI Setup and State Update ---
    // Ensure initial state reflects loaded data and favorites
    globalThis.updateMainDiagramFavoriteStatus(); // Set initial favorite status for the main diagram
    globalThis.updateFavoriteIconState(); // Set initial state for the toggle button


    // --- Liaison des événements UI ---

    const inputName = document.getElementById("name");
    const inputValeurs = document.getElementById("valeurs"); 
    
    // Function to handle updates after chord data changes (search, input, etc.)
    const handleChordUpdate = () => {
        // Update the internal model from UI inputs if they were changed directly
        // globalThis.diagramme.syncUIToPense(); // This might be redundant if inputs are updated by chercheAccordParNom

        globalThis.diagramme.dessineDiagramme(); // Redraw the main diagram
        globalThis.updateMainDiagramFavoriteStatus(); // Update the main diagram's star visibility
        globalThis.updateFavoriteIconState(); // Update the toggle button star (☆/★)
        
        // After a change, re-render alternatives to update their favorite highlighting
        const currentChordName = inputName.value;
        if (currentChordName && globalThis.diagramme.showAlternatives) {
            globalThis.diagramme.showAlternatives(currentChordName);
        }
    };

    // Accords par Nom Input & Search
    inputName.addEventListener("input", () => { 
        // Trigger the search. The modified function will update the main chord display.
        // The return value of chercheAccordParNom is not directly used here to display a list,
        // but the internal state update and selection of the best match is handled.
        const searchResult = globalThis.diagramme.chercheAccordParNom(inputName.value); // Pass the input value
        handleChordUpdate(); // Update UI based on the new main chord selected by the search
    });
    const searchByNameIcon = document.querySelector("span[onclick='chercherAccordParNom()']");
    if (searchByNameIcon) {
        searchByNameIcon.addEventListener("click", () => {
            const searchResult = globalThis.diagramme.chercheAccordParNom(inputName.value);
            handleChordUpdate();
        });
    }

    // Accords par Valeurs (Position) Input & Search
    inputValeurs.addEventListener("input", () => { 
        // When position input changes, update and redraw.
        globalThis.diagramme.chercheAccordParPosition(inputValeurs.value); // Update chord name based on position
        handleChordUpdate();
    });
    const searchByPosIcon = document.getElementById("loupeChercheAccordParValeurs");
    if (searchByPosIcon) {
        searchByPosIcon.addEventListener("click", () => {
            // This calls PenseDiagrammeUkulele.chercheAccordParPosition which updates only the name, not the main chord display itself.
            // A redraw is needed.
            globalThis.diagramme.chercheAccordParPosition(inputValeurs.value); 
            handleChordUpdate();
        });
    }

    // Bouton Dessine (Manual Draw)
    document.getElementById("button-dessine").addEventListener("click", () => {
        // This syncs UI inputs to the PenseDiagrammeUkulele model and then redraws.
        globalThis.diagramme.syncUIToPense(); 
        handleChordUpdate(); // Redraw and update states
    });

    // Case de départ Auto
    const checkAuto = document.getElementById("caseDepartAuto");
    const inputCase = document.getElementById("caseDepart");
    const toggleCaseInput = () => {
        inputCase.style.display = checkAuto.checked ? "none" : "inline-block";
    };
    checkAuto.addEventListener("change", () => {
        toggleCaseInput();
        globalThis.diagramme.syncUIToPense(); // Update internal model based on auto/manual setting
        handleChordUpdate(); // Redraw and update states
    });
    inputCase.addEventListener("change", () => {
        globalThis.diagramme.syncUIToPense(); // Update internal model
        handleChordUpdate(); // Redraw and update states
    });
    toggleCaseInput(); // Set initial state

    // Sliders et Couleurs
    const fader = document.getElementById("fader");
    const outputTaille = document.getElementById("taille");
    fader.addEventListener("input", (e) => {
        const nouvelleTaille = e.target.value;
        outputTaille.value = nouvelleTaille;
        globalThis.diagramme.changeTaille(nouvelleTaille);
        globalThis.diagramme.dessineDiagramme(); // Just redraw, no state change needed here
    });

    // Boutons d'actions
    document.getElementById("randomChord").addEventListener("click", () => {
        globalThis.diagramme.setAccordAuHasard(); // Updates main chord display
        handleChordUpdate(); // Update UI states
    });
    document.getElementById("btnPrecChord").addEventListener("click", () => {
        globalThis.diagramme.chercheAccordPrecedent(); // Updates main chord display
        handleChordUpdate(); // Update UI states
    });
    document.getElementById("btnNextChord").addEventListener("click", () => {
        globalThis.diagramme.chercheAccordSuivant(); // Updates main chord display
        handleChordUpdate(); // Update UI states
    });

    // Générateur de Base de Données
    const btnGen = document.getElementById("btnGenerateData");
    if (btnGen) {
        btnGen.addEventListener("click", () => {
            const startTime = Date.now();
            const data = ChordDataGenerator.generate();
            const duration = (Date.now() - startTime) / 1000;
            alert(`Génération réussie en ${duration}s ! Le fichier va être téléchargé.`);
            ChordDataGenerator.saveAsFile(data);
        });
    }

    // Téléchargement
    document.getElementById("download").addEventListener("click", function(e) {
        globalThis.diagramme.download_img(this);
    });

    // --- Logique de l'Assistant d'Accords ---
    const assistant = document.getElementById('chord-assistant');
    const toggleBtn = document.getElementById('toggle-assistant');

    if (toggleBtn && assistant) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = assistant.style.display === 'none';
            assistant.style.display = isHidden ? 'block' : 'none';
            toggleBtn.style.filter = isHidden ? 'drop-shadow(0 0 5px var(--primary-color))' : 'none';
        });
    }

    // --- Basculement des contrôles de couleur ---
    const colorControls = document.getElementById('color-controls');
    const toggleColorsBtn = document.getElementById('toggle-colors');

    if (toggleColorsBtn && colorControls) {
        toggleColorsBtn.addEventListener('click', () => {
            const isHidden = colorControls.style.display === 'none';
            colorControls.style.display = isHidden ? 'block' : 'none';
            toggleColorsBtn.style.filter = isHidden ? 'drop-shadow(0 0 5px var(--primary-color))' : 'none';
        });
    }

    // --- Favorite Toggle Event Listener ---
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
                // Update the toggle button and main diagram's star status
                globalThis.updateFavoriteIconState(); 
                globalThis.updateMainDiagramFavoriteStatus(); 
                
                // Also re-render alternatives to update their background highlighting
                const currentChordName = inputName.value;
                if (currentChordName && globalThis.diagramme && globalThis.diagramme.showAlternatives) {
                    globalThis.diagramme.showAlternatives(currentChordName);
                }
            }
        });
    }
    // --- End Favorite Toggle Event Listener ---

    let selection = { root: 'C', accidental: '', family: '' };

    const updateAccidentalAvailability = () => {
        const sharpBtn = document.querySelector('#assistant-accidentals .mini-btn[data-val="#"]');
        const flatBtn = document.querySelector('#assistant-accidentals .mini-btn[data-val="b"]');
        const naturalBtn = document.querySelector('#assistant-accidentals .mini-btn[data-val=""]');

        const sharpForbidden = (selection.root === 'B' || selection.root === 'E');
        const flatForbidden = (selection.root === 'F' || selection.root === 'C');

        // Helper to update button state and selection if needed
        const updateButtonState = (button, isForbidden, accidentalValue) => {
            if (!button) return;
            button.disabled = isForbidden;
            button.style.opacity = isForbidden ? "0.3" : "1";
            button.style.pointerEvents = isForbidden ? "none" : "auto";
            if (isForbidden && selection.accidental === accidentalValue) {
                selection.accidental = ''; // Reset to natural if the current accidental is forbidden
            }
        };

        updateButtonState(sharpBtn, sharpForbidden, '#');
        updateButtonState(flatBtn, flatForbidden, 'b');

        // Update active state for accidental buttons
        const accidentalButtons = document.querySelectorAll('#assistant-accidentals .mini-btn');
        accidentalButtons.forEach(btn => btn.classList.remove('active'));

        if (selection.accidental === '') {
            if (naturalBtn) naturalBtn.classList.add('active');
        } else {
            const activeAccidentalBtn = document.querySelector(`#assistant-accidentals .mini-btn[data-val="${selection.accidental}"]`);
            if (activeAccidentalBtn) activeAccidentalBtn.classList.add('active');
        }
    };

    const updateFromAssistant = () => {
        updateAccidentalAvailability();
        const fullName = selection.root + selection.accidental + selection.family;
        inputName.value = fullName;
        // Trigger search and update UI states
        const searchResult = globalThis.diagramme.chercheAccordParNom(fullName); 
        handleChordUpdate(); 
    };

    const setupAssistantGroup = (rowId, selectionKey) => {
        const buttons = document.querySelectorAll(`#${rowId} .mini-btn`);

        const handleButtonClick = (btn) => {
            selection[selectionKey] = btn.dataset.val; 

            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            updateFromAssistant();
        };

        buttons.forEach(btn => {
            btn.addEventListener('click', () => handleButtonClick(btn));

            if (btn.dataset.val === selection[selectionKey]) {
                btn.classList.add('active');
            }
        });
    };

    setupAssistantGroup('assistant-roots', 'root');
    setupAssistantGroup('assistant-accidentals', 'accidental');
    setupAssistantGroup('assistant-families', 'family');
    
    // --- Infobulles (Aide) ---
    const setupAide = (iconeId, aideId) => {
        const icone = document.getElementById(iconeId);
        const aide = document.getElementById(aideId);
        if (icone && aide) {
            icone.addEventListener("mouseover", () => aide.style.display = "inline");
            icone.addEventListener("mouseout", () => aide.style.display = "none");
        }
    };

    setupAide("loupeChercheAccordParNom", "aide_nomaccord");
    setupAide("infobulle", "aide_valeur");

    // Initialize state on load (already done above, but as a reminder)
    // globalThis.updateMainDiagramFavoriteStatus();
    // globalThis.updateFavoriteIconState();
});
