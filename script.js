console.log("CraveCraft JavaScript is running!");

// ----------------------------------------------------
// STATE & STORAGE SETUP (Persistent Across Sign-outs)
// ----------------------------------------------------
function getAppData(username) {
  const allData = JSON.parse(localStorage.getItem("cravecraftAllUsersData")) || {};
  if (!allData[username]) {
    allData[username] = {
      pantryItems: ["chicken", "rice", "eggs", "tomatoes", "onion"],
      cookedGallery: [],
      selectedAllergies: [],
      points: 0,
      cookedCount: 0
    };
  }
  return allData[username];
}

function saveAppData(username, data) {
  const allData = JSON.parse(localStorage.getItem("cravecraftAllUsersData")) || {};
  allData[username] = data;
  localStorage.setItem("cravecraftAllUsersData", JSON.stringify(allData));
}

// Shared Community Forum & Leaderboard Data (Permanent Server Sync)
const sharedServerData = JSON.parse(localStorage.getItem("cravecraftPublicServer")) || {
  leaderboard: [],
  communityRecipes: []
};

function persistServerData() {
  localStorage.setItem("cravecraftPublicServer", JSON.stringify(sharedServerData));
}

// ----------------------------------------------------
// RECIPE DATABASE
// ----------------------------------------------------
const recipes = [
  {
    name: "Chicken Quesadillas",
    image: "images/Chicken Quesadillas.jfif",
    ingredients: ["chicken", "tortilla", "cheese", "onion"],
    time: 20,
    tags: ["comfort", "quick"],
    description: "Crispy tortillas with a warm, cheesy filling.",
    steps: [
      "Cook the chicken with your preferred seasoning.",
      "Add chicken, onion and cheese to a tortilla.",
      "Fold and toast in a pan until golden and cooked through."
    ]
  },
  {
    name: "Egg Fried Rice",
    image: "images/egg fried rice.jfif",
    ingredients: ["rice", "eggs", "onion", "carrot", "peas", "soy sauce"],
    time: 15,
    tags: ["comfort", "quick"],
    description: "A quick meal for leftover rice.",
    steps: [
      "Prepare cooked rice and chop the vegetables.",
      "Scramble the eggs in a pan.",
      "Add rice and vegetables, then stir-fry until hot."
    ]
  },
  {
    name: "Spicy Chicken Rice",
    image: "images/spicy chicken rice.jfif",
    ingredients: ["chicken", "rice", "onion", "tomato", "chilli"],
    time: 30,
    tags: ["spicy", "comfort"],
    description: "A warming rice dish with chicken and spices.",
    steps: [
      "Cook the onion and chicken with seasoning.",
      "Add tomatoes and chilli to taste.",
      "Add cooked rice and mix until heated through."
    ]
  },
  {
    name: "Tomato Egg Toast",
    image: "images/tomato egg toast.jfif",
    ingredients: ["eggs", "tomato", "bread", "cheese"],
    time: 10,
    tags: ["quick", "comfort"],
    description: "A simple egg and tomato toast.",
    steps: [
      "Chop the tomato and whisk the eggs.",
      "Cook the eggs and tomato in a pan.",
      "Serve on toasted bread with cheese if desired."
    ]
  },
  {
    name: "Fresh Chicken Salad",
    image: "images/grilled chicken salad.jfif",
    ingredients: ["chicken", "lettuce", "tomato", "cucumber"],
    time: 25,
    tags: ["fresh"],
    description: "A fresh, crunchy salad with chicken.",
    steps: [
      "Cook the chicken thoroughly and let it cool slightly.",
      "Wash and chop the vegetables.",
      "Combine everything and add your preferred dressing."
    ]
  },
  {
    name: "Spicy Egg Wrap",
    image: "images/spicy egg wrap.jfif",
    ingredients: ["eggs", "tortilla", "onion", "chilli"],
    time: 12,
    tags: ["spicy", "quick"],
    description: "A fast wrap with eggs and a spicy kick.",
    steps: [
      "Whisk the eggs with chopped onion and chilli.",
      "Cook the egg mixture thoroughly in a pan.",
      "Place it in a tortilla, fold and serve."
    ]
  },
  {
    name: "Cheesy Tomato Pasta",
    image: "images/cheesy tomato pasta.jfif",
    ingredients: ["pasta", "tomato", "cheese", "onion"],
    time: 25,
    tags: ["comfort"],
    description: "Pasta with a simple tomato and cheese sauce.",
    steps: [
      "Boil the pasta according to its packet instructions.",
      "Cook onion and tomato to make a simple sauce.",
      "Mix with pasta and cheese, then serve hot."
    ]
  },
  {
    name: "Chickpea Salad",
    image: "images/chickpea salad.jfif",
    ingredients: ["chickpeas", "tomato", "cucumber", "onion"],
    time: 10,
    tags: ["fresh", "quick"],
    description: "A refreshing salad with chickpeas.",
    steps: [
      "Drain and rinse the cooked chickpeas.",
      "Chop the tomato, cucumber and onion.",
      "Mix everything with your preferred dressing."
    ]
  }
];

// ----------------------------------------------------
// RECIPE MATCHING LOGIC
// ----------------------------------------------------
const ingredientInput = document.getElementById("ingredients");
const cravingInput = document.getElementById("craving");
const maxTimeInput = document.getElementById("maxTime");
const findButton = document.getElementById("findRecipes");
const results = document.getElementById("recipeResults");
const message = document.getElementById("recipeMessage");

function normalizeIngredient(ingredient) {
  const value = ingredient.trim().toLowerCase();
  const aliases = {
    eggs: "eggs",
    egg: "eggs",
    tomatoes: "tomato",
    onions: "onion",
    potatoes: "potato",
    chickpeas: "chickpeas",
    tortillas: "tortilla",
    mushrooms: "mushroom",
    carrots: "carrot",
    peas: "peas",
    beans: "bean",
    "chicken breast": "chicken",
    "bell pepper": "pepper",
    "bell peppers": "pepper"
  };
  return aliases[value] || value;
}

function getUserIngredients() {
  const currentUser = localStorage.getItem("cravecraftCurrentUser");
  const userData = currentUser ? getAppData(currentUser) : { pantryItems: [] };
  
  const typed = ingredientInput.value
    .split(",")
    .map(normalizeIngredient)
    .filter(Boolean);
  
  return Array.from(new Set([...typed, ...userData.pantryItems.map(normalizeIngredient)]));
}

function findMatchingRecipes() {
  const userIngredients = getUserIngredients();
  const craving = cravingInput.value;
  const maxTime = Number(maxTimeInput.value);

  if (userIngredients.length === 0) {
    message.textContent = "Enter at least one ingredient or update your pantry to find meals.";
    results.replaceChildren();
    return;
  }

  const matches = recipes
    .map(recipe => {
      const matchedIngredients = recipe.ingredients.filter(
        ingredient => userIngredients.some(u => u.includes(ingredient) || ingredient.includes(u))
      );

      return {
        ...recipe,
        matchedIngredients,
        matchCount: matchedIngredients.length,
        matchPercentage: Math.round(
          (matchedIngredients.length / recipe.ingredients.length) * 100
        )
      };
    })
    .filter(recipe => recipe.matchCount > 0)
    .filter(recipe => recipe.time <= maxTime)
    .filter(recipe => craving === "any" || recipe.tags.includes(craving))
    .sort((a, b) => b.matchPercentage - a.matchPercentage || a.time - b.time);

  results.replaceChildren();

  if (matches.length === 0) {
    message.textContent = "No matches found. Try adding items or increasing cooking time.";
    return;
  }

  const topMatches = matches.slice(0, 4);

  message.textContent = `Found ${topMatches.length} suggestion(s) matching your kitchen & pantry!`;

  topMatches.forEach(recipe => {
    const card = document.createElement("article");
    card.className = "rounded-xl border border-neutral-800 bg-[#24211e] p-5 space-y-3 flex flex-col justify-between";
    
    const image = document.createElement("img");
    image.src = recipe.image;
    image.alt = recipe.name;
    image.className = "w-full h-48 object-cover rounded-lg";
    image.loading = "lazy";

    const title = document.createElement("h3");
    title.className = "text-xl text-white serif-heading";
    title.textContent = recipe.name;

    const description = document.createElement("p");
    description.className = "text-sm text-neutral-400";
    description.textContent = recipe.description;

    const meta = document.createElement("p");
    meta.className = "text-xs text-neutral-400";
    meta.textContent = `${recipe.time} minutes · ${recipe.matchPercentage}% ingredient overlap`;

    const used = document.createElement("p");
    used.className = "text-xs text-neutral-300";
    used.textContent = "You have: " + (recipe.matchedIngredients.join(", ") || "None");

    const missing = recipe.ingredients.filter(
      item => !recipe.matchedIngredients.includes(item)
    );

    const missingText = document.createElement("p");
    missingText.className = "text-xs text-neutral-400";
    missingText.textContent = missing.length
      ? "Still needed: " + missing.join(", ")
      : "You have all listed ingredients!";

    const cookBtn = document.createElement("button");
    cookBtn.type = "button";
    cookBtn.className = "rounded-lg bg-[#ebe3d5] px-4 py-2 text-sm text-[#1a1816] font-medium hover:bg-white w-full cursor-pointer";
    cookBtn.textContent = "Start Cooking Session";

    cookBtn.addEventListener("click", () => {
      startGuidedCooking(recipe);
    });

    card.append(image, title, description, meta, used, missingText, cookBtn);
    results.appendChild(card);
  });
}

if (findButton) findButton.addEventListener("click", findMatchingRecipes);

// ----------------------------------------------------
// AUTHENTICATION & NAVIGATION
// ----------------------------------------------------
const signupForm = document.getElementById("signupForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const authScreen = document.getElementById("screen-auth");
const dashboardScreen = document.getElementById("screen-dashboard");
const cookScreen = document.getElementById("screen-cook");
const reviewScreen = document.getElementById("screen-review");
const dashboardGreeting = document.getElementById("dashboardGreeting");

const signInTab = document.getElementById("signInTab");
const createAccountTab = document.getElementById("createAccountTab");
const authSubmitButton = document.getElementById("authSubmitButton");
const authMessage = document.getElementById("authMessage");

const homeLink = document.getElementById("homeLink");
const galleryLink = document.getElementById("galleryLink");
const signOutButton = document.getElementById("signOutButton");

let authMode = "signup";
let currentActiveRecipe = null;
let currentStepIndex = 0;

function hideAllScreens() {
  [authScreen, dashboardScreen, cookScreen, reviewScreen].forEach(s => {
    if (s) s.classList.add("hidden");
  });
}

function showDashboard(username) {
  hideAllScreens();
  dashboardGreeting.textContent = `Hello, ${username}`;
  dashboardScreen.classList.remove("hidden");
  updateDashboardCardsAndLeaderboard();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showAuth() {
  hideAllScreens();
  authScreen.classList.remove("hidden");
  authMessage.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setAuthMode(mode) {
  authMode = mode;
  authMessage.textContent = "";

  const isSignup = mode === "signup";

  authSubmitButton.textContent = isSignup ? "Create account" : "Sign in";

  createAccountTab.className = isSignup
    ? "text-white border-b-2 border-white pb-2 font-medium cursor-pointer"
    : "text-neutral-500 hover:text-white pb-2 cursor-pointer";

  signInTab.className = isSignup
    ? "text-neutral-500 hover:text-white pb-2 cursor-pointer"
    : "text-white border-b-2 border-white pb-2 font-medium cursor-pointer";
}

if (createAccountTab) createAccountTab.addEventListener("click", () => setAuthMode("signup"));
if (signInTab) signInTab.addEventListener("click", () => setAuthMode("signin"));

if (signupForm) {
  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      authMessage.textContent = "Please enter your username and password.";
      return;
    }

    const accounts = JSON.parse(localStorage.getItem("cravecraftAccounts") || "{}");
    const accountKey = username.toLowerCase();

    if (authMode === "signup") {
      if (accounts[accountKey]) {
        authMessage.textContent = "That username already exists. Please sign in instead.";
        return;
      }

      accounts[accountKey] = { username: username, password: password };
      localStorage.setItem("cravecraftAccounts", JSON.stringify(accounts));
    } else {
      const account = accounts[accountKey];
      if (!account || account.password !== password) {
        authMessage.textContent = "Incorrect username or password. Please try again.";
        return;
      }
    }

    localStorage.setItem("cravecraftCurrentUser", username);
    syncUserToLeaderboard(username);
    showDashboard(username);
  });
}

// Food Allergy Buttons Interaction
document.querySelectorAll("#screen-auth .flex.flex-wrap.gap-2 button").forEach(btn => {
  btn.setAttribute("type", "button");
  btn.addEventListener("click", () => {
    const currentUser = localStorage.getItem("cravecraftCurrentUser");
    if (!currentUser) return;
    const userData = getAppData(currentUser);
    const text = btn.textContent.trim();

    if (userData.selectedAllergies.includes(text)) {
      userData.selectedAllergies = userData.selectedAllergies.filter(a => a !== text);
      btn.className = "px-4 py-1.5 rounded-full border border-neutral-700 bg-[#24211e] text-xs hover:border-neutral-500 cursor-pointer";
    } else {
      userData.selectedAllergies.push(text);
      btn.className = "px-4 py-1.5 rounded-full border border-neutral-500 bg-[#ebe3d5] text-[#1a1816] text-xs font-medium cursor-pointer";
    }
    saveAppData(currentUser, userData);
  });
});

if (homeLink) {
  homeLink.addEventListener("click", function (event) {
    event.preventDefault();
    const username = localStorage.getItem("cravecraftCurrentUser");
    if (username) showDashboard(username);
    else showAuth();
  });
}

if (galleryLink) {
  galleryLink.addEventListener("click", function (event) {
    event.preventDefault();
    if (localStorage.getItem("cravecraftCurrentUser")) {
      openGalleryModal();
    } else {
      alert("Please sign in to view your gallery.");
      showAuth();
    }
  });
}

if (signOutButton) {
  signOutButton.addEventListener("click", function () {
    localStorage.removeItem("cravecraftCurrentUser");
    signupForm.reset();
    setAuthMode("signin");
    showAuth();
  });
}

// ----------------------------------------------------
// DASHBOARD CARDS (PANTRY, GALLERY, SHARE RECIPE)
// ----------------------------------------------------
const dashboardCards = document.querySelectorAll("#screen-dashboard .grid-cols-1.md\\:grid-cols-3 > div");

if (dashboardCards.length >= 3) {
  dashboardCards[0].style.cursor = "pointer";
  dashboardCards[0].addEventListener("click", () => openPantryModal());

  dashboardCards[1].style.cursor = "pointer";
  dashboardCards[1].addEventListener("click", () => openGalleryModal());

  dashboardCards[2].style.cursor = "pointer";
  dashboardCards[2].addEventListener("click", () => openShareModal());
}

function updateDashboardCardsAndLeaderboard() {
  const currentUser = localStorage.getItem("cravecraftCurrentUser");
  if (!currentUser) return;
  const userData = getAppData(currentUser);

  if (dashboardCards.length >= 3) {
    dashboardCards[0].querySelector("p").textContent = `${userData.pantryItems.length} products in stock`;
    dashboardCards[1].querySelector("p").textContent = `${userData.cookedCount} dishes cooked`;
  }

  // Render Public Leaderboard & Community Forum Feed
  let lbSection = document.getElementById("publicLeaderboardSection");
  if (!lbSection) {
    lbSection = document.createElement("div");
    lbSection.id = "publicLeaderboardSection";
    lbSection.className = "bg-[#24211e] p-5 rounded-xl border border-neutral-800 space-y-4 mt-6";
    lbSection.innerHTML = `
      <h3 class="text-xl font-normal text-white serif-heading">Public Leaderboard & Community Forum</h3>
      <p class="text-xs text-neutral-400">Live rankings and community shared recipes:</p>
      <div id="liveLeaderboardList" class="space-y-2 pb-2 border-b border-neutral-800"></div>
      <div class="space-y-2 pt-2">
        <h4 class="text-sm font-medium text-white">Community Recipe Feed</h4>
        <div id="communityFeedList" class="grid grid-cols-1 md:grid-cols-2 gap-3"></div>
      </div>
    `;
    dashboardScreen.appendChild(lbSection);
  }

  const lbList = document.getElementById("liveLeaderboardList");
  if (lbList) {
    if (sharedServerData.leaderboard.length === 0) {
      lbList.innerHTML = `<p class="text-xs text-neutral-500 italic">No chefs on the leaderboard yet. Cook or post a dish to rank!</p>`;
    } else {
      lbList.innerHTML = sharedServerData.leaderboard.map((chef, i) => `
        <div class="flex justify-between items-center text-sm border-b border-neutral-800/60 pb-1.5">
          <span class="text-neutral-200">${i + 1}. ${chef.name}${chef.name === currentUser ? '(You)' : ''}</span>
          <span class="text-xs text-neutral-400">${chef.points} pts · ${chef.dishes} dishes</span>
        </div>
      `).join("");
    }
  }

  const communityFeedList = document.getElementById("communityFeedList");
  if (communityFeedList) {
    if (sharedServerData.communityRecipes.length === 0) {
      communityFeedList.innerHTML = `<p class="text-xs text-neutral-500 italic col-span-2">No community recipes shared yet. Click "Share a recipe" to post yours!</p>`;
    } else {
      communityFeedList.innerHTML = sharedServerData.communityRecipes.map(item => `
        <div class="bg-[#1a1816] border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between">
          <img src="${item.image}" alt="${item.recipeName}" class="w-full h-28 object-cover">
          <div class="p-3 space-y-1">
            <div class="flex justify-between items-center">
              <h5 class="text-sm font-medium text-white">${item.recipeName}</h5>
              <span class="text-[10px] text-neutral-500">by ${item.author}</span>
            </div>
            <p class="text-xs text-neutral-400">Ingredients: ${item.ingredients}</p>
          </div>
        </div>
      `).join("");
    }
  }
}

// ----------------------------------------------------
// MODALS (PANTRY, GALLERY, SHARE RECIPE)
// ----------------------------------------------------
function openPantryModal() {
  const currentUser = localStorage.getItem("cravecraftCurrentUser");
  const userData = getAppData(currentUser);

  createOrShowModal(`
    <h3 class="text-xl font-normal text-white serif-heading">Your Smart Pantry</h3>
    <p class="text-xs text-neutral-400">Update stock ingredients so we suggest meals based on what you have:</p>
    <div class="flex flex-wrap gap-2 py-2" id="pantryModalList">
      ${userData.pantryItems.map((item, idx) => `
        <span class="bg-[#1a1816] border border-neutral-700 px-3 py-1 rounded-full text-xs text-neutral-200 flex items-center gap-2">
          ${item}
          <button data-index="${idx}" class="removePantryItem hover:text-red-400 cursor-pointer">&times;</button>
        </span>
      `).join("")}
    </div>
    <div class="flex gap-2 pt-2">
      <input type="text" id="newPantryInput" placeholder="Add item (e.g. potatoes)" class="bg-[#1a1816] border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white flex-1 focus:outline-none">
      <button id="addPantryBtn" type="button" class="bg-[#ebe3d5] text-[#1a1816] px-4 py-
