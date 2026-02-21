import { DessineDiagrammeUkulele } from './DessineDiagrammeUkulele.js';
import { i18n } from './i18n.js';
import { CONFIG, STORAGE_KEYS } from './config.js';
import { tableauAccords } from './accords.js';
import { generatedChords } from './generatedChords.js';
import { StorageManager } from './StorageManager.js';
import { ToastHelper } from './ToastHelper.js';

document.addEventListener("DOMContentLoaded", () => {
    // --- SYSTÈME DE LOGS ---
    const logInteraction = (tag, objectData) => {
        fetch('./api/log_interaction.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tag, object: objectData, token: CONFIG.API_TOKEN })
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

    // --- LOGIQUE ACCORD DU JOUR ---
    const getChordOfTheDay = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        const keys = Object.keys(tableauAccords).sort();
        const index = dayOfYear % keys.length;
        return { name: keys[index], pos: tableauAccords[keys[index]] };
    };

    // --- INITIALISATION DU DIAGRAMME ---
    const options = {
        taille: 40, tailleGrillex: 4, tailleGrilley: 6, margeHauteurGrille: 35, margeGaucheGrille: 20, epaisseurLigne: 3, couleurGrille: "#333333", bGrilleTordue: true,
    };

    globalThis.diagramme = new DessineDiagrammeUkulele("diagramme1", options);
    globalThis.diagramme.startup();

    // --- MISE À JOUR DE L'UI ---
    const handleChordUpdate = () => {
        globalThis.diagramme.syncPenseToUI();
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
        if (StorageManager.isFavorite(pos)) { toggle.textContent = '★'; toggle.style.color = 'gold'; }
        else { toggle.textContent = '☆'; toggle.style.color = ''; }
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
    const inputValeurs = document.getElementById("valeurs");
    
    const declencheRecherche = () => {
        if (!inputName) return;
        const result = globalThis.diagramme.penseDiagrammeUkulele.chercheAccordParNom(
            inputName.value, 
            tableauAccords, 
            StorageManager.isFavorite, 
            generatedChords
        );
        if (result && result.found) {
            globalThis.diagramme.displaySearchList(result.results);
        }
        handleChordUpdate();
    };

    inputName?.addEventListener("keyup", (e) => { if (e.key === "Enter") declencheRecherche(); });
    document.getElementById("loupeChercheAccordParNom")?.addEventListener("click", declencheRecherche);

    inputValeurs?.addEventListener("change", (e) => {
        globalThis.diagramme.penseDiagrammeUkulele.chercheAccordParPosition(e.target.value, tableauAccords);
        handleChordUpdate();
        if (inputName.value) declencheRecherche();
    });

    document.getElementById("fader")?.addEventListener("input", (e) => {
        const val = e.target.value;
        const out = document.getElementById("taille"); if (out) out.value = val;
        globalThis.diagramme.changeTaille(val);
        globalThis.diagramme.dessineDiagramme();
    });

    document.getElementById("randomChord")?.addEventListener("click", () => {
        globalThis.diagramme.penseDiagrammeUkulele.setAccordAuHasard(tableauAccords);
        inputName.value = globalThis.diagramme.penseDiagrammeUkulele.nomAccord;
        declencheRecherche();
    });

    document.getElementById("btnPrecChord")?.addEventListener("click", () => {
        globalThis.diagramme.penseDiagrammeUkulele.chercheAccordPrecedent(tableauAccords);
        inputName.value = globalThis.diagramme.penseDiagrammeUkulele.nomAccord;
        declencheRecherche();
    });

    document.getElementById("btnNextChord")?.addEventListener("click", () => {
        globalThis.diagramme.penseDiagrammeUkulele.chercheAccordSuivant(tableauAccords);
        inputName.value = globalThis.diagramme.penseDiagrammeUkulele.nomAccord;
        declencheRecherche();
    });

    document.getElementById("download")?.addEventListener("click", function() {
        globalThis.diagramme.download_img(this);
        logInteraction('download', getChordFullInfo());
    });

    document.getElementById('favorite-toggle')?.addEventListener('click', () => {
        const pos = globalThis.diagramme.penseDiagrammeUkulele.chaineValeur();
        if (StorageManager.isFavorite(pos)) { StorageManager.removeFavorite(pos); }
        else if (StorageManager.addFavorite(pos)) { logInteraction('addFavori', getChordFullInfo()); }
        handleChordUpdate();
        declencheRecherche();
    });

    // --- LOGIQUE DE PARTAGE ---
    const btnShare = document.getElementById("btn-share");
    if (btnShare) {
        btnShare.title = i18n.t('shareTooltip');
        btnShare.addEventListener("click", () => {
            const name = inputName.value;
            const pos = globalThis.diagramme.penseDiagrammeUkulele.chaineValeur();
            const url = new URL(window.location.href);
            url.searchParams.set('chord', name); url.searchParams.set('pos', pos);
            navigator.clipboard.writeText(url.toString()).then(() => {
                ToastHelper.show(i18n.t('shareSuccess'));
                logInteraction('share', getChordFullInfo());
            });
        });
    }

    const initFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        let chord = params.get('chord');
        let pos = params.get('pos');
        
        // Si aucun paramètre, on prend l'accord du jour
        if (!chord && !pos) {
            const today = getChordOfTheDay();
            chord = today.name;
            pos = today.pos;
        }

        if (chord) { 
            inputName.value = chord; 
            globalThis.diagramme.penseDiagrammeUkulele.setNomAccord(chord); 
        }
        if (pos) { 
            if (inputValeurs) inputValeurs.value = pos; 
            globalThis.diagramme.penseDiagrammeUkulele.setValeursByString(pos); 
        }
        
        // IMPORTANT: Toujours déclencher la recherche initiale
        declencheRecherche();
    };

    // --- ASSISTANT ---
    let selection = { root: 'C', accidental: '', family: '' };
    const updateAccidentalAvailability = () => {
        const sharpBtn = document.querySelector('#assistant-accidentals .mini-btn[data-val="#"]');
        const flatBtn = document.querySelector('#assistant-accidentals .mini-btn[data-val="b"]');
        const sF = (selection.root === 'B' || selection.root === 'E'), fF = (selection.root === 'F' || selection.root === 'C');
        if (sharpBtn) { sharpBtn.disabled = sF; sharpBtn.style.opacity = sF ? "0.3" : "1"; sharpBtn.style.pointerEvents = sF ? "none" : "auto"; if (sF && selection.accidental === '#') selection.accidental = ''; }
        if (flatBtn) { flatBtn.disabled = fF; flatBtn.style.opacity = fF ? "0.3" : "1"; flatBtn.style.pointerEvents = fF ? "none" : "auto"; if (fF && selection.accidental === 'b') selection.accidental = ''; }
        document.querySelectorAll('#assistant-accidentals .mini-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`#assistant-accidentals .mini-btn[data-val="${selection.accidental}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    };

    const rowToKeyMap = { 'assistant-roots': 'root', 'assistant-accidentals': 'accidental', 'assistant-families': 'family' };
    document.querySelectorAll('.mini-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = btn.closest('.assistant-row'); if (!row) return;
            const key = rowToKeyMap[row.id]; if (!key) return;
            selection[key] = btn.dataset.val;
            row.querySelectorAll('.mini-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateAccidentalAvailability();
            inputName.value = selection.root + selection.accidental + selection.family;
            declencheRecherche();
        });
    });

    // --- CONFIGURATION & PALETTES ---
    if (CONFIG.ENV === 'prod') document.getElementById("btnGenerateData")?.remove();
    
    // Affichage de la version
    const versionEl = document.getElementById("app-version");
    if (versionEl) versionEl.textContent = `v${CONFIG.VERSION}`;

    document.getElementById('toggle-assistant')?.addEventListener('click', () => { const el = document.getElementById('chord-assistant'); if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'; });
    document.getElementById('toggle-colors')?.addEventListener('click', () => { const el = document.getElementById('color-controls'); if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'; });

    const renderPalettes = () => {
        const list = document.getElementById('palettes-list'); if (!list) return;
        const palettes = StorageManager.getPalettes(); list.innerHTML = "";
        palettes.forEach((p, i) => {
            const chip = document.createElement('div'); chip.className = "palette-chip";
            chip.innerHTML = `<span>${p.name}</span><span class="del">×</span>`;
            chip.querySelector('span').addEventListener('click', () => {
                ['couleurRemplissage', 'couleurTrait', 'couleurGrille', 'couleurReperes'].forEach(id => {
                    const el = document.getElementById(id); if (el) el.value = p[id.replace('couleur', '').toLowerCase()];
                });
                globalThis.diagramme.updateColors(); globalThis.diagramme.dessineDiagramme();
            });
            chip.querySelector('.del').addEventListener('click', (e) => { e.stopPropagation(); StorageManager.removePalette(i); renderPalettes(); });
            list.appendChild(chip);
        });
        document.getElementById('save-palette-area').style.display = (palettes.length >= 3) ? 'none' : 'flex';
    };

    document.getElementById('btn-save-palette')?.addEventListener('click', () => {
        const nameInput = document.getElementById('new-palette-name'), name = nameInput?.value.trim(); if (!name) return;
        const palette = { name: name, fill: document.getElementById('couleurRemplissage').value, stroke: document.getElementById('couleurTrait').value, grid: document.getElementById('couleurGrille').value, markers: document.getElementById('couleurReperes').value };
        if (StorageManager.addPalette(palette)) { if (nameInput) nameInput.value = ""; renderPalettes(); ToastHelper.show("Palette enregistrée !"); }
    });

    // Initialisation finale
    i18n.init();
    initFromURL(); // Déclenche la recherche et l'affichage initial
    updateAccidentalAvailability();
    renderPalettes();

    const setupAide = (iconeId, aideId) => {
        const icone = document.getElementById(iconeId), aide = document.getElementById(aideId);
        if (icone && aide) { icone.addEventListener("mouseover", () => aide.style.display = "inline"); icone.addEventListener("mouseout", () => aide.style.display = "none"); }
    };
    setupAide("loupeChercheAccordParNom", "aide_nomaccord"); setupAide("infobulle", "aide_valeur");
});
