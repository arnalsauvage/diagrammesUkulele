document.addEventListener("DOMContentLoaded", () => {
    const FAVORITES_STORAGE_KEY = 'ukuleleChordFavorites';

    // --- LOGGING SYSTEM ---
    const logInteraction = (tag, objectData) => {
        fetch('./api/log_interaction.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tag: tag,
                object: objectData
            })
        }).catch(err => console.error("Logging error:", err));
    };

    const getChordFullInfo = () => {
        const name = document.getElementById("name").value || "unknown";
        const diagram = globalThis.diagramme;
        let pos = "0.0.0.0";
        if (diagram && diagram.penseDiagrammeUkulele && diagram.penseDiagrammeUkulele.valeurs) {
            // On joint les valeurs du tableau avec des points
            pos = diagram.penseDiagrammeUkulele.valeurs.map(v => v === -1 ? 'x' : v).join('.');
        }
        return `${name}|${pos}`;
    };
    // --- END LOGGING SYSTEM ---

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
            // Log interaction
            logInteraction('addFavori', getChordFullInfo());
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
        
        if (favoriteToggle) {
            // Mise à jour de l'infobulle via i18n
            favoriteToggle.title = globalThis.i18n.t('favTooltip');
            
            if (currentPositionStr) {
                if (globalThis.isFavorite(currentPositionStr)) {
                    favoriteToggle.textContent = '★';
                    favoriteToggle.style.color = 'gold';
                } else {
                    favoriteToggle.textContent = '☆';
                    favoriteToggle.style.color = ''; // On laisse le CSS gérer la couleur par défaut
                }
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
        // Log interaction
        logInteraction('download', getChordFullInfo());
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

    // --- CONFIGURATION ET MODE DEV ---
    const btnGen = document.getElementById("btnGenerateData");
    if (btnGen && typeof CONFIG !== 'undefined') {
        if (CONFIG.ENV === 'prod') {
            btnGen.style.display = 'none';
        } else {
            btnGen.addEventListener("click", () => {
                const startTime = Date.now();
                const data = ChordDataGenerator.generate();
                const duration = (Date.now() - startTime) / 1000;
                alert(`Génération réussie en ${duration}s ! Le fichier va être téléchargé.`);
                ChordDataGenerator.saveAsFile(data);
            });
        }
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

    // --- INFOBULLES (AIDE) ---
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

    // --- GESTION DES PALETTES PERSONNALISÉES ---
    const PALETTES_STORAGE_KEY = 'ukuleleCustomPalettes';
    const palettesList = document.getElementById('palettes-list');
    const newPaletteNameInput = document.getElementById('new-palette-name');
    const btnSavePalette = document.getElementById('btn-save-palette');
    const saveArea = document.getElementById('save-palette-area');

    const getPalettes = () => {
        const json = localStorage.getItem(PALETTES_STORAGE_KEY);
        return json ? JSON.parse(json) : [];
    };

    const savePalettes = (palettes) => {
        localStorage.setItem(PALETTES_STORAGE_KEY, JSON.stringify(palettes));
        renderPalettes();
    };

    const renderPalettes = () => {
        const palettes = getPalettes();
        palettesList.innerHTML = "";
        
        palettes.forEach((p, index) => {
            const chip = document.createElement('div');
            chip.style.cssText = "background: #eee; border: 1px solid #ccc; padding: 4px 8px; border-radius: 15px; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 5px;";
            chip.innerHTML = `<span>${p.name}</span><span class="delete-p" style="color: red; font-weight: bold; padding: 0 2px;">×</span>`;
            
            // Appliquer la palette
            chip.querySelector('span').addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('couleurRemplissage').value = p.fill;
                document.getElementById('couleurTrait').value = p.stroke;
                document.getElementById('couleurGrille').value = p.grid;
                document.getElementById('couleurReperes').value = p.markers;
                globalThis.diagramme.updateColors();
                globalThis.diagramme.dessineDiagramme();
            });

            // Supprimer la palette
            chip.querySelector('.delete-p').addEventListener('click', (e) => {
                e.stopPropagation();
                const updated = getPalettes().filter((_, i) => i !== index);
                savePalettes(updated);
            });

            palettesList.appendChild(chip);
        });

        // Masquer le formulaire si on a déjà 3 palettes
        saveArea.style.display = (palettes.length >= 3) ? 'none' : 'flex';
    };

    btnSavePalette.addEventListener('click', () => {
        const name = newPaletteNameInput.value.trim();
        if (!name) return;

        const palettes = getPalettes();
        if (palettes.length >= 3) return;

        palettes.push({
            name: name,
            fill: document.getElementById('couleurRemplissage').value,
            stroke: document.getElementById('couleurTrait').value,
            grid: document.getElementById('couleurGrille').value,
            markers: document.getElementById('couleurReperes').value
        });

        savePalettes(palettes);
        newPaletteNameInput.value = "";
    });

    renderPalettes();
});
