// State management voor de Recepten & Menu App
let state = {
  recipes: [],
  weekmenu: {
    'Maandag': null,
    'Dinsdag': null,
    'Woensdag': null,
    'Donderdag': null,
    'Vrijdag': null,
    'Zaterdag': null,
    'Zondag': null
  },
  activeTab: 'menu',
  activeFilters: {
    seasons: [],
    cuisines: [],
    time: 'all'
  },
  syncKey: '',
  syncApiKey: '',
  lastUpdated: 0,
  shoppingListChecked: {} // key format: "itemName_isChecked"
};

// Cloud Sync configuration
//const SYNC_BUCKET_ID = "4NaY4FPKgfhiSxfFQwps68";
//const SYNC_API_URL = state.syncKey;
//"https://kvdb.io/4NaY4FPKgfhiSxfFQwps68"; // Unieke app bucket

// Initialisatie bij het laden van de pagina
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  switchTab(state.activeTab);
  renderPlanner();
  renderRecipesList();
  
  // Set default seasons for suggestion generator based on current month
  setDefaultSuggestionFilters();
});

// ==========================================
// DATA BEHEER & LOCALSTORAGE
// ==========================================

function loadData() {
  const localData = localStorage.getItem('gezinsmenu_app_state');
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      state.recipes = parsed.recipes || [];
      state.weekmenu = parsed.weekmenu || {
        'Maandag': null, 'Dinsdag': null, 'Woensdag': null,
        'Donderdag': null, 'Vrijdag': null, 'Zaterdag': null, 'Zondag': null
      };
      state.syncKey = parsed.syncKey || '';
      state.syncApiKey = parsed.syncApiKey || '';
	  const SYNC_BUCKET_ID = "https://kvdb.io/"+parsed.syncApiKey || '';
      state.lastUpdated = parsed.lastUpdated || Date.now();
      state.shoppingListChecked = parsed.shoppingListChecked || {};
    } catch (e) {
      console.error("Fout bij laden van local data, resetten naar standaard...", e);
      loadSeedData();
    }
  } else {
    loadSeedData();
  }
  
  // Update Sync Key input in UI
  const syncApiInput = document.getElementById('settings-sync-api-key');
  const syncInput = document.getElementById('settings-sync-key');
  if (syncInput) syncInput.value = state.syncKey;
  if (syncApiInput) syncApiInput.value = state.syncApiKey;
  updateSyncStatusText();
}

function loadSeedData() {
  if (typeof SEED_RECIPES !== 'undefined') {
    state.recipes = [...SEED_RECIPES];
  } else {
    state.recipes = [];
  }
  state.weekmenu = {
    'Maandag': null, 'Dinsdag': null, 'Woensdag': null,
    'Donderdag': null, 'Vrijdag': null, 'Zaterdag': null, 'Zondag': null
  };
  state.shoppingListChecked = {};
  state.lastUpdated = Date.now();
  saveToLocalStorage();
}

function saveToLocalStorage() {
  state.lastUpdated = Date.now();
  localStorage.setItem('gezinsmenu_app_state', JSON.stringify({
    recipes: state.recipes,
    weekmenu: state.weekmenu,
    syncKey: state.syncKey,
    syncApiKey: state.syncApiKey,
    lastUpdated: state.lastUpdated,
    shoppingListChecked: state.shoppingListChecked
  }));
}

// ==========================================
// APP INTERACTIE & TABS
// ==========================================

function setupEventListeners() {
  // Voeg scroll headers effect toe
  const scrollContainers = document.querySelectorAll('.scroll-container');
  scrollContainers.forEach(container => {
    container.addEventListener('scroll', (e) => {
      const header = container.previousElementSibling;
      if (header && header.classList.contains('ios-header')) {
        if (container.scrollTop > 10) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  });
  
  // Zorg dat close modal werkt bij ESC toets
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeRecipeModal();
      closeDaySelectorSheet();
      closePlannerActionSheet();
    }
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Update tab buttons style
  const tabItems = document.querySelectorAll('.tab-item');
  tabItems.forEach((btn, index) => {
    const tabs = ['menu', 'database', 'suggestions', 'add', 'settings'];
    if (tabs[index] === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update views visibility
  const views = document.querySelectorAll('.tab-view');
  views.forEach(view => {
    view.classList.remove('active');
  });
  
  const activeView = document.getElementById(`tab-${tabId}`);
  if (activeView) {
    activeView.classList.add('active');
    
    // Specifieke acties per geopende tab
    if (tabId === 'menu') {
      renderPlanner();
    } else if (tabId === 'database') {
      renderRecipesList();
    }
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}

// ==========================================
// CALENDAR / WEEKMENU PLANNER
// ==========================================

let activePlannerDay = null; // Voor interactie met specifieke dag
let activeRecipeForPlanning = null; // Recept geselecteerd om toe te voegen

function renderPlanner() {
  const container = document.getElementById('week-planner-list');
  if (!container) return;
  
  container.innerHTML = '';
  const days = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
  
  days.forEach(day => {
    const recipeId = state.weekmenu[day];
    const recipe = recipeId ? state.recipes.find(r => r.id === recipeId) : null;
    
    const row = document.createElement('div');
    row.className = 'list-item';
    
    // Tap & Hold (Long Press) en Gewone klik opzet
    let pressTimer;
    const handleStart = () => {
      pressTimer = setTimeout(() => {
        triggerDayLongPress(day, recipe);
      }, 600); // 600ms is standard iOS long-press duration
    };
    const handleEnd = () => {
      clearTimeout(pressTimer);
    };
    
    // Mouse en touch events voor long press
    row.addEventListener('touchstart', handleStart);
    row.addEventListener('touchend', handleEnd);
    row.addEventListener('touchmove', handleEnd);
    row.addEventListener('mousedown', handleStart);
    row.addEventListener('mouseup', handleEnd);
    row.addEventListener('mouseleave', handleEnd);
    
    if (recipe) {
      // Ingevulde dag
      row.innerHTML = `
        <div class="list-item-left" onclick="openRecipeDetails(${recipe.id})">
          <span class="list-item-day-title">${day}</span>
          <div class="list-item-recipe-name">
            <span class="recipe-id-badge">#${recipe.id}</span>
            <span>${recipe.name}</span>
          </div>
          <div class="meta-badges-row">
            <span class="badge blue">⏱️ ${recipe.prepTime} min</span>
            <span class="badge orange">🍳 ${recipe.cuisine.join(', ')}</span>
          </div>
        </div>
        <div class="list-item-right">
          <button class="delete-row-btn" onclick="event.stopPropagation(); clearDayMenu('${day}')" title="Wissen">
            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
          <div class="chevron-arrow"></div>
        </div>
      `;
    } else {
      // Lege dag
      row.innerHTML = `
        <div class="list-item-left" onclick="shortcutToSuggestions('${day}')">
          <span class="list-item-day-title">${day}</span>
          <div class="list-item-empty">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            <span>Kies een gerecht...</span>
          </div>
        </div>
        <div class="list-item-right">
          <div class="chevron-arrow"></div>
        </div>
      `;
    }
    
    container.appendChild(row);
  });
  
  // Render de boodschappenlijst behorend bij de geplande gerechten
  renderShoppingList();
}

function clearDayMenu(day) {
  state.weekmenu[day] = null;
  saveToLocalStorage();
  renderPlanner();
  showToast(`${day} gewist uit menu`);
}

function shortcutToSuggestions(day) {
  activePlannerDay = day;
  switchTab('suggestions');
}

// Long press actie
function triggerDayLongPress(day, recipe) {
  if (!recipe) {
    // Indien de dag leeg is, direct navigeren naar suggesties
    shortcutToSuggestions(day);
    return;
  }
  
  activePlannerDay = day;
  
  // Open actiemenu
  const sheet = document.getElementById('planner-action-sheet');
  const title = document.getElementById('planner-action-title');
  title.textContent = `${day}: ${recipe.name}`;
  sheet.classList.remove('hidden');
}

function closePlannerActionSheet() {
  document.getElementById('planner-action-sheet').classList.add('hidden');
}

function openRecipeDetailsFromPlannerSheet() {
  closePlannerActionSheet();
  const recipeId = state.weekmenu[activePlannerDay];
  if (recipeId) openRecipeDetails(recipeId);
}

function goToSuggestionsFromPlannerSheet() {
  closePlannerActionSheet();
  switchTab('suggestions');
}

function clearDayFromPlannerSheet() {
  closePlannerActionSheet();
  if (activePlannerDay) clearDayMenu(activePlannerDay);
}

// ==========================================
// SUGGESTIE GENERATOR & RECEPTENKIEZER
// ==========================================

function setDefaultSuggestionFilters() {
  const currentMonth = new Date().getMonth(); // 0 = Jan, 5 = Jun
  let currentSeason = "Alle";
  
  if (currentMonth >= 2 && currentMonth <= 4) currentSeason = "Lente";
  else if (currentMonth >= 5 && currentMonth <= 7) currentSeason = "Zomer";
  else if (currentMonth >= 8 && currentMonth <= 10) currentSeason = "Herfst";
  else currentSeason = "Winter";
  
  // Set default checkbox status in generator form
  const checkboxes = document.querySelectorAll('#suggestion-season-grid input');
  checkboxes.forEach(cb => {
    cb.checked = (cb.value === currentSeason || cb.value === "Alle");
  });
}

function updateRangeLabel(val) {
  document.getElementById('range-value-label').textContent = `${val} minuten`;
}

function generateSuggestions() {
  // Haal filter instellingen op
  const seasonCheckboxes = document.querySelectorAll('#suggestion-season-grid input:checked');
  const selectedSeasons = Array.from(seasonCheckboxes).map(cb => cb.value);
  
  const cuisineCheckboxes = document.querySelectorAll('#suggestion-cuisine-grid input:checked');
  const selectedCuisines = Array.from(cuisineCheckboxes).map(cb => cb.value);
  
  const maxTime = parseInt(document.getElementById('suggestion-max-time').value);
  
  // Filter recepten
  let matches = state.recipes.filter(recipe => {
    // Bereidingstijd filter
    if (recipe.prepTime > maxTime) return false;
    
    // Keuken filter (recept moet minstens 1 van de geselecteerde keukens bevatten)
    const hasCuisine = recipe.cuisine.some(c => selectedCuisines.includes(c));
    if (!hasCuisine) return false;
    
    // Seizoen filter (recept moet minstens 1 van de geselecteerde seizoenen bevatten)
    const hasSeason = recipe.seasons.some(s => selectedSeasons.includes(s));
    if (!hasSeason) return false;
    
    return true;
  });
  
  const outputContainer = document.getElementById('suggestions-output-container');
  const grid = document.getElementById('suggestions-grid');
  grid.innerHTML = '';
  
  if (matches.length === 0) {
    grid.innerHTML = `
      <div class="ios-card text-center" style="grid-column: 1/-1; padding: 24px;">
        <p class="empty-state">Geen gerechten gevonden die voldoen aan deze filters. Selecteer meer seizoenen of keukens of verhoog de bereidingstijd.</p>
      </div>
    `;
    outputContainer.classList.remove('hidden');
    return;
  }
  
  // Pak 3 willekeurige gerechten uit de matches
  let shuffled = matches.sort(() => 0.5 - Math.random());
  let selected = shuffled.slice(0, 3);
  
  selected.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    
    card.innerHTML = `
      <div class="suggestion-card-header">
        <div>
          <span class="recipe-id-badge">#${recipe.id}</span>
          <h4 class="suggestion-card-title">${recipe.name}</h4>
          <p class="suggestion-time">⏱️ ${recipe.prepTime} min | 🍳 ${recipe.cuisine.join(', ')}</p>
        </div>
      </div>
      <div class="meta-badges-row">
        ${recipe.seasons.map(s => `<span class="badge">${s}</span>`).join('')}
      </div>
      <div class="suggestion-actions">
        <button class="ios-button primary" style="padding: 10px; font-size: 14px;" onclick="openPlanActionSheet(${recipe.id})">Plan gerecht...</button>
        <button class="ios-button secondary" style="padding: 10px; font-size: 14px;" onclick="openRecipeDetails(${recipe.id})">Details</button>
      </div>
    `;
    grid.appendChild(card);
  });
  
  outputContainer.classList.remove('hidden');
  // Scroll rustig naar de resultaten
  outputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Action sheet voor dag planning
function openPlanActionSheet(recipeId) {
  activeRecipeForPlanning = recipeId;
  const sheet = document.getElementById('day-selector-sheet');
  sheet.classList.remove('hidden');
}

function closeDaySelectorSheet() {
  document.getElementById('day-selector-sheet').classList.add('hidden');
}

function assignRecipeToDayFromSheet(day) {
  if (!activeRecipeForPlanning) return;
  
  state.weekmenu[day] = activeRecipeForPlanning;
  saveToLocalStorage();
  closeDaySelectorSheet();
  
  // Toon succes en ga terug naar weekmenu
  const recipe = state.recipes.find(r => r.id === activeRecipeForPlanning);
  showToast(`${recipe.name} ingepland op ${day}`);
  
  // Reset selectie
  activeRecipeForPlanning = null;
  activePlannerDay = null;
  
  switchTab('menu');
}

// ==========================================
// RECEPT DETAILS MODAL SHEET
// ==========================================

let activeModalRecipeId = null;

function openRecipeDetails(recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;
  
  activeModalRecipeId = recipeId;
  
  // Vul modal elementen
  document.getElementById('modal-recipe-id').textContent = `#${recipe.id}`;
  document.getElementById('modal-recipe-name').textContent = recipe.name;
  document.getElementById('modal-recipe-time').textContent = `${recipe.prepTime} min`;
  document.getElementById('modal-recipe-cuisine').textContent = recipe.cuisine.join(', ');
  document.getElementById('modal-recipe-seasons').textContent = recipe.seasons.join(', ');
  
  // Ingrediënten lijst
  const ingList = document.getElementById('modal-ingredients-list');
  ingList.innerHTML = '';
  recipe.ingredients.forEach(ing => {
    const li = document.createElement('li');
    li.textContent = ing;
    ingList.appendChild(li);
  });
  
  // Bereidingstappen
  const instContent = document.getElementById('modal-instructions-content');
  instContent.textContent = recipe.instructions;
  
  // Aanpassingen gezin
  document.getElementById('modal-recipe-veg').textContent = recipe.vegAdjustment || "Geen specifieke vegetarische aanpassing nodig.";
  document.getElementById('modal-recipe-picky').textContent = recipe.pickyAdjustment || "Geen specifieke aanpassing voor de moeilijke eter nodig.";
  
  // Opmerkingen
  const notesText = document.getElementById('modal-recipe-notes');
  if (recipe.notes) {
    notesText.textContent = recipe.notes;
    notesText.parentElement.style.display = 'block';
    notesText.parentElement.previousElementSibling.style.display = 'block'; // Title block
  } else {
    notesText.parentElement.style.display = 'none';
    notesText.parentElement.previousElementSibling.style.display = 'none';
  }
  
  // Toon modal
  const modal = document.getElementById('recipe-modal');
  modal.classList.remove('hidden');
  
  // Voorkom scrollen van achtergrond body op iOS
  document.body.style.overflow = 'hidden';
}

function closeRecipeModal() {
  const modal = document.getElementById('recipe-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  activeModalRecipeId = null;
}

function closeModalOnBackdrop(e) {
  if (e.target.id === 'recipe-modal') {
    closeRecipeModal();
  }
}

function openPlanActionSheetFromModal() {
  if (!activeModalRecipeId) return;
  openPlanActionSheet(activeModalRecipeId);
}

function deleteRecipeFromModal() {
  if (!activeModalRecipeId) return;
  
  const recipe = state.recipes.find(r => r.id === activeModalRecipeId);
  if (confirm(`Weet je zeker dat je het recept "${recipe.name}" permanent wilt verwijderen?`)) {
    // Verwijder uit recepten
    state.recipes = state.recipes.filter(r => r.id !== activeModalRecipeId);
    
    // Verwijder uit weekplanner indien ingepland
    for (let day in state.weekmenu) {
      if (state.weekmenu[day] === activeModalRecipeId) {
        state.weekmenu[day] = null;
      }
    }
    
    saveToLocalStorage();
    closeRecipeModal();
    showToast("Recept verwijderd");
    
    // Re-render
    renderRecipesList();
    renderPlanner();
  }
}

// ==========================================
// KENNISBANK OVERZICHT & ZOEKEN
// ==========================================

function toggleFilter(btn) {
  const type = btn.getAttribute('data-type');
  const value = btn.getAttribute('data-value');
  
  btn.classList.toggle('active');
  
  const list = type === 'season' ? state.activeFilters.seasons : state.activeFilters.cuisines;
  const index = list.indexOf(value);
  
  if (index > -1) {
    list.splice(index, 1);
  } else {
    list.push(value);
  }
  
  renderRecipesList();
}

function selectTimeFilter(btn, timeVal) {
  // Deactiveer andere tijdsfilters
  const buttons = document.querySelectorAll('#filter-times .pill-button');
  buttons.forEach(b => b.classList.remove('active'));
  
  btn.classList.add('active');
  state.activeFilters.time = timeVal;
  
  renderRecipesList();
}

function clearSearch() {
  const searchInput = document.getElementById('recipe-search');
  searchInput.value = '';
  document.getElementById('search-clear-btn').classList.add('hidden');
  renderRecipesList();
}

function filterRecipes() {
  const query = document.getElementById('recipe-search').value.trim();
  const clearBtn = document.getElementById('search-clear-btn');
  
  if (query.length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }
  
  renderRecipesList();
}

function renderRecipesList() {
  const container = document.getElementById('recipes-list-container');
  const title = document.getElementById('recipe-list-title');
  if (!container) return;
  
  const searchQuery = document.getElementById('recipe-search').value.toLowerCase().trim();
  
  // Filter recepten op basis van filters én spotlight-zoekopdracht
  let filtered = state.recipes.filter(recipe => {
    
    // 1. Spotlight Search (zoekt op naam, ingrediënten en uniek ID)
    if (searchQuery.length > 0) {
      const idMatch = `#${recipe.id}`.includes(searchQuery) || String(recipe.id).includes(searchQuery);
      const nameMatch = recipe.name.toLowerCase().includes(searchQuery);
      const ingredientMatch = recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery));
      
      if (!idMatch && !nameMatch && !ingredientMatch) {
        return false;
      }
    }
    
    // 2. Seizoenen filter
    if (state.activeFilters.seasons.length > 0) {
      const hasSeason = recipe.seasons.some(s => state.activeFilters.seasons.includes(s));
      if (!hasSeason) return false;
    }
    
    // 3. Keukens filter
    if (state.activeFilters.cuisines.length > 0) {
      const hasCuisine = recipe.cuisine.some(c => state.activeFilters.cuisines.includes(c));
      if (!hasCuisine) return false;
    }
    
    // 4. Tijd filter
    if (state.activeFilters.time !== 'all') {
      const maxTime = parseInt(state.activeFilters.time);
      if (recipe.prepTime > maxTime) return false;
    }
    
    return true;
  });
  
  title.textContent = `Resultaten (${filtered.length})`;
  container.innerHTML = '';
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <p class="empty-state">Geen recepten gevonden in de kennisbank. Voeg een nieuw recept toe of wis de zoekfilters.</p>
    `;
    return;
  }
  
  // Sorteer op ID descending zodat nieuwste recepten bovenaan staan
  filtered.sort((a, b) => b.id - a.id);
  
  filtered.forEach(recipe => {
    const item = document.createElement('button');
    item.className = 'list-item';
    item.onclick = () => openRecipeDetails(recipe.id);
    
    item.innerHTML = `
      <div class="list-item-left">
        <div class="list-item-recipe-name">
          <span class="recipe-id-badge">#${recipe.id}</span>
          <span>${recipe.name}</span>
        </div>
        <div class="meta-badges-row">
          <span class="badge blue">⏱️ ${recipe.prepTime} min</span>
          <span class="badge orange">🍳 ${recipe.cuisine.join(', ')}</span>
          ${recipe.seasons.map(s => `<span class="badge">${s}</span>`).join('')}
        </div>
      </div>
      <div class="list-item-right">
        <div class="chevron-arrow"></div>
      </div>
    `;
    container.appendChild(item);
  });
}

// ==========================================
// TOEVOEGEN VAN NIEUW RECEPT
// ==========================================

function resetRecipeForm() {
  document.getElementById('add-recipe-form').reset();
  showToast("Invoer gewist");
}

function saveNewRecipe(event) {
  event.preventDefault();
  
  const name = document.getElementById('form-name').value.trim();
  const prepTime = parseInt(document.getElementById('form-prep-time').value);
  
  // Seizoenen multi-select
  const seasonCbs = document.querySelectorAll('input[name="form-seasons"]:checked');
  const seasons = Array.from(seasonCbs).map(cb => cb.value);
  
  // Keukens multi-select
  const cuisineCbs = document.querySelectorAll('input[name="form-cuisine"]:checked');
  const cuisine = Array.from(cuisineCbs).map(cb => cb.value);
  
  // Input verificatie
  if (seasons.length === 0) {
    alert("Selecteer ten minste één geschikt seizoen.");
    return;
  }
  if (cuisine.length === 0) {
    alert("Selecteer ten minste één keuken.");
    return;
  }
  
  const rawIngredients = document.getElementById('form-ingredients').value;
  const ingredients = rawIngredients
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
    
  const instructions = document.getElementById('form-instructions').value.trim();
  const vegAdjustment = document.getElementById('form-veg-adj').value.trim();
  const pickyAdjustment = document.getElementById('form-picky-adj').value.trim();
  const notes = document.getElementById('form-notes').value.trim();
  
  // Bepaal uniek oplopend ID (minimaal 1001)
  const maxId = state.recipes.reduce((max, r) => r.id > max ? r.id : max, 1000);
  const newId = maxId + 1;
  
  const newRecipe = {
    id: newId,
    name,
    cuisine,
    prepTime,
    seasons,
    ingredients,
    instructions,
    vegAdjustment,
    pickyAdjustment,
    notes
  };
  
  state.recipes.push(newRecipe);
  saveToLocalStorage();
  
  // Formulier resetten en succes tonen
  document.getElementById('add-recipe-form').reset();
  showToast(`Recept #${newId} succesvol opgeslagen!`);
  
  // Direct openen ter controle
  openRecipeDetails(newId);
}

// ==========================================
// AUTOMATISCHE BOODSCHAPPENLIJST & PARSING
// ==========================================

function renderShoppingList() {
  const container = document.getElementById('shopping-list-container');
  if (!container) return;
  
  // Verzamel alle ingrediënten uit het actieve weekmenu
  let activeRecipes = [];
  for (let day in state.weekmenu) {
    const id = state.weekmenu[day];
    if (id) {
      const recipe = state.recipes.find(r => r.id === id);
      if (recipe) activeRecipes.push(recipe);
    }
  }
  
  if (activeRecipes.length === 0) {
    container.innerHTML = `
      <p class="empty-state">Kies gerechten in het menu om automatisch een boodschappenlijst te genereren.</p>
    `;
    return;
  }
  
  let aggregated = {};
  
  activeRecipes.forEach(recipe => {
    recipe.ingredients.forEach(line => {
      const parsed = parseIngredient(line);
      if (!parsed) return;
      
      const key = `${parsed.name.toLowerCase()}_${parsed.unit}`;
      if (aggregated[key]) {
        aggregated[key].quantity += parsed.quantity;
      } else {
        aggregated[key] = {
          name: parsed.name,
          unit: parsed.unit,
          quantity: parsed.quantity
        };
      }
    });
  });
  
  // Categoriseer de ingrediënten voor een overzichtelijkere indeling
  const categoryDefinition = {
    'Aardappels, Groenten & Fruit': ['wortel', 'wortelen', 'komkommer', 'tomaat', 'tomaten', 'cherrytomaat', 'cherrytomaatjes', 'courgette', 'paprika', 'sla', 'ijsbergsla', 'rucola', 'ui', 'uien', 'knoflook', 'boerenkool', 'citroen', 'avocado', 'peterselie', 'koriander'],
    'Zuivel, Kaas & Ei': ['kaas', 'cheddar', 'mozzarella', 'melk', 'crème', 'creme', 'fraîche', 'fraiche', 'boter', 'room', 'slagroom', 'kwark', 'yoghurt', 'ei', 'eieren'],
    'Vlees, Vis & Vega': ['kip', 'kipfilet', 'kipreepjes', 'rookworst', 'spek', 'spekjes', 'spekreepjes', 'gehakt', 'rundergehakt', 'veggie', 'vegetarisch', 'tofu', 'spekblokjes'],
    'Voorraadkast & Kruiden': ['pasta', 'penne', 'lasagne', 'lasagnebladen', 'rijst', 'basmatirijst', 'tandoori', 'pesto', 'pijnboom', 'pijnboompitten', 'bloem', 'kruiden', 'zout', 'peper', 'olie', 'zonnebloemolie', 'olijfolie', 'azijn', 'taco', 'taco\'s', 'mais', 'maïs', 'kidneybonen', 'bonen', 'salsa', 'saus', 'suiker', 'bouillon']
  };
  
  let categorized = {
    'Aardappels, Groenten & Fruit': [],
    'Zuivel, Kaas & Ei': [],
    'Vlees, Vis & Vega': [],
    'Voorraadkast & Kruiden': [],
    'Overig': []
  };
  
  Object.values(aggregated).forEach(item => {
    let matchedCat = 'Overig';
    const lowerName = item.name.toLowerCase();
    
    for (let cat in categoryDefinition) {
      const keywords = categoryDefinition[cat];
      const hasMatch = keywords.some(keyword => lowerName.includes(keyword));
      if (hasMatch) {
        matchedCat = cat;
        break;
      }
    }
    
    categorized[matchedCat].push(item);
  });
  
  // Render de lijst
  container.innerHTML = '';
  
  for (let cat in categorized) {
    const list = categorized[cat];
    if (list.length === 0) continue;
    
    // Sorteer alfabetisch
    list.sort((a, b) => a.name.localeCompare(b.name));
    
    const catTitle = document.createElement('div');
    catTitle.className = 'shopping-cat-title';
    catTitle.textContent = cat;
    container.appendChild(catTitle);
    
    list.forEach(item => {
      const row = document.createElement('div');
      
      const itemKey = `${item.name.toLowerCase()}_${item.unit}`;
      const isChecked = state.shoppingListChecked[itemKey] || false;
      
      row.className = `shopping-item ${isChecked ? 'checked' : ''}`;
      
      // Bepaal de weergave van het aantal
      let displayQty = "";
      if (item.unit === 'x') {
        displayQty = `${item.quantity}x`;
      } else {
        // Mooi afronden indien decimaal
        const roundedQty = Math.round(item.quantity * 100) / 100;
        displayQty = `${roundedQty}${item.unit}`;
      }
      
      // Let op: aantal moet VOORAAN staan (e.g. 2x wortel of 500g pasta)
      row.innerHTML = `
        <div class="shopping-checkbox">
          <div class="shopping-checkbox-tick"></div>
        </div>
        <span class="shopping-amount">${displayQty}</span>
        <span class="shopping-name">${item.name}</span>
      `;
      
      row.onclick = () => {
        const checkedState = !state.shoppingListChecked[itemKey];
        state.shoppingListChecked[itemKey] = checkedState;
        row.classList.toggle('checked', checkedState);
        saveToLocalStorage();
      };
      
      container.appendChild(row);
    });
  }
}

// Slimme ingrediënten parser
function parseIngredient(line) {
  line = line.trim();
  if (!line) return null;
  
  // Clean common prefixes
  line = line.replace(/^(en\s+|of\s+)/i, '');

  // Ondersteunde eenheden
  const units = ['g', 'gr', 'gram', 'kg', 'kilo', 'ml', 'l', 'liter', 'dl', 'el', 'eetlepels', 'eetlepel', 'tl', 'theelepels', 'theelepel', 'stuks', 'stk', 'pot', 'potten', 'blik', 'blikjes', 'blikje', 'blikken', 'bol', 'bollen', 'krop', 'kroppen', 'teentjes', 'teentje', 'zakje', 'zakjes', 'pak', 'pakken', 'plakjes', 'plakje'];
  
  // Matches getallen, kommagetallen en breuken (bijv. 1/2, 1.5, 300, 1½, ½)
  const numRegex = /^(\d+[\d\/\.\s-]*|½|⅓|¼|¾|1½|2½)/;
  const numMatch = line.match(numRegex);
  
  let quantity = 1;
  let unit = 'x';
  let name = line;
  
  if (numMatch) {
    let numStr = numMatch[1].trim();
    quantity = parseFraction(numStr);
    let remaining = line.substring(numMatch[0].length).trim();
    
    // Controleer of het eerstvolgende woord een bekende eenheid is
    const firstWordMatch = remaining.match(/^([a-zA-Z]+)/);
    if (firstWordMatch) {
      const word = firstWordMatch[1].toLowerCase();
      if (units.includes(word)) {
        unit = word;
        name = remaining.substring(word.length).trim();
      } else {
        name = remaining;
        unit = 'x';
      }
    } else {
      name = remaining;
      unit = 'x';
    }
  } else {
    // Geen getal aan de start, default naar 1 stuk
    quantity = 1;
    unit = 'x';
    name = line;
  }
  
  // Normaliseer eenheid naar kortere versies voor samenvoeging
  if (unit === 'gr' || unit === 'gram') unit = 'g';
  if (unit === 'kilo') unit = 'kg';
  if (unit === 'liter') unit = 'l';
  if (unit === 'blikje' || unit === 'blikken') unit = 'blik';
  if (unit === 'bollen') unit = 'bol';
  if (unit === 'zakjes') unit = 'zakje';
  
  name = cleanIngredientName(name);
  
  return { quantity, unit, name };
}

function parseFraction(str) {
  str = str.replace(/½/g, ' 0.5').replace(/⅓/g, ' 0.33').replace(/¼/g, ' 0.25').replace(/¾/g, ' 0.75');
  str = str.trim();
  
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 2) {
      return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
  }
  
  if (str.includes(' ')) {
    const parts = str.split(/\s+/);
    return parts.reduce((sum, p) => sum + parseFloat(p || 0), 0);
  }
  
  return parseFloat(str) || 1;
}

function cleanIngredientName(name) {
  // Verwijder overbodige lidwoorden en beschrijvingen aan het begin
  name = name.replace(/^(van\s+|voor\s+|of\s+|verse\s+|fijngehakte\s+|blikken\s+|blikje\s+)/i, '');
  name = name.toLowerCase().trim();
  
  // Plural normalisaties om ingrediënten goed te groeperen
  const normalizationMap = {
    'paprika\'s': 'paprika',
    'tomaatjes': 'tomaat',
    'tomaten': 'tomaat',
    'cherrytomaten': 'cherrytomaat',
    'cherrytomaatjes': 'cherrytomaat',
    'aardappelen': 'aardappel',
    'teentjes knoflook': 'knoflook',
    'teentje knoflook': 'knoflook',
    'courgettes': 'courgette',
    'komkommers': 'komkommer',
    'wortels': 'wortel',
    'wortelen': 'wortel',
    'spekreepjes': 'spekjes',
    'uien': 'ui'
  };
  
  for (let plural in normalizationMap) {
    if (name === plural || name.includes(plural)) {
      name = name.replace(plural, normalizationMap[plural]);
      break;
    }
  }
  
  // Hoofdletter
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function copyShoppingList() {
  const container = document.getElementById('shopping-list-container');
  const items = container.querySelectorAll('.shopping-item');
  
  if (items.length === 0) {
    showToast("Geen ingrediënten om te kopiëren");
    return;
  }
  
  let text = "*BOODSCHAPPENLIJST WEEKMENU*\n\n";
  let currentCat = "";
  
  const elements = container.children;
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el.classList.contains('shopping-cat-title')) {
      currentCat = el.textContent;
      text += `\n*${currentCat.toUpperCase()}*\n`;
    } else if (el.classList.contains('shopping-item')) {
      const checked = el.classList.contains('checked') ? "✅ " : "⬜ ";
      const amount = el.querySelector('.shopping-amount').textContent;
      const name = el.querySelector('.shopping-name').textContent;
      text += `${checked}${amount} ${name}\n`;
    }
  }
  
  navigator.clipboard.writeText(text).then(() => {
    showToast("Gekopieerd naar klembord! Stuur direct via WhatsApp.");
  }).catch(err => {
    alert("Fout bij kopiëren: " + err);
  });
}

// ==========================================
// INSTELLINGEN, GEZINS-SYNC & IMPORT/EXPORT
// ==========================================

function saveSyncKey() {
  const input = document.getElementById('settings-sync-key');
  state.syncKey = input.value.trim().replace(/[^a-zA-Z0-9-_]/g, ''); // Clean characters
  input.value = state.syncKey;
  saveToLocalStorage();
  updateSyncStatusText();
}

function saveSyncApiKey() {
  const input = document.getElementById('settings-sync-api-key');
  state.syncApiKey = input.value.trim().replace(/[^a-zA-Z0-9-_]/g, ''); // Clean characters
  input.value = state.syncApiKey;
  saveToLocalStorage();
  updateSyncStatusText();
}

function updateSyncStatusText() {
  const status = document.getElementById('sync-status-msg');
  if (!status) return;
  
  if (state.syncKey) {
    status.className = "sync-status-online";
    status.textContent = `Gezinscode actief: "${state.syncKey}" (Tik 'Synchroniseer Nu' om te delen)`;
  } else {
    status.className = "sync-status-offline";
    status.textContent = "Geen gezinscode actief. Synchronisatie uitgeschakeld.";
  }
}

async function syncWithCloud() {
	alert(state.syncKey);
  if (!state.syncKey) {
    alert("Voer eerst een unieke Gezins-code in bij Instellingen om te kunnen synchroniseren.");
    return;
  }
  
  const btn = document.getElementById('btn-sync');
  const originalText = btn.textContent;
  btn.textContent = "Synchroniseren...";
  btn.disabled = true;
  
  try {
    const url = `${SYNC_API_URL}/${state.syncKey}`;
    
    // 1. Haal de cloud data op
    const response = await fetch(url);
    let cloudData = null;
    
    if (response.ok) {
      cloudData = await response.json();
    }
    
    if (cloudData) {
      // Er is bestaande cloud data. Samenvoegen op basis van timestamp.
      // We behouden de meest recente status van het menu en de recepten.
      console.log("Cloud data gevonden. Mergen...", cloudData);
      
      // Merge recepten database (voeg recepten toe die lokaal ontbreken, en andersom)
      let mergedRecipes = [...state.recipes];
      
      cloudData.recipes.forEach(cloudRec => {
        const localIndex = mergedRecipes.findIndex(r => r.id === cloudRec.id);
        if (localIndex === -1) {
          // Recept bestaat niet lokaal, toevoegen
          mergedRecipes.push(cloudRec);
        } else {
          // Recept bestaat al. In een complexer systeem zouden we timestamps checken.
          // Hier overschrijven we lokaal met cloud data indien cloud nieuwer is.
          if (cloudData.lastUpdated > state.lastUpdated) {
            mergedRecipes[localIndex] = cloudRec;
          }
        }
      });
      
      state.recipes = mergedRecipes;
      
      // Merge weekmenu op basis van de laatste wijzigingstijd
      if (cloudData.lastUpdated > state.lastUpdated) {
        state.weekmenu = cloudData.weekmenu;
        // Neem ook checked items over van cloud
        state.shoppingListChecked = cloudData.shoppingListChecked || {};
      }
    }
    
    // 2. Upload de geüpdatete data terug naar de cloud
    state.lastUpdated = Date.now();
    const payload = {
      recipes: state.recipes,
      weekmenu: state.weekmenu,
      lastUpdated: state.lastUpdated,
      shoppingListChecked: state.shoppingListChecked
    };
    
    const writeResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!writeResponse.ok) {
      throw new Error("Cloud write failed");
    }
    
    saveToLocalStorage();
    showToast("Synchronisatie voltooid!");
    
    // Re-render planners
    renderPlanner();
    renderRecipesList();
    
  } catch (error) {
    console.error("Sync error:", error);
    alert("Synchronisatie mislukt. Controleer je internetverbinding en probeer het opnieuw.");
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// Handmatige backup export
function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
    recipes: state.recipes,
    weekmenu: state.weekmenu
  }, null, 2));
  
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `recepten_weekmenu_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  
  showToast("Back-up gedownload");
}

// Handmatige backup import
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.recipes && Array.isArray(parsed.recipes)) {
        state.recipes = parsed.recipes;
        state.weekmenu = parsed.weekmenu || state.weekmenu;
        state.shoppingListChecked = {}; // Reset checked items bij nieuwe import
        
        saveToLocalStorage();
        renderPlanner();
        renderRecipesList();
        
        showToast("Gegevens succesvol geïmporteerd!");
      } else {
        alert("Ongeldig bestandsformaat. Kan receptendatabase niet vinden.");
      }
    } catch (err) {
      alert("Fout bij inlezen van bestand: " + err);
    }
  };
  reader.readAsText(file);
}

function confirmResetToSeed() {
  if (confirm("Weet je zeker dat je alle data wilt wissen en herstellen naar de 5 standaard recepten?")) {
    loadSeedData();
    renderPlanner();
    renderRecipesList();
    showToast("Hersteld naar standaard recepten");
    switchTab('menu');
  }
}
