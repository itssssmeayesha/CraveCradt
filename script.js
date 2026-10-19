document.addEventListener("DOMContentLoaded", () => {
  console.log("CraveCraft Stable JS Initialized!");

  // ----------------------------------------------------
  // 1. STORAGE & STATE MANAGEMENT
  // ----------------------------------------------------
  function getAppData(username) {
    const allData = JSON.parse(localStorage.getItem("cravecraftAllUsersData") || "{}");
    if (!allData[username]) {
      allData[username] = {
        pantryItems: ["chicken", "rice", "eggs", "tomatoes", "onion"],
        cookedGallery: [],
        selectedAllergies: [],
        customAllergies: [],
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
  // 2. RECIPE DATABASE
  // ----------------------------------------------------
  const recipes = [
    {
      name: "Chicken Quesadillas",
      image: "images/Chicken Quesadillas.jfif",
      ingredients: ["chicken", "tortilla", "cheese", "onion"],
      time: 20,
      tags: ["comfort", "quick"],
      description: "Crispy tortillas loaded with seasoned chicken, sautéed onions, and melted cheese.",
      steps: [
        "Slice chicken breast into small thin strips and season with salt, pepper, and paprika.",
        "Heat 1 tbsp oil in a skillet over medium heat; cook chicken for 6-8 minutes until golden.",
        "Dice onions finely and sauté in the same pan until translucent (approx. 3-4 minutes).",
        "Place tortilla on pan, sprinkle cheese, cooked chicken, and onions over half, then fold over.",
        "Toast each side for 2-3 minutes until tortilla is crispy golden and cheese is melted. Slice and serve!"
      ]
    },
    {
      name: "Egg Fried Rice",
      image: "images/egg fried rice.jfif",
      ingredients: ["rice", "eggs", "onion", "carrot", "peas", "soy sauce"],
      time: 15,
      tags: ["comfort", "quick"],
      description: "A classic fast meal making perfect use of leftover rice and veggies.",
      steps: [
        "Finely chop the onions and carrots. Ensure leftover cold cooked rice is broken up.",
        "Whisk 2 eggs in a small bowl with a pinch of salt.",
        "Heat oil in a wok or large pan; pour in eggs and scramble quickly for 1 minute, then set aside.",
        "Add veggies to wok; stir-fry on high heat for 3 minutes until tender.",
        "Add rice, scrambled eggs, and 2 tbsp soy sauce. Stir-fry vigorously on high heat for 3 minutes. Serve hot!"
      ]
    },
    {
      name: "Spicy Chicken Rice",
      image: "images/spicy chicken rice.jfif",
      ingredients: ["chicken", "rice", "onion", "tomato", "chilli"],
      time: 30,
      tags: ["spicy", "comfort"],
      description: "A rich, spicy rice skillet dish cooked with chicken and diced tomato salsa.",
      steps: [
        "Dice chicken into 1-inch cubes and coat with chilli powder and salt.",
        "Sear chicken in a deep pan until golden on all sides, then remove.",
        "Sauté diced onions and fresh chopped chilli in the remaining pan juices for 3 minutes.",
        "Stir in chopped tomatoes and cooked rice, mixing thoroughly to absorb all flavor.",
        "Return chicken to pan, cover, and let simmer together on low heat for 5 minutes. Serve hot!"
      ]
    },
    {
      name: "Tomato Egg Toast",
      image: "images/tomato egg toast.jfif",
      ingredients: ["eggs", "tomato", "bread", "cheese"],
      time: 10,
      tags: ["quick", "comfort"],
      description: "Creamy scrambled eggs with warm tomatoes on crispy toasted bread.",
      steps: [
        "Chop tomato into small cubes and whisk eggs thoroughly in a bowl.",
        "Toast bread slices until firm and golden brown.",
        "Sauté tomato cubes gently in butter for 2 minutes until soft.",
        "Pour in eggs over low heat and gently fold to create soft creamy curds.",
        "Spoon over toast, top with melted cheese, and enjoy immediately!"
      ]
    }
  ];

  // ----------------------------------------------------
  // 3. UI SCREEN MANAGEMENT
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
    renderAllergiesUI();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ----------------------------------------------------
  // 4. AUTH & FULLY WORKING CLICKABLE ALLERGIES
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
    if (authSubmitButton) authSubmitButton.textContent = mode === "signup" ? "Create account" : "Sign in";

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
        if (authMessage) authMessage.textContent = "Account exists. Click 'Sign in' above!";
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

  // CLICKABLE ALLERGY BUTTONS + EDITABLE CUSTOM ALLERGIES
  function renderAllergiesUI() {
    const allergyContainer = document.querySelector("#screen-auth .space-y-2.pt-2");
    if (!allergyContainer) return;

    let customArea = document.getElementById("customAllergiesWrapper");
    if (!customArea) {
      customArea = document.createElement("div");
      customArea.id = "customAllergiesWrapper";
      customArea.className = "pt-2 space-y-2";
      allergyContainer.appendChild(customArea);
    }

    const currentUser = localStorage.getItem("cravecraftCurrentUser") || "guest";
    const userData = getAppData(currentUser);

    customArea.innerHTML = `
      <div class="flex gap-2">
        <input type="text" id="addCustomAllergyInput" placeholder="Add custom allergy (e.g., Soy, Shellfish)..." class="bg-[#24211e] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none flex-1">
        <button type="button" id="addCustomAllergyBtn" class="bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded-lg text-xs hover:bg-neutral-700 cursor-pointer">Add Option</button>
      </div>
      <div class="flex flex-wrap gap-2" id="customAllergyChips">
        ${userData.customAllergies.map((alg, idx) => `
          <span class="bg-[#1a1816] border border-neutral-700 text-neutral-200 px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
            ${alg}
            <button type="button" data-idx="${idx}" class="removeCustomAlgBtn hover:text-red-400 cursor-pointer">&times;</button>
          </span>
        `).join("")}
      </div>
    `;

    // Click handler for preset allergy buttons
    document.querySelectorAll("#screen-auth .flex.flex-wrap.gap-2 button").forEach(btn => {
      btn.setAttribute("type", "button");
      const text = btn.textContent.trim();

      // Highlight if already selected
      if (userData.selectedAllergies.includes(text)) {
        btn.className = "px-4 py-1.5 rounded-full border border-neutral-500 bg-[#ebe3d5] text-[#1a1816] text-xs font-medium cursor-pointer";
      } else {
        btn.className = "px-4 py-1.5 rounded-full border border-neutral-700 bg-[#24211e] text-xs text-white hover:border-neutral-500 cursor-pointer";
      }

      btn.onclick = (e) => {
        e.preventDefault();
        if (userData.selectedAllergies.includes(text)) {
          userData.selectedAllergies = userData.selectedAllergies.filter(a => a !== text);
        } else {
          userData.selectedAllergies.push(text);
        }
        saveAppData(currentUser, userData);
        renderAllergiesUI();
      };
    });

    document.getElementById("addCustomAllergyBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      const val = document.getElementById("addCustomAllergyInput")?.value.trim();
      if (val && !userData.customAllergies.includes(val)) {
        userData.customAllergies.push(val);
        saveAppData(currentUser, userData);
        renderAllergiesUI();
      }
    });

    document.querySelectorAll(".removeCustomAlgBtn").forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const idx = Number(btn.getAttribute("data-idx"));
        userData.customAllergies.splice(idx, 1);
        saveAppData(currentUser, userData);
        renderAllergiesUI();
      };
    });
  }

  // Navigation Bar Links
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

  document.getElementById("signOutButton")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("cravecraftCurrentUser");
    signupForm?.reset();
    setAuthMode("signin");
    showAuth();
  });

  // ----------------------------------------------------
  // 5. RECIPE FINDER (STRICT MATCHING ON TYPING + PANTRY)
  // ----------------------------------------------------
  function findMatchingRecipes() {
    const ingInput = document.getElementById("ingredients");
    const cravingInput = document.getElementById("craving");
    const maxTimeInput = document.getElementById("maxTime");
    const results = document.getElementById("recipeResults");
    const message = document.getElementById("recipeMessage");

    if (!results) return;

    const currentUser = localStorage.getItem("cravecraftCurrentUser");
    const userData = currentUser ? getAppData(currentUser) : { pantryItems: [] };

    const typedText = ingInput ? ingInput.value : "";
    const typed = typedText.toLowerCase().split(",").map(i => i.trim()).filter(Boolean);
    const available = Array.from(new Set([...typed, ...userData.pantryItems.map(i => i.toLowerCase().trim())]));

    if (available.length === 0) {
      if (message) message.textContent = "Please type ingredients or add items to your pantry stock.";
      results.replaceChildren();
      return;
    }

    const maxTime = Number(maxTimeInput?.value || 60);
    const craving = cravingInput?.value || "any";

    const matches = recipes
      .map(r => {
        const matched = r.ingredients.filter(ing => available.some(a => a.includes(ing) || ing.includes(a)));
        const missing = r.ingredients.filter(ing => !matched.includes(ing));
        return {
          ...r,
          matched,
          missing,
          matchCount: matched.length,
          matchPct: Math.round((matched.length / r.ingredients.length) * 100)
        };
      })
      .filter(r => r.matchCount > 0 && r.time <= maxTime)
      .filter(r => craving === "any" || r.tags.includes(craving))
      .sort((a, b) => b.matchPct - a.matchPct || a.time - b.time);

    results.replaceChildren();

    if (matches.length === 0) {
      if (message) message.textContent = "No recipes matched your exact ingredients and time. Try adding more ingredients!";
      return;
    }

    if (message) message.textContent = `Found ${matches.length} matching recipe(s) based on your kitchen inventory!`;

    matches.forEach(recipe => {
      const card = document.createElement("article");
      card.className = "rounded-xl border border-neutral-800 bg-[#24211e] p-5 space-y-3 flex flex-col justify-between";

      card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}" class="w-full h-44 object-cover rounded-lg">
        <h3 class="text-xl text-white serif-heading font-medium">${recipe.name}</h3>
        <p class="text-xs text-neutral-400">${recipe.description}</p>
        <p class="text-xs text-neutral-400">${recipe.time} mins prep · ${recipe.matchPct}% match</p>
        <p class="text-xs text-neutral-300 font-medium">You have: ${recipe.matched.join(", ") || "None"}</p>
        <p class="text-xs text-neutral-500">Not available / Needed: ${recipe.missing.join(', ') || "None (All available!)"}</p>
        <button type="button" class="startCookBtn rounded-lg bg-[#ebe3d5] px-4 py-2.5 text-xs text-[#1a1816] font-medium hover:bg-white w-full cursor-pointer transition">Start Cooking Session</button>
      `;

      card.querySelector(".startCookBtn")?.addEventListener("click", () => startCooking(recipe));
      results.appendChild(card);
    });
  }

  const findBtn = document.getElementById("findRecipes");
  if (findBtn) {
    findBtn.onclick = (e) => {
      e.preventDefault();
      findMatchingRecipes();
    };
  }

  // ----------------------------------------------------
  // 6. GUIDED COOKING
  // ----------------------------------------------------
  let activeRecipe = null;
  let currentStep = 0;

  function startCooking(recipe) {
    activeRecipe = recipe;
    currentStep = 0;
    hideAllScreens();
    cookScreen?.classList.remove("hidden");
    renderStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderStep() {
    if (!activeRecipe) return;

    const title = cookScreen?.querySelector("h1");
    const stepInd = cookScreen?.querySelector("span:nth-child(2)");
    const pBar = cookScreen?.querySelector(".w-full.bg-neutral-800 > div");
    const usesTag = cookScreen?.querySelector(".space-y-2 span:nth-child(2)");

    if (title) title.textContent = activeRecipe.steps[currentStep];
    if (stepInd) stepInd.textContent = `Step ${currentStep + 1} of ${activeRecipe.steps.length}`;
    if (pBar) pBar.style.width = `${((currentStep + 1) / activeRecipe.steps.length) * 100}%`;
    if (usesTag) usesTag.textContent = activeRecipe.ingredients.join(", ");

    const doneBtn = cookScreen?.querySelector(".flex.gap-3.pt-4 button:nth-child(2)");
    if (doneBtn) {
      doneBtn.textContent = currentStep === activeRecipe.steps.length - 1 ? "Finish & Rate" : "Done";
    }
  }

  cookScreen?.querySelector(".flex.justify-between.items-center button")?.addEventListener("click", (e) => {
    e.preventDefault();
    showDashboard(localStorage.getItem("cravecraftCurrentUser") || "Chef");
  });

  cookScreen?.querySelector(".flex.gap-3.pt-4 button:nth-child(1)")?.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Need a tip or having an issue? Please ask our AI Chatbot in the bottom right corner (🍳 Ask CraveCraft)!");
  });

  cookScreen?.querySelector(".flex.gap-3.pt-4 button:nth-child(2)")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!activeRecipe) return;
    if (currentStep < activeRecipe.steps.length - 1) {
      currentStep++;
      renderStep();
    } else {
      hideAllScreens();
      reviewScreen?.classList.remove("hidden");
      setupReviewScreenHandlers();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // ----------------------------------------------------
  // 7. CLICKABLE "HOW DID IT TURN OUT?" & RATING BUTTONS
  // ----------------------------------------------------
  function setupReviewScreenHandlers() {
    if (!reviewScreen) return;

    // Numbers 1 to 5 buttons
    const ratingBtns = reviewScreen.querySelectorAll("button.w-10.h-10");
    ratingBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        ratingBtns.forEach(b => {
          b.className = "w-10 h-10 rounded-full border border-neutral-700 bg-[#24211e] text-xs hover:border-neutral-400 text-white cursor-pointer transition";
        });
        btn.className = "w-10 h-10 rounded-full bg-[#ebe3d5] text-[#1a1816] font-medium text-xs cursor-pointer transition";
      };
    });

    // "How did it turn out?" buttons ("Just right", "Too spicy", "Not spicy enough")
    const outcomeBtns = reviewScreen.querySelectorAll(".space-y-2 button");
    outcomeBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        outcomeBtns.forEach(b => {
          b.className = "px-4 py-1.5 rounded-full border border-neutral-700 bg-[#24211e] text-xs text-white cursor-pointer transition";
        });
        btn.className = "px-4 py-1.5 rounded-full border border-neutral-500 bg-[#ebe3d5] text-[#1a1816] text-xs font-medium cursor-pointer transition";
      };
    });

    // Save & Skip buttons
    const actionBtns = reviewScreen.querySelectorAll(".flex.gap-3.pt-4 button");
    actionBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        finishCooking();
      };
    });
  }

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

  // ----------------------------------------------------
  // 8. DASHBOARD CARDS & GALLERY / FORUM MODALS
  // ----------------------------------------------------
  const cards = document.querySelectorAll("#screen-dashboard .grid-cols-1.md\\:grid-cols-3 > div");
  if (cards.length >= 3) {
    cards[0].style.cursor = "pointer";
    cards[0].onclick = openPantryModal;

    cards[1].style.cursor = "pointer";
    cards[1].onclick = openGalleryModal;

    cards[2].style.cursor = "pointer";
    cards[2].onclick = openShareModal;
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
        ${userData.pantryItems.length ? userData.pantryItems.map((item, idx) => `
          <span class="bg-[#1a1816] border border-neutral-700 px-3 py-1 rounded-full text-xs text-neutral-200 flex items-center gap-2">
            ${item}
            <button data-index="${idx}" class="removePantryItem hover:text-red-400 cursor-pointer">&times;</button>
          </span>
        `).join("") : '<p class="text-xs text-neutral-500 italic">Pantry is empty.</p>'}
      </div>
      <div class="flex gap-2 pt-2">
        <input type="text" id="newPantryInput" placeholder="Add item (e.g. potatoes)" class="bg-[#1a1816] border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white flex-1 focus:outline-none">
        <button id="addPantryBtn" type="button" class="bg-[#ebe3d5] text-[#1a1816] px-4 py-2 rounded-lg text-xs font-medium cursor-pointer">Add</button>
      </div>
      <button id="closeModalBtn" type="button" class="mt-4 w-full bg-neutral-800 text-neutral-300 py-2 rounded-lg text-sm cursor-pointer hover:bg-neutral-700">Close</button>
    `);

    document.querySelectorAll(".removePantryItem").forEach(btn => {
      btn.onclick = (e) => {
        const idx = Number(btn.getAttribute("data-index"));
        userData.pantryItems.splice(idx, 1);
        saveAppData(user, userData);
        updateDashboardUI();
        openPantryModal();
      };
    });

    document.getElementById("addPantryBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
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
      <p class="text-xs text-neutral-400">Upload your cooked creations directly to the community forum or copy for social media:</p>
      <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-1 py-2">
        ${userData.cookedGallery.length ? userData.cookedGallery.map((dish, idx) => `
          <div class="bg-[#1a1816] border border-neutral-800 rounded-xl p-3 flex flex-col gap-2">
            <div class="flex gap-3 items-center">
              <img src="${dish.image}" alt="${dish.name}" class="w-14 h-14 rounded-lg object-cover">
              <div class="flex-1">
                <h4 class="text-sm font-medium text-white">${dish.name}</h4>
                <span class="text-xs text-neutral-500">Cooked on ${dish.date}</span>
              </div>
            </div>
            <div class="flex gap-2 pt-1">
              <button data-name="${dish.name}" data-img="${dish.image}" type="button" class="uploadForumBtn flex-1 bg-[#ebe3d5] text-[#1a1816] py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-white">Upload to Forum</button>
              <button data-name="${dish.name}" type="button" class="shareSocialBtn bg-neutral-800 text-neutral-200 px-3 py-1.5 rounded-lg text-xs hover:bg-neutral-700 cursor-pointer">Share Social</button>
            </div>
          </div>
        `).join("") : '<p class="text-xs text-neutral-500 italic py-4">No dishes cooked yet!</p>'}
      </div>
      <button id="closeModalBtn" type="button" class="mt-2 w-full bg-neutral-800 text-neutral-300 py-2 rounded-lg text-sm cursor-pointer hover:bg-neutral-700">Close</button>
    `);

    document.querySelectorAll(".uploadForumBtn").forEach(btn => {
      btn.onclick = (e) => {
        const name = btn.getAttribute("data-name");
        const img = btn.getAttribute("data-img");
        const server = getServerData();

        server.communityRecipes.unshift({
          recipeName: name,
          ingredients: "Crafted in Kitchen",
          image: img,
          author: user
        });

        saveServerData(server);
        updateDashboardUI();
        alert(`Uploaded "${name}" to Community Forum!`);
      };
    });

    document.querySelectorAll(".shareSocialBtn").forEach(btn => {
      btn.onclick = (e) => {
        const dish = btn.getAttribute("data-name");
        const shareText = `I just cooked ${dish} on CraveCraft! 🍳✨ #CraveCraft`;
        navigator.clipboard.writeText(shareText);
        alert(`Copied post text to clipboard:\n\n"${shareText}"`);
      };
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

    document.getElementById("submitCommRecipe")?.addEventListener("click", (e) => {
      e.preventDefault();
      const name = document.getElementById("commRecipeName")?.value.trim();
      const ing = document.getElementById("commRecipeIng")?.value.trim();

      if (name
