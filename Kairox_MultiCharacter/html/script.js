let currentDict = {}; // Rempli dynamiquement par Lua

let currentSlot = 1;
let selectedCharSlot = null;
let selectedCharId = null;
let deleteConfirm = false; // Sécurité double-clic suppression

// =======================================================
// CONFIGURATION DES OPTIONS DU VISAGE ET VÊTEMENTS
// =======================================================
const skinConfig = {
    genetics: [ 
        { id: 'mom', min: 0, max: 45, label: 'MÈRE' }, 
        { id: 'dad', min: 0, max: 45, label: 'PÈRE' }, 
        { id: 'face_md_weight', min: 0, max: 100, label: 'RESSEMBLANCE VISAGE' }, 
        { id: 'skin_md_weight', min: 0, max: 100, label: 'COULEUR DE PEAU' } 
    ],
    face: [ 
        { id: 'nose_1', min: -10, max: 10, label: 'LARGEUR NEZ' }, 
        { id: 'nose_2', min: -10, max: 10, label: 'HAUTEUR NEZ' }, 
        { id: 'nose_3', min: -10, max: 10, label: 'LONGUEUR NEZ' }, 
        { id: 'nose_4', min: -10, max: 10, label: 'HAUTEUR ARÊTE' }, 
        { id: 'nose_5', min: -10, max: 10, label: 'ABAISSEMENT POINTE' }, 
        { id: 'nose_6', min: -10, max: 10, label: 'TORSION ARÊTE' }, 
        { id: 'eyebrows_5', min: -10, max: 10, label: 'HAUTEUR SOURCILS' }, 
        { id: 'eyebrows_6', min: -10, max: 10, label: 'PROFONDEUR SOURCILS' }, 
        { id: 'cheeks_1', min: -10, max: 10, label: 'HAUTEUR POMMETTES' }, 
        { id: 'cheeks_2', min: -10, max: 10, label: 'LARGEUR POMMETTES' }, 
        { id: 'cheeks_3', min: -10, max: 10, label: 'LARGEUR JOUES' }, 
        { id: 'eye_squint', min: -10, max: 10, label: 'STRABISME' }, 
        { id: 'lip_thickness', min: -10, max: 10, label: 'ÉPAISSEUR LÈVRES' }, 
        { id: 'jaw_1', min: -10, max: 10, label: 'LARGEUR MÂCHOIRE' }, 
        { id: 'jaw_2', min: -10, max: 10, label: 'LONGUEUR MÂCHOIRE' }, 
        { id: 'chin_1', min: -10, max: 10, label: 'HAUTEUR MENTON' }, 
        { id: 'chin_2', min: -10, max: 10, label: 'LONGUEUR MENTON' }, 
        { id: 'chin_3', min: -10, max: 10, label: 'LARGEUR MENTON' }, 
        { id: 'chin_4', min: -10, max: 10, label: 'TROU MENTON' }, 
        { id: 'neck_thickness', min: -10, max: 10, label: 'ÉPAISSEUR COU' } 
    ],
    appearance: [ 
        { id: 'hair_1', min: 0, max: 73, label: 'CHEVEUX' }, 
        { id: 'hair_color_1', min: 0, max: 63, label: 'COULEUR CHEVEUX' }, 
        { id: 'hair_color_2', min: 0, max: 63, label: 'REFLETS' }, 
        { id: 'beard_1', min: 0, max: 28, label: 'BARBE' }, 
        { id: 'beard_2', min: 0, max: 10, label: 'OPACITÉ BARBE' }, 
        { id: 'beard_3', min: 0, max: 63, label: 'COULEUR BARBE' }, 
        { id: 'eyebrows_1', min: 0, max: 33, label: 'SOURCILS' }, 
        { id: 'eyebrows_2', min: 0, max: 10, label: 'OPACITÉ SOURCILS' }, 
        { id: 'eyebrows_3', min: 0, max: 63, label: 'COULEUR SOURCILS' }, 
        { id: 'eye_color', min: 0, max: 31, label: 'YEUX' }, 
        { id: 'makeup_1', min: 0, max: 71, label: 'MAQUILLAGE' }, 
        { id: 'makeup_2', min: 0, max: 10, label: 'OPACITÉ MAQUILLAGE' }, 
        { id: 'makeup_3', min: 0, max: 63, label: 'COULEUR MAQUILLAGE' }, 
        { id: 'lipstick_1', min: 0, max: 10, label: 'ROUGE À LÈVRES' }, 
        { id: 'lipstick_2', min: 0, max: 10, label: 'OPACITÉ LÈVRES' }, 
        { id: 'lipstick_3', min: 0, max: 63, label: 'COULEUR LÈVRES' }, 
        { id: 'complexion_1', min: 0, max: 10, label: 'TEINT' }, 
        { id: 'complexion_2', min: 0, max: 10, label: 'OPACITÉ TEINT' }, 
        { id: 'age_1', min: 0, max: 14, label: 'VIEILLISSEMENT' }, 
        { id: 'age_2', min: 0, max: 10, label: 'OPACITÉ ÂGE' }, 
        { id: 'blemishes_1', min: 0, max: 23, label: 'IMPERFECTIONS' }, 
        { id: 'blemishes_2', min: 0, max: 10, label: 'OPACITÉ IMPERFECTIONS' }, 
        { id: 'chest_1', min: 0, max: 16, label: 'POILS TORSE' }, 
        { id: 'chest_2', min: 0, max: 10, label: 'OPACITÉ POILS' }, 
        { id: 'chest_3', min: 0, max: 63, label: 'COULEUR POILS' } 
    ],
    clothes: [ 
        { id: 'tshirt_1', min: 0, max: 150, label: 'T-SHIRT' }, 
        { id: 'tshirt_2', min: 0, max: 30, label: 'COULEUR T-SHIRT' }, 
        { id: 'torso_1', min: 0, max: 300, label: 'VESTE' }, 
        { id: 'torso_2', min: 0, max: 30, label: 'COULEUR VESTE' }, 
        { id: 'arms', min: 0, max: 190, label: 'BRAS/GANTS' }, 
        { id: 'arms_2', min: 0, max: 10, label: 'VARIANTE BRAS' }, 
        { id: 'pants_1', min: 0, max: 150, label: 'PANTALON' }, 
        { id: 'pants_2', min: 0, max: 30, label: 'COULEUR PANTALON' }, 
        { id: 'shoes_1', min: 0, max: 100, label: 'CHAUSSURES' }, 
        { id: 'shoes_2', min: 0, max: 30, label: 'COULEUR CHAUSSURES' } 
    ],
    accessories: [
        { id: 'helmet_1', min: -1, max: 150, label: 'CASQUES / CHAPEAUX' }, 
        { id: 'helmet_2', min: 0, max: 30, label: 'COULEUR CASQUES' }, 
        { id: 'mask_1', min: 0, max: 150, label: 'MASQUES' }, 
        { id: 'mask_2', min: 0, max: 20, label: 'COULEUR MASQUE' }, 
        { id: 'glasses_1', min: 0, max: 150, label: 'LUNETTES' }, 
        { id: 'glasses_2', min: 0, max: 20, label: 'COULEUR LUNETTES' }, 
        { id: 'chain_1', min: 0, max: 150, label: 'CHAÎNES' }, 
        { id: 'chain_2', min: 0, max: 20, label: 'COULEUR CHAÎNES' }, 
        { id: 'watches_1', min: -1, max: 100, label: 'MONTRES' }, 
        { id: 'watches_2', min: 0, max: 20, label: 'COULEUR MONTRES' }, 
        { id: 'bracelets_1', min: -1, max: 100, label: 'BRACELETS' }, 
        { id: 'bracelets_2', min: 0, max: 20, label: 'COULEUR BRACELETS' }, 
        { id: 'bags_1', min: 0, max: 100, label: 'SACS' }, 
        { id: 'bags_2', min: 0, max: 20, label: 'COULEUR SACS' }, 
        { id: 'ears_1', min: -1, max: 100, label: 'ACCESSOIRES OREILLES' }, 
        { id: 'ears_2', min: 0, max: 20, label: 'COULEUR OREILLES' } 
    ]
};

// Fonction pour générer les sliders dynamiquement
function buildUI() {
    const dict = currentDict;
    for (const [category, items] of Object.entries(skinConfig)) {
        let container = document.getElementById('tab-' + category);
        if(!container) continue;
        container.innerHTML = ""; // Clear
        
        items.forEach(item => {
            let val = (item.min < 0) ? 0 : item.min;
            if(item.id === 'face_md_weight' || item.id === 'skin_md_weight') val = 50;
            let label = dict[item.id] || item.label;
            
            container.innerHTML += `
                <div class="input-block">
                    <label>${label} <span class="val-display" id="${item.id}-val">${val}</span></label>
                    <input type="range" id="${item.id}" min="${item.min}" max="${item.max}" value="${val}" oninput="updateSkin('${item.id}', this.value)">
                </div>`;
        });
    }
}

function translatePage() {
    const dict = currentDict;
    if (!dict.logo) return; // Sécurité si vide
    
    document.querySelector('.logo-title').innerText = dict.logo;
    document.getElementById('category-title').innerText = dict.category_title;
    document.querySelector('.header-text .sub').innerText = dict.sub_title;
    
    let playBtn = document.querySelector('.play-btn');
    if (playBtn) playBtn.innerHTML = `<i class="fas fa-play"></i> ` + (dict.play || "JOUER");

    let delBtn = document.querySelector('.del-btn');
    if (delBtn) delBtn.innerHTML = `<i class="fas fa-trash"></i> ` + (dict.delete || "SUPPRIMER");

    // Labels identity
    let tabIdentity = document.getElementById('tab-identity');
    let labels = tabIdentity.querySelectorAll('.input-block label');
    labels[0].innerText = dict.firstname;
    labels[1].innerText = dict.lastname;
    labels[2].innerText = dict.dob;
    labels[3].innerText = dict.nationality;
    labels[4].innerText = dict.placeofbirth;
    
    labels[5].innerText = dict.sex_label;
    let selectSex = document.getElementById('sex');
    if (selectSex && selectSex.options.length > 1) {
        selectSex.options[0].innerText = dict.sex_male;
        selectSex.options[1].innerText = dict.sex_female;
    }
    
    if (labels[6]) labels[6].innerText = dict.height;
    
    buildUI();
}

// COMMUNICATION LUA -> JS (Affichage du Menu)
window.addEventListener('message', function(event) {
    let data = event.data;

    if (data.action === "openMultichar") {
        document.getElementById('multichar-container').style.display = "flex";
        document.getElementById('creation-container').style.display = "none";
        if(data.translateDict) { currentDict = data.translateDict; translatePage(); }
        loadCharacters(data.characters);
    }

    if (data.action === "openCreation") {
        document.getElementById('multichar-container').style.display = "none";
        document.getElementById('creation-container').style.display = "flex";

        if(data.translateDict) { currentDict = data.translateDict; translatePage(); }

        if (data.maxVals) {
            for (const [key, max] of Object.entries(data.maxVals)) {
                let input = document.getElementById(key);
                if (input) {
                    input.max = max;
                }
            }
        }
    }

    if (data.action === "closeAll") {
        document.getElementById('multichar-container').style.display = "none";
        document.getElementById('creation-container').style.display = "none";
    }
});

// =======================================================
// GESTION DU MULTICHARACTER
// =======================================================
function loadCharacters(chars) {
    const container = document.getElementById('slots-container');
    container.innerHTML = "";
    document.getElementById('character-actions').style.display = "none";
    
    selectedCharSlot = null;
    selectedCharId = null;
    deleteConfirm = false;

    for (let i = 1; i <= 3; i++) {
        let charData = chars.find(c => c.slot === i);
        let div = document.createElement('div');
        div.className = "char-card";
        
        if (charData) {
            // Carte d'un personnage existant
            div.innerHTML = `
                <div class="char-name">${charData.firstname} ${charData.lastname}</div>
                <div class="char-info"><i class="fas fa-calendar-alt"></i> ${charData.dateofbirth}</div>
            `;
            div.onclick = () => selectCharacter(charData.id, i, div);
        } else {
            // Emplacement vide
            let emptyText = currentDict.create_char || "CRÉER PERSONNAGE";
            div.innerHTML = `<div class="empty-slot">${emptyText}</div>`;
            div.onclick = () => { 
                currentSlot = i; 
                fetch(`https://${GetParentResourceName()}/startCreation`, { method: 'POST', body: JSON.stringify({ slot: i }) }); 
            };
        }
        container.appendChild(div);
    }
}

function selectCharacter(id, slot, element) {
    selectedCharId = id;
    selectedCharSlot = slot;
    
    // Ajoute la bordure blanche sur la carte sélectionnée
    document.querySelectorAll('.char-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    
    // Réinitialise le bouton supprimer (au cas où il était rouge)
    deleteConfirm = false;
    let delBtn = document.querySelector('.del-btn');
    delBtn.innerHTML = '<i class="fas fa-trash"></i> ' + (currentDict.delete || "SUPPRIMER");
    delBtn.style.background = "#222";

    // Affiche les boutons Jouer/Supprimer et zoome la caméra
    document.getElementById('character-actions').style.display = "flex";
    fetch(`https://${GetParentResourceName()}/focusPed`, { method: 'POST', body: JSON.stringify({ slot: slot }) });
}

function playSelected() {
    if(!selectedCharSlot) return;
    fetch(`https://${GetParentResourceName()}/playCharacter`, { method: 'POST', body: JSON.stringify({ slot: selectedCharSlot }) });
}

// Fonction de suppression (Sécurité double-clic)
function deleteSelected() {
    if(!selectedCharId) return;

    let delBtn = document.querySelector('.del-btn');

    if (!deleteConfirm) {
        // Premier clic : Avertissement rouge
        deleteConfirm = true;
        delBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + (currentDict.delete_confirm || "SÛR ?");
        delBtn.style.background = "#b71c1c";
        
        // Annule au bout de 3 secondes si pas cliqué
        setTimeout(() => {
            if(deleteConfirm) {
                deleteConfirm = false;
                delBtn.innerHTML = '<i class="fas fa-trash"></i> ' + (currentDict.delete || "SUPPRIMER");
                delBtn.style.background = "#222";
            }
        }, 3000);
    } else {
        // Deuxième clic : On supprime !
        document.getElementById('character-actions').style.display = "none";
        document.getElementById('slots-container').innerHTML = `<h2 style='color:#e60026;'>${currentDict.deleting || "SUPPRESSION EN COURS..."}</h2>`;
        
        fetch(`https://${GetParentResourceName()}/deleteCharacter`, { 
            method: 'POST', 
            body: JSON.stringify({ id: selectedCharId }) 
        });
    }
}

// =======================================================
// GESTION DE LA CRÉATION DE PERSONNAGE
// =======================================================
function switchTab(tabId, titleTextId, camType) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('tab-' + tabId).classList.add('active');
    event.currentTarget.classList.add('active');
    
    let titleText = currentDict['category_' + titleTextId] || titleTextId.toUpperCase();
    document.getElementById('category-title').innerText = titleText;
    
    changeCam(camType);
}

function changeCam(type) {
    document.querySelectorAll('.camera-controls button').forEach(el => el.classList.remove('active'));
    
    if(type === 'head') document.querySelectorAll('.camera-controls button')[0].classList.add('active');
    if(type === 'torso') document.querySelectorAll('.camera-controls button')[1].classList.add('active');
    if(type === 'legs') document.querySelectorAll('.camera-controls button')[2].classList.add('active');
    if(type === 'body') document.querySelectorAll('.camera-controls button')[3].classList.add('active');
    
    fetch(`https://${GetParentResourceName()}/focusCamera`, { method: 'POST', body: JSON.stringify({ cam: type }) });
}

function updateSkin(key, value) {
    document.getElementById(key + '-val').innerText = value;
    let finalValue = parseInt(value);
    
    fetch(`https://${GetParentResourceName()}/updateSkin`, { method: 'POST', body: JSON.stringify({ key: key, value: finalValue }) });
}

function updateGender() {
    let sex = document.getElementById('sex').value;
    fetch(`https://${GetParentResourceName()}/updateSkin`, { method: 'POST', body: JSON.stringify({ key: 'sex', value: parseInt(sex) }) });
}

function rotatePed(degree) { 
    fetch(`https://${GetParentResourceName()}/rotatePed`, { method: 'POST', body: JSON.stringify({ degree: degree }) }); 
}

// VALIDATION FINALE DE LA CRÉATION
document.getElementById('creation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Formatage de la date (Navigateur YYYY-MM-DD -> ESX DD/MM/YYYY)
    const dateObj = new Date(document.getElementById('dob').value);
    const dob = ("0" + dateObj.getDate()).slice(-2) + "/" + ("0" + (dateObj.getMonth() + 1)).slice(-2) + "/" + dateObj.getFullYear();
    
    fetch(`https://${GetParentResourceName()}/finishCreation`, {
        method: 'POST',
        body: JSON.stringify({ 
            slot: currentSlot, 
            firstname: document.getElementById('firstname').value, 
            lastname: document.getElementById('lastname').value, 
            dateofbirth: dob, 
            nationality: document.getElementById('nationality').value, 
            placeofbirth: document.getElementById('placeofbirth').value, 
            background: document.getElementById('background').value, // Transmet si on veut le Taxi ou non
            sex: document.getElementById('sex').value, 
            height: document.getElementById('height').value 
        })
    });
});