import { DessineDiagrammeUkulele } from './DessineDiagrammeUkulele.js';
import { i18n } from './i18n.js';
import { CONFIG } from './config.js';
import { tableauAccords } from './accords.js';
import { StorageManager } from './StorageManager.js';
import { DiagrammeUIHelper } from './DiagrammeUIHelper.js';
import { ToastHelper } from './ToastHelper.js';

document.addEventListener("DOMContentLoaded", () => {
    // --- SYSTÈME DE LOGS ---
    const logInteraction = (tag, objectData) => {
        fetch('./api/log_interaction.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                tag, 
                object: objectData,
                token: CONFIG.API_TOKEN 
            })
        }).catch(err => console.error("Erreur de log :", err));
    };

    const getChordFullInfo = () => {
        const name = document.getElementById("name").value || "inconnu";
        const diagram = globalThis.diagramme;
        let pos = "0.0.0.0";
        if (diagram && diagram.penseDiagrammeUkulele && diagram.penseDiagrammeUkulele.valeurs) {
            pos = diagram.penseDiagrammeUkulele.valeurs.map(v => v === -1 ? 'x' : v).join('.');
        }
        return `${name}|${pos}`;
    };

    // --- INITIALISATION DU DIAGRAMME ---
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

    // --- MISE À JOUR DE L'UI ---
    const handleChordUpdate = () => {
        globalThis.diagramme.dessineDiagramme();
        globalThis.updateMainDiagramFavoriteStatus();
        globalThis.updateFavoriteIconState();
    };

    globalThis.updateFavoriteIconState = () => {
        const toggle = document.getElementById('favorite-toggle');
        const diagram = globalThis.diagramme;
        if (!toggle || !diagram) return;

        toggle.title = i18n.t('favTooltip');
        const pos = diagram.penseDiagrammeUkulele.chaineValeur();
        
        if (StorageManager.isFavorite(pos)) {
            toggle.textContent = '★';
            toggle.style.color = 'gold';
        } else {
            toggle.textContent = '☆';
            toggle.style.color = '';
        }
    };

    globalThis.updateMainDiagramFavoriteStatus = () => {
        const diagram = globalThis.diagramme;
        if (diagram) {
            const pos = diagram.penseDiagrammeUkulele.chaineValeur();
            diagram.isFavorite = StorageManager.isFavorite(pos);
            diagram.dessineDiagramme(); 
        }
    };

    // --- ÉVÉNEMENTS ---
    const inputName = document.getElementById("name");
    
    const declencheRecherche = () => {
        const result = globalThis.diagramme.penseDiagrammeUkulele.chercheAccordParNom(
            inputName.value, 
            tableauAccords, 
            StorageManager.isFavorite, 
            window.generatedChords
        );
        if (result && result.found) {
            globalThis.diagramme.displaySearchList(result.results);
        }
        handleChordUpdate();
    };

    inputName.addEventListener("keyup", (e) => {
        if (e.key === "Enter") declencheRecherche();
    });

    document.getElementById("loupeChercheAccordParNom")?.addEventListener("click", declencheRecherche);

    document.getElementById("valeurs")?.addEventListener("change", (e) => {
        globalThis.diagramme.penseDiagrammeUkulele.chercheAccordParPosition(e.target.value, tableauAccords);
        handleChordUpdate();
    });

    document.getElementById("fader")?.addEventListener("input", (e) => {
        const val = e.target.value;
        const out = document.getElementById("taille");
        if (out) out.value = val;
        globalThis.diagramme.changeTaille(val);
        globalThis.diagramme.dessineDiagramme();
    });

    document.getElementById("randomChord")?.addEventListener("click", () => {
        globalThis.diagramme.penseDiagrammeUkulele.setAccordAuHasard(tableauAccords);
        handleChordUpdate();
    });

    document.getElementById("btnPrecChord")?.addEventListener("click", () => {
        globalThis.diagramme.penseDiagrammeUkulele.chercheAccordPrecedent(tableauAccords);
        handleChordUpdate();
    });

    document.getElementById("btnNextChord")?.addEventListener("click", () => {
        globalThis.diagramme.penseDiagrammeUkulele.chercheAccordSuivant(tableauAccords);
        handleChordUpdate();
    });

    document.getElementById("download")?.addEventListener("click", function() {
        globalThis.diagramme.download_img(this);
        logInteraction('download', getChordFullInfo());
    });

    // --- LOGIQUE DE PARTAGE ---
    const btnShare = document.getElementById("btn-share");
    if (btnShare) {
        btnShare.title = i18n.t('shareTooltip');
        btnShare.addEventListener("click", () => {
            const name = document.getElementById("name").value;
            const pos = globalThis.diagramme.penseDiagrammeUkulele.chaineValeur();
            const url = new URL(window.location.href);
            url.searchParams.set('chord', name);
            url.searchParams.set('pos', pos);
            
            navigator.clipboard.writeText(url.toString()).then(() => {
                ToastHelper.show(i18n.t('shareSuccess'));
                logInteraction('share', getChordFullInfo());
            });
        });
    }

    const initFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        const chord = params.get('chord');
        const pos = params.get('pos');
        
        if (chord) {
            document.getElementById("name").value = chord;
            globalThis.diagramme.penseDiagrammeUkulele.setNomAccord(chord);
        }
        if (pos) {
            document.getElementById("valeurs").value = pos;
            globalThis.diagramme.penseDiagrammeUkulele.setValeursByString(pos);
        }
        
        if (chord || pos) handleChordUpdate();
    };

    document.getElementById('favorite-toggle')?.addEventListener('click', () => {
        const pos = globalThis.diagramme.penseDiagrammeUkulele.chaineValeur();
        if (StorageManager.isFavorite(pos)) {
            StorageManager.removeFavorite(pos);
        } else {
            if (StorageManager.addFavorite(pos)) {
                logInteraction('addFavori', getChordFullInfo());
            }
        }
        handleChordUpdate();
    });

    // --- LOGIQUE DE L'ASSISTANT ---
    let selection = { root: 'C', accidental: '', family: '' };

    const updateAccidentalAvailability = () => {
        const sharpBtn = document.querySelector('#assistant-accidentals .mini-btn[data-val="#"]');
        const flatBtn = document.querySelector('#assistant-accidentals .mini-btn[data-val="b"]');
        
        const sharpForbidden = (selection.root === 'B' || selection.root === 'E');
        const flatForbidden = (selection.root === 'F' || selection.root === 'C');

        if (sharpBtn) {
            sharpBtn.disabled = sharpForbidden;
            sharpBtn.style.opacity = sharpForbidden ? "0.3" : "1";
            sharpBtn.style.pointerEvents = sharpForbidden ? "none" : "auto";
            if (sharpForbidden && selection.accidental === '#') selection.accidental = '';
        }

        if (flatBtn) {
            flatBtn.disabled = flatForbidden;
            flatBtn.style.opacity = flatForbidden ? "0.3" : "1";
            flatBtn.style.pointerEvents = flatForbidden ? "none" : "auto";
            if (flatForbidden && selection.accidental === 'b') selection.accidental = '';
        }

        const buttons = document.querySelectorAll('#assistant-accidentals .mini-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`#assistant-accidentals .mini-btn[data-val="${selection.accidental}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    };

    const setupAssistantGroup = (rowId, selectionKey) => {
        const buttons = document.querySelectorAll(`#${rowId} .mini-btn`);
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                selection[selectionKey] = btn.dataset.val; 
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateAccidentalAvailability();
                inputName.value = selection.root + selection.accidental + selection.family;
                declencheRecherche();
            });
        });
    };

    setupAssistantGroup('assistant-roots', 'root');
    setupAssistantGroup('assistant-accidentals', 'accidental');
    setupAssistantGroup('assistant-families', 'family');
    updateAccidentalAvailability();

    // --- CONFIGURATION ---
    if (CONFIG.ENV === 'prod') document.getElementById("btnGenerateData")?.remove();
    const versionEl = document.getElementById("app-version");
    if (versionEl) versionEl.textContent = `v${CONFIG.VERSION}`;

    // --- ASSISTANT & COULEURS ---
    document.getElementById('toggle-assistant')?.addEventListener('click', () => {
        const el = document.getElementById('chord-assistant');
        if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('toggle-colors')?.addEventListener('click', () => {
        const el = document.getElementById('color-controls');
        if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
    });

    // --- PALETTES ---
    const renderPalettes = () => {
        const list = document.getElementById('palettes-list');
        if (!list) return;
        const palettes = StorageManager.getPalettes();
        list.innerHTML = "";
        palettes.forEach((p, i) => {
            const chip = document.createElement('div');
            chip.className = "palette-chip";
            chip.innerHTML = `<span>${p.name}</span><span class="del">×</span>`;
            
            chip.querySelector('span').addEventListener('click', () => {
                const fill = document.getElementById('couleurRemplissage');
                const stroke = document.getElementById('couleurTrait');
                const grid = document.getElementById('couleurGrille');
                const markers = document.getElementById('couleurReperes');
                if (fill) fill.value = p.fill;
                if (stroke) stroke.value = p.stroke;
                if (grid) grid.value = p.grid;
                if (markers) markers.value = p.markers;
                globalThis.diagramme.updateColors();
                globalThis.diagramme.dessineDiagramme();
            });

            chip.querySelector('.del').addEventListener('click', (e) => {
                e.stopPropagation();
                StorageManager.removePalette(i);
                renderPalettes();
            });

            list.appendChild(chip);
        });
        document.getElementById('save-palette-area').style.display = (palettes.length >= 3) ? 'none' : 'flex';
    };

    document.getElementById('btn-save-palette')?.addEventListener('click', () => {
        const nameInput = document.getElementById('new-palette-name');
        const name = nameInput?.value.trim();
        if (!name) return;

        const palette = {
            name: name,
            fill: document.getElementById('couleurRemplissage').value,
            stroke: document.getElementById('couleurTrait').value,
            grid: document.getElementById('couleurGrille').value,
            markers: document.getElementById('couleurReperes').value
        };

        if (StorageManager.addPalette(palette)) {
            if (nameInput) nameInput.value = "";
            renderPalettes();
            ToastHelper.show("Palette enregistrée !");
        }
    });

    // Initialisation
    i18n.init();
    initFromURL(); // Charger depuis l'URL si paramètres présents
    handleChordUpdate();
    renderPalettes();

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
});
