document.addEventListener("DOMContentLoaded", () => {
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

    // 2. Création et démarrage de l'instance globale
    window.diagramme = new DessineDiagrammeUkulele("diagramme1", options);
    window.diagramme.startup();

    // 3. Liaison des événements UI (Nettoyage des onclick HTML)
    
    // Accords par Nom
    const inputName = document.getElementById("name");
    inputName.addEventListener("keyup", (e) => {
        if (e.key === "Enter") window.diagramme.chercheAccordParNom();
    });
    document.querySelector("span[onclick='chercherAccordParNom()']")?.addEventListener("click", () => {
        window.diagramme.chercheAccordParNom();
    });

    // Accords par Valeurs (Position)
    const inputValeurs = document.getElementById("valeurs");
    inputValeurs.addEventListener("keyup", (e) => {
        if (e.key === "Enter") window.diagramme.chercheAccordParPosition();
    });
    document.getElementById("loupeChercheAccordParValeurs")?.addEventListener("click", () => {
        window.diagramme.chercheAccordParPosition();
    });

    // Bouton Dessine
    document.getElementById("button-dessine").addEventListener("click", () => {
        window.diagramme.syncUIToPense();
        window.diagramme.dessineDiagramme();
    });

    // Case de départ Auto
    const checkAuto = document.getElementById("caseDepartAuto");
    const inputCase = document.getElementById("caseDepart");
    const toggleCaseInput = () => {
        inputCase.style.display = checkAuto.checked ? "none" : "inline-block";
    };
    checkAuto.addEventListener("change", () => {
        toggleCaseInput();
        window.diagramme.syncUIToPense();
        window.diagramme.dessineDiagramme();
    });
    inputCase.addEventListener("change", () => {
        window.diagramme.syncUIToPense();
        window.diagramme.dessineDiagramme();
    });
    toggleCaseInput(); // État initial

    // Sliders et Couleurs
    const fader = document.getElementById("fader");
    const outputTaille = document.getElementById("taille");
    fader.addEventListener("input", (e) => {
        const nouvelleTaille = e.target.value;
        outputTaille.value = nouvelleTaille;
        window.diagramme.changeTaille(nouvelleTaille);
        window.diagramme.dessineDiagramme();
    });

    // Boutons d'actions
    document.getElementById("randomChord").addEventListener("click", () => {
        window.diagramme.setAccordAuHasard();
    });
    document.getElementById("btnPrecChord").addEventListener("click", () => {
        window.diagramme.chercheAccordPrecedent();
    });
    document.getElementById("btnNextChord").addEventListener("click", () => {
        window.diagramme.chercheAccordSuivant();
    });

    // Téléchargement
    document.getElementById("download").addEventListener("click", function(e) {
        window.diagramme.download_img(this);
    });

    // --- Logique de l'Assistant d'Accords ---
    const assistant = document.getElementById('chord-assistant');
    const toggleBtn = document.getElementById('toggle-assistant');
    
    toggleBtn.addEventListener('click', () => {
        const isHidden = assistant.style.display === 'none';
        assistant.style.display = isHidden ? 'block' : 'none';
        toggleBtn.style.filter = isHidden ? 'drop-shadow(0 0 5px var(--primary-color))' : 'none';
    });

    let selection = { root: 'C', accidental: '', family: '' };

    const updateAccidentalAvailability = () => {
        const sharpBtn = document.querySelector('#assistant-accidentals .mini-btn[data-val="#"]');
        const flatBtn = document.querySelector('#assistant-accidentals .mini-btn[data-val="b"]');
        
        // B et E n'ont pas de dièse (théorique simple)
        const sharpForbidden = (selection.root === 'B' || selection.root === 'E');
        // F et C n'ont pas de bémol (théorique simple)
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

        // Mettre à jour l'état actif du bouton "Naturel" si on a dû annuler une altération
        if (selection.accidental === '') {
            const naturalBtn = document.querySelector('#assistant-accidentals .mini-btn[data-val=""]');
            document.querySelectorAll('#assistant-accidentals .mini-btn').forEach(b => b.classList.remove('active'));
            if (naturalBtn) naturalBtn.classList.add('active');
        }
    };

    const updateFromAssistant = () => {
        updateAccidentalAvailability();
        const fullName = selection.root + selection.accidental + selection.family;
        inputName.value = fullName;
        window.diagramme.chercheAccordParNom();
    };

    const setupAssistantGroup = (rowId, selectionKey) => {
        const buttons = document.querySelectorAll(`#${rowId} .mini-btn`);
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update selection
                selection[selectionKey] = btn.getAttribute('data-val');
                
                // Update active state
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                updateFromAssistant();
            });
            
            // Initial active state
            if (btn.getAttribute('data-val') === selection[selectionKey]) {
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
});