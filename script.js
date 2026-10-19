document.addEventListener("DOMContentLoaded", () => {
  console.log("CraveCraft JavaScript running cleanly!");

  // ----------------------------------------------------
  // STORAGE HELPERS
  // ----------------------------------------------------
  function getAppData(username) {
    const allData = JSON.parse(localStorage.getItem("cravecraftAllUsersData") || "{}");
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
    const allData = JSON.parse(localStorage.getItem("cravecraftAllUsersData") || "{}");
    allData[username] = data;
    localStorage.setItem("cravecraftAllUsersData", JSON.stringify(allData));
  }

  function getServerData() {
    return JSON.parse(localStorage.getItem("cravecraftPublicServer") || '{"leaderboard":[],"communityRecipes":[]}');
  }

  function saveServerData(data) {
    localStorage.setItem("cravecraftPublicServer", JSON.stringify(data));
  }

  // ----------------------------------------------------
  // RECIPES
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
    }
  ];

  // ----------------------------------------------------
  // UI NAVIGATION
  // ----------------------------------------------------
  const authScreen = document.getElementById("screen-auth");
  const dashboardScreen = document.getElementById("screen-dashboard");
  const cookScreen = document.getElementById("screen-cook");
  const reviewScreen = document.getElementById("screen-review");

  function hideAllScreens() {
    [authScreen, dashboardScreen, cookScreen, reviewScreen].forEach(s => s?.classList.add("hidden"));
  }

  function showDashboard(username) {
    hideAllScreens();
    const greeting = document.getElementById("dashboardGreeting");
    if (greeting) greeting.textContent = `Hello, ${username}`;
    dashboardScreen?.classList.remove("hidden");
    updateDashboardUI();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showAuth() {
    hideAllScreens();
    authScreen?.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ----------------------------------------------------
  // AUTHENTICATION SYSTEM (SIGN IN & SIGN UP)
  // ----------------------------------------------------
  const signupForm = document.getElementById("signupForm");
  const signInTab = document.getElementById("signInTab");
  const createAccountTab = document.getElementById("createAccountTab");
  const authSubmitButton = document.getElementById("authSubmitButton");
  const authMessage = document.getElementById("authMessage");

  let authMode = "signup";

  function setAuthMode(mode) {
    authMode = mode;
    if (authMessage) authMessage.textContent = "";

    if (authSubmitButton) {
      authSubmitButton.textContent = mode === "signup" ? "Create account" : "Sign in";
    }

    if (createAccountTab) {
      createAccountTab.className = mode === "signup"
        ? "text-white border-b-2 border-white pb-2 font-medium cursor-pointer"
        : "text-neutral-500 hover:text-white pb-2 cursor-pointer";
    }
    if (signInTab) {
      signInTab.className = mode === "signup"
        ? "text-neutral-500 hover:text-white pb-2 cursor-pointer"
        : "text-white border-b-2 border-white pb-2 font-medium cursor-pointer";
    }
  }

  createAccountTab?.addEventListener("click", (e) => { e.preventDefault(); setAuthMode("signup"); });
  signInTab?.addEventListener("click", (e) => { e.preventDefault(); setAuthMode("signin"); });

  function handleAuth(e) {
    if (e) e.preventDefault();

    const userVal = document.getElementById("username")?.value.trim();
    const passVal = document.getElementById("password")?.value;

    if (!userVal || !passVal) {
      if (authMessage) authMessage.textContent = "Please enter both username and password.";
      return;
    }

    const accounts = JSON.parse(localStorage.getItem("cravecraftAccounts") || "{}");
    const key = userVal.toLowerCase();

    if (authMode === "signup") {
      if (accounts[key]) {
        if (authMessage) authMessage.textContent = "Username already exists. Click 'Sign in' above!";
        return;
      }
      accounts[key] = { username: userVal, password: passVal };
      localStorage.setItem("cravecraftAccounts", JSON.stringify(accounts));
    } else {
      if (!accounts[key] || accounts[key].password !== passVal) {
        if (authMessage) authMessage.textContent = "Incorrect username or password.";
        return;
      }
    }

    localStorage.setItem("cravecraftCurrentUser", userVal);
    syncLeaderboard(userVal);
    showDashboard(userVal);
  }

  signupForm?.addEventListener("submit", handleAuth);
  authSubmitButton?.addEventListener("click", handleAuth);

  // Nav Buttons
  document.getElementById("homeLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    const u = localStorage.getItem("cravecraftCurrentUser");
    if (u) showDashboard(u); else showAuth();
  });

  document.getElementById("galleryLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (localStorage.getItem("cravecraftCurrentUser")) openGalleryModal();
    else alert("Please sign in to view your gallery.");
  });

  document.getElementById("signOutButton")?.addEventListener("click", () => {
    localStorage.removeItem("cravecraftCurrentUser");
    signupForm?.reset();
    setAuthMode("signin");
    showAuth();
  });

  // Allergy buttons
  document.querySelectorAll("#screen-auth .flex.flex-wrap.gap-2 button").forEach(btn => {
    btn.setAttribute("type", "button");
    btn.addEventListener("click", () => {
      const u = localStorage.getItem("cravecraftCurrentUser");
      if (!u) return;
      const userData = getAppData(u);
      const txt = btn.textContent.trim();

      if (userData.selectedAllergies.includes(txt)) {
        userData.selectedAllergies = userData.selectedAllergies.filter(a => a !== txt);
        btn.className = "px-4 py-1.5 rounded-full border border-neutral-700 bg-[#24211e] text-xs hover:border-neutral-500 cursor-pointer";
      } else {
        userData.selectedAllergies.push(txt);
        btn.className = "px-4 py-1.5 rounded-full border border-neutral-500 bg-[#ebe3d5] text-[#1a1816] text-xs font-medium cursor-pointer";
      }
      saveAppData(u, userData);
    });
  });

  // ----------------------------------------------------
  // RECIPE FINDER
  // ----------------------------------------------------
  function findMatchingRecipes() {
    const ingInput = document.getElementById("ingredients");
    const cravingInput = document.getElementById("craving");
    const maxTimeInput = document.getElementById("maxTime");
    const results = document.getElementById("recipeResults");
    const message = document.getElementById("recipeMessage");

    if (!ingInput || !results) return;

    const currentUser = localStorage.getItem("cravecraftCurrentUser");
    const userData = currentUser ? getAppData(currentUser) : { pantryItems: [] };

    const typed = ingInput.value.toLowerCase().split(",").map(i => i.trim()).filter(Boolean);
    const available = Array.from(new Set([...typed, ...userData.pantryItems.map(i => i.toLowerCase().trim())]));

    if (available.length === 0) {
      if (message) message.textContent = "Enter at least one ingredient or add items to your pantry.";
      results.replaceChildren();
      return;
    }

    const maxTime = Number(maxTimeInput?.value || 60);
    const craving = cravingInput?.value || "any";

    const matches = recipes
      .map(r => {
        const matched = r.ingredients.filter(ing => available.some(a => a.includes(ing) || ing.includes(a)));
        return {
          ...r,
          matched,
          matchCount: matched.length,
          matchPct: Math.round((matched.length / r.ingredients.length) * 100)
        };
      })
      .filter(r => r.matchCount > 0 && r.time <= maxTime)
      .filter(r => craving === "any" || r.tags.includes(craving))
      .sort((a, b) => b.matchPct - a.matchPct || a.time - b.time);

    results.replaceChildren();

    if (matches.length === 0) {
      if (message) message.textContent = "No matches found. Try adding items or increasing cooking time.";
      return;
    }

    const top = matches.slice(0, 4);
    if (message) message.textContent = `Found ${top.length} suggestion(s) matching your kitchen!`;

    top.forEach(recipe => {
      const card = document.createElement("article");
      card.className = "rounded-xl border border-neutral-800 bg-[#24211e] p-5 space-y-3 flex flex-col justify-between";

      card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}" class="w-full h-48 object-cover rounded-lg">
        <h3 class="text-xl text-white serif-heading">${recipe.name}</h3>
        <p class="text-sm text-neutral-400">${recipe.description}</p>
        <p class="text-xs text-neutral-400">${recipe.time} mins · ${recipe.matchPct}% match</p>
        <p class="text-xs text-neutral-300">You have: ${recipe.matched.join(", ") || "None"}</p>
        <button type="button" class="startCookBtn rounded-lg bg-[#ebe3d5] px-4 py-2 text-sm text-[#1a1816] font-medium hover:bg-white w-full cursor-pointer">Start Cooking Session</button>
      `;

      card.querySelector(".startCookBtn")?.addEventListener("click", () => startCooking(recipe));
      results.appendChild(card);
    });
  }

  document.getElementById("findRecipes")?.addEventListener("click", findMatchingRecipes);

  // ----------------------------------------------------
  // DASHBOARD CARDS & MODALS
  // ----------------------------------------------------
  const cards = document.querySelectorAll("#screen-dashboard .grid-cols-1.md\\:grid-cols-3 > div");
  if (cards.length >= 3) {
    cards[0].style.cursor = "pointer";
    cards[0].addEventListener("click", openPantryModal);

    cards[1].style.cursor = "pointer";
    cards[1].addEventListener("click", openGalleryModal);

    cards[2].style.cursor = "pointer";
    cards[2].addEventListener("click", openShareModal);
  }

  function updateDashboardUI() {
    const user = localStorage.getItem("cravecraftCurrentUser");
    if (!user) return;
    const userData = getAppData(user);
    const server = getServerData();

    if (cards.length >= 3) {
      cards[0].querySelector("p").textContent = `${userData.pantryItems.length} products in stock`;
      cards[1].querySelector("p").textContent = `${userData.cookedCount} dishes cooked`;
    }

    let lbSection = document.getElementById("publicLeaderboardSection");
    if (!lbSection) {
      lbSection = document.createElement("div");
      lbSection.id = "publicLeaderboardSection";
      lbSection.className = "bg-[#24211e] p-5 rounded-xl border border-neutral-800 space-y-4 mt-6";
      lbSection.innerHTML = `
        <h3 class="text-xl font-normal text-white serif-heading">Public Leaderboard & Forum Feed</h3>
        <div id="liveLeaderboardList" class="space-y-2 pb-2 border-b border-neutral-800"></div>
        <div class="space-y-2 pt-2">
          <h4 class="text-sm font-medium text-white">Community Shared Recipes</h4>
          <div id="communityFeedList" class="grid grid-cols-1 md:grid-cols-2 gap-3"></div>
        </div>
      `;
      dashboardScreen?.appendChild(lbSection);
    }

    const lbList = document.getElementById("liveLeaderboardList");
    if (lbList) {
      lbList.innerHTML = server.leaderboard.length ? server.leaderboard.map((c, i) => `
        <div class="flex justify-between items-center text-sm border-b border-neutral-800/60 pb-1.5">
          <span class="text-neutral-200">${i + 1}. ${c.name} ${c.name === user ? '(You)' : ''}</span>
          <span class="text-xs text-neutral-400">${c.points} pts · ${c.dishes} dishes</span>
        </div>
      `).join("") : `<p class="text-xs text-neutral-500 italic">No rankings yet. Cook or post a recipe to join!</p>`;
    }

    const feed = document.getElementById("communityFeedList");
    if (feed) {
      feed.innerHTML = server.communityRecipes.length ? server.communityRecipes.map(item => `
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
      `).join("") : `<p class="text-xs text-neutral-500 italic col-span-2">No community posts yet. Click "Share a recipe" to post!</p>`;
    }
  }

  function openPantryModal() {
    const user = localStorage.getItem("cravecraftCurrentUser");
    const userData = getAppData(user);

    showModal(`
      <h3 class="text-xl font-normal text-white serif-heading">Smart Pantry Manager</h3>
      <div class="flex flex-wrap gap-2 py-2">
        ${userData.pantryItems.map((item, idx) => `
          <span class="bg-[#1a1816] border border-neutral-700 px-3 py-1 rounded-full text-xs text-neutral-200 flex items-center gap-2">
            ${item}
            <button data-index="${idx}" class="removePantryItem hover:text-red-400 cursor-pointer">&times;</button>
          </span>
        `).join("")}
      </div>
      <div class="flex gap-2 pt-2">
        <input type="text" id="newPantryInput" placeholder="Add item (e.g. potatoes)" class="bg-[#1a1816] border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white flex-1 focus:outline-none">
        <button id="addPantryBtn" type="button" class="bg-[#ebe3d5] text-[#1a1816] px-4 py-2 rounded-lg text-xs font-medium cursor-pointer">Add</button>
      </div>
      <button id="closeModalBtn" type="button" class="mt-4 w-full bg-neutral-800 text-neutral-300 py-2 rounded-lg text-sm cursor-pointer hover:bg-neutral-700">Close</button>
    `);

    document.querySelectorAll(".removePantryItem").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = Number(e.target.getAttribute("data-index"));
        userData.pantryItems.splice(idx, 1);
        saveAppData(user, userData);
        updateDashboardUI();
        openPantryModal();
      });
    });

    document.getElementById("addPantryBtn")?.addEventListener("click", () => {
      const val = document.getElementById("newPantryInput")?.value.trim().toLowerCase();
      if (val && !userData.pantryItems.includes(val)) {
        userData.pantryItems.push(val);
        saveAppData(user, userData);
        updateDashboardUI();
        openPantryModal();
      }
    });
  }

  function openGalleryModal() {
    const user = localStorage.getItem("cravecraftCurrentUser");
    const userData = getAppData(user);

    showModal(`
      <h3 class="text-xl font-normal text-white serif-heading">Cooked Dishes Gallery</h3>
      <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-1 py-2">
        ${userData.cookedGallery.length ? userData.cookedGallery.map(dish => `
          <div class="bg-[#1a1816] border border-neutral-800 rounded-xl p-3 flex gap-3 items-center">
            <img src="${dish.image}" alt="${dish.name}" class="w-14 h-14 rounded-lg object-cover">
            <div class="flex-1">
              <h4 class="text-sm font-medium text-white">${dish.name}</h4>
              <span class="text-xs text-neutral-500">Cooked on ${dish.date}</span>
            </div>
            <button data-dish="${dish.name}" type="button" class="shareSocialBtn bg-[#ebe3d5] text-[#1a1816] px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-white">Share</button>
          </div>
        `).join("") : '<p class="text-xs text-neutral-500 italic py-4">No dishes cooked yet!</p>'}
      </div>
      <button id="closeModalBtn" type="button" class="mt-2 w-full bg-neutral-800 text-neutral-300 py-2 rounded-lg text-sm cursor-pointer hover:bg-neutral-700">Close</button>
    `);

    document.querySelectorAll(".shareSocialBtn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const dish = e.target.getAttribute("data-dish");
        const shareText = `I just cooked ${dish} on CraveCraft! 🍳✨ #CraveCraft`;
        navigator.clipboard.writeText(shareText);
        alert(`Copied post text to clipboard:\n\n"${shareText}"`);
      });
    });
  }

  function openShareModal() {
    showModal(`
      <h3 class="text-xl font-normal text-white serif-heading">Share a Recipe</h3>
      <div class="space-y-3 pt-2">
        <input type="text" id="commRecipeName" placeholder="Recipe Name" class="w-full bg-[#1a1816] border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none">
        <input type="text" id="commRecipeIng" placeholder="Ingredients (comma separated)" class="w-full bg-[#1a1816] border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none">
        <button id="submitCommRecipe" type="button" class="w-full bg-[#ebe3d5] text-[#1a1816] py-2.5 rounded-lg text-sm font-medium cursor-pointer">Publish Recipe</button>
      </div>
      <button id="closeModalBtn" type="button" class="mt-2 w-full bg-neutral-800 text-neutral-300 py-2 rounded-lg text-sm cursor-pointer hover:bg-neutral-700">Cancel</button>
    `);

    document.getElementById("submitCommRecipe")?.addEventListener("click", () => {
      const name = document.getElementById("commRecipeName")?.value.trim();
      const ing = document.getElementById("commRecipeIng")?.value.trim();

      if (name && ing) {
        const user = localStorage.getItem("cravecraftCurrentUser") || "Chef";
        const userData = getAppData(user);
        const server = getServerData();

        server.communityRecipes.unshift({
          recipeName: name,
          ingredients: ing,
          image: "images/Chicken Quesadillas.jfif",
          author: user
        });

        userData.points += 200;
        saveAppData(user, userData);
        saveServerData(server);
        syncLeaderboard(user);
        updateDashboardUI();
        closeModal();
      } else {
        alert("Please fill in recipe name and ingredients!");
      }
    });
  }

  function showModal(html) {
    let modal = document.getElementById("ccDynamicModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "ccDynamicModal";
      modal.className = "fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50";
      modal.innerHTML = `<div id="ccModalInner" class="bg-[#24211e] border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"></div>`;
      document.body.appendChild(modal);
    }
    modal.querySelector("#ccModalInner").innerHTML = html;
    modal.classList.remove("hidden");

    document.getElementById("closeModalBtn")?.addEventListener("click", closeModal);
  }

  function closeModal() {
    document.getElementById("ccDynamicModal")?.classList.add("hidden");
  }

  // ----------------------------------------------------
  // COOKING FLOW
  // ----------------------------------------------------
  let activeRecipe = null;
  let currentStep = 0;

  function startCooking(recipe) {
    activeRecipe = recipe;
    currentStep = 0;
    hideAllScreens();
    cookScreen?.classList.remove("hidden");
    renderStep();
  }

  function renderStep() {
    if (!activeRecipe) return;
    const title = cookScreen?.querySelector("h1");
    const stepInd = cookScreen?.querySelector("span:nth-child(2)");
    const pBar = cookScreen?.querySelector(".w-full.bg-neutral-800 > div");

    if (title) title.textContent = activeRecipe.steps[currentStep];
    if (stepInd) stepInd.textContent = `Step ${currentStep + 1} of ${activeRecipe.steps.length}`;
    if (pBar) pBar.style.width = `${((currentStep + 1) / activeRecipe.steps.length) * 100}%`;
  }

  cookScreen?.querySelector(".flex.justify-between.items-center button")?.addEventListener("click", () => {
    showDashboard(localStorage.getItem("cravecraftCurrentUser") || "Chef");
  });

  cookScreen?.querySelector(".flex.gap-3.pt-4 button:nth-child(2)")?.addEventListener("click", () => {
    if (!activeRecipe) return;
    if (currentStep < activeRecipe.steps.length - 1) {
      currentStep++;
      renderStep();
    } else {
      hideAllScreens();
      reviewScreen?.classList.remove("hidden");
    }
  });

  function finishCooking() {
    const user = localStorage.getItem("cravecraftCurrentUser") || "Chef";
    const userData = getAppData(user);

    if (activeRecipe) {
      const exists = userData.cookedGallery.some(d => d.name === activeRecipe.name);
      if (!exists) {
        userData.cookedGallery.push({
          name: activeRecipe.name,
          image: activeRecipe.image,
          date: new Date().toLocaleDateString()
        });
        userData.cookedCount++;
        userData.points += 150;
        saveAppData(user, userData);
        syncLeaderboard(user);
      }
    }
    showDashboard(user);
  }

  reviewScreen?.querySelector("button:nth-child(1)")?.addEventListener("click", finishCooking);
  reviewScreen?.querySelector("button:nth-last-child(1)")?.addEventListener("click", finishCooking);

  function syncLeaderboard(user) {
    if (!user) return;
    const userData = getAppData(user);
    const server = getServerData();

    let entry = server.leaderboard.find(c => c.name === user);
    if (entry) {
      entry.points = userData.points;
      entry.dishes = userData.cookedCount;
    } else {
      server.leaderboard.push({ name: user, points: userData.points, dishes: userData.cookedCount });
    }
    server.leaderboard.sort((a, b) => b.points - a.points);
    saveServerData(server);
  }

  // Initial Check
  const savedUser = localStorage.getItem("cravecraftCurrentUser");
  if (savedUser) {
    showDashboard(savedUser);
  } else {
    showAuth();
  }
  setAuthMode("signup");
});
