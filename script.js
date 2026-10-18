console.log("CraveCraft JavaScript is running!");
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

const ingredientInput = document.getElementById("ingredients");
const cravingInput = document.getElementById("craving");
const maxTimeInput = document.getElementById("maxTime");
const findButton = document.getElementById("findRecipes");
const results = document.getElementById("recipeResults");
const message = document.getElementById("recipeMessage");

function normalizeIngredient(ingredient) {
  const value = ingredient.trim().toLowerCase();

  const aliases = {
    eggs: "egg",
    tomatoes: "tomato",
    onions: "onion",
    potatoes: "potato",
    chickpeas: "chickpea",
    tortillas: "tortilla",
    mushrooms: "mushroom",
    carrots: "carrot",
    peas: "pea",
    beans: "bean",
    "chicken breast": "chicken",
    "bell pepper": "pepper",
    "bell peppers": "pepper"
  };

  return aliases[value] || value;
}

function getUserIngredients() {
  return ingredientInput.value
    .split(",")
    .map(normalizeIngredient)
    .filter(Boolean);
}

function findMatchingRecipes() {
  const userIngredients = getUserIngredients();
  const craving = cravingInput.value;
  const maxTime = Number(maxTimeInput.value);

  if (userIngredients.length === 0) {
    message.textContent =
      "Enter at least one ingredient to find meals.";
    results.replaceChildren();
    return;
  }

  const matches = recipes
    .map(recipe => {
      const matchedIngredients = recipe.ingredients.filter(
        ingredient => userIngredients.includes(ingredient)
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
    .filter(recipe =>
      craving === "any" || recipe.tags.includes(craving)
    )
    .sort((a, b) =>
      b.matchPercentage - a.matchPercentage ||
      a.time - b.time
    );

  results.replaceChildren();

  if (matches.length === 0) {
    message.textContent =
      "No matches found. Try different ingredients or a longer cooking time.";
    return;
  }

  const topMatches = matches.slice(0, 4);

  message.textContent =
    `Found ${topMatches.length} suggestion(s). ` +
    "These are starter recipes matched against your ingredients.";

  topMatches.forEach(recipe => {
    const card = document.createElement("article");
    card.className =
      "rounded-xl border border-neutral-800 bg-[#24211e] p-5 space-y-3";
    const image = document.createElement("img");
    image.src = recipe.image;
    image.alt = recipe.name;
    image.className = "w-full h-48 object-cover rounded-lg";
    image.loading = "lazy";
    const title = document.createElement("h3");
    title.className = "text-xl text-white";
    title.textContent = recipe.name;

    const description = document.createElement("p");
    description.className = "text-sm text-neutral-400";
    description.textContent = recipe.description;

    const meta = document.createElement("p");
    meta.className = "text-xs text-neutral-400";
    meta.textContent =
      `${recipe.time} minutes · ${recipe.matchPercentage}% ingredient overlap`;

    const used = document.createElement("p");
    used.className = "text-xs text-neutral-300";
    used.textContent =
      "You have: " + recipe.matchedIngredients.join(", ");

    const missing = recipe.ingredients.filter(
      item => !recipe.matchedIngredients.includes(item)
    );

    const missingText = document.createElement("p");
    missingText.className = "text-xs text-neutral-400";
    missingText.textContent = missing.length
      ? "Still needed: " + missing.join(", ")
      : "You have all listed ingredients!";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className =
      "rounded-lg bg-[#ebe3d5] px-4 py-2 text-sm text-[#1a1816]";
    toggle.textContent = "View cooking steps";

    const instructions = document.createElement("ol");
    instructions.className =
      "hidden list-decimal space-y-2 pl-5 text-sm text-neutral-300";

    recipe.steps.forEach(step => {
      const item = document.createElement("li");
      item.textContent = step;
      instructions.appendChild(item);
    });

    toggle.addEventListener("click", () => {
      const opening = instructions.classList.contains("hidden");
      instructions.classList.toggle("hidden");
      toggle.textContent = opening
        ? "Hide cooking steps"
        : "View cooking steps";
    });

    card.append(
      image,
      title,
      description,
      meta,
      used,
      missingText,
      toggle,
      instructions
    );

    results.appendChild(card);
  });
}

findButton.addEventListener("click", findMatchingRecipes);


const signupForm = document.getElementById("signupForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const authScreen = document.getElementById("screen-auth");
const dashboardScreen = document.getElementById("screen-dashboard");
const dashboardGreeting = document.getElementById("dashboardGreeting");

const signInTab = document.getElementById("signInTab");
const createAccountTab = document.getElementById("createAccountTab");
const authSubmitButton = document.getElementById("authSubmitButton");
const authMessage = document.getElementById("authMessage");

const homeLink = document.getElementById("homeLink");
const signOutButton = document.getElementById("signOutButton");

let authMode = "signup";

function showDashboard(username) {
  dashboardGreeting.textContent = `Hello, ${username}`;
  authScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showAuth() {
  dashboardScreen.classList.add("hidden");
  authScreen.classList.remove("hidden");
  authMessage.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setAuthMode(mode) {
  authMode = mode;
  authMessage.textContent = "";

  const isSignup = mode === "signup";

  authSubmitButton.textContent = isSignup
    ? "Create account"
    : "Sign in";

  createAccountTab.className = isSignup
    ? "text-white border-b-2 border-white pb-2 font-medium"
    : "text-neutral-500 hover:text-white pb-2";

  signInTab.className = isSignup
    ? "text-neutral-500 hover:text-white pb-2"
    : "text-white border-b-2 border-white pb-2 font-medium";
}

createAccountTab.addEventListener("click", () => {
  setAuthMode("signup");
});

signInTab.addEventListener("click", () => {
  setAuthMode("signin");
});

signupForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    authMessage.textContent = "Please enter your username and password.";
    return;
  }

  // Demo accounts are stored in this browser only.
  const accounts = JSON.parse(
    localStorage.getItem("cravecraftAccounts") || "{}"
  );

  const accountKey = username.toLowerCase();

  if (authMode === "signup") {
    if (accounts[accountKey]) {
      authMessage.textContent =
        "That username already exists. Please sign in instead.";
      return;
    }

    accounts[accountKey] = {
      username: username,
      password: password
    };

    localStorage.setItem(
      "cravecraftAccounts",
      JSON.stringify(accounts)
    );
  } else {
    const account = accounts[accountKey];

    if (!account || account.password !== password) {
      authMessage.textContent =
        "Incorrect username or password. Please try again.";
      return;
    }
  }

  localStorage.setItem("cravecraftCurrentUser", username);
  showDashboard(username);
});

homeLink.addEventListener("click", function (event) {
  event.preventDefault();

  const username = localStorage.getItem("cravecraftCurrentUser");

  if (username) {
    showDashboard(username);
  } else {
    showAuth();
  }
});

signOutButton.addEventListener("click", function () {
  localStorage.removeItem("cravecraftCurrentUser");
  signupForm.reset();
  setAuthMode("signin");
  showAuth();
});

// Restore the dashboard if the user refreshes while signed in.
const savedUsername = localStorage.getItem("cravecraftCurrentUser");

if (savedUsername) {
  showDashboard(savedUsername);
} else {
  showAuth();
}

setAuthMode("signup");
const chatToggle = document.getElementById("cc-ai-toggle");
const chatPanel = document.getElementById("cc-ai-panel");
const chatClose = document.getElementById("cc-ai-close");
const chatForm = document.getElementById("cc-ai-form");
const chatInput = document.getElementById("cc-ai-input");
const chatMessages = document.getElementById("cc-ai-messages");
const chatSend = document.getElementById("cc-ai-send");

chatToggle.addEventListener("click", () => {
  chatPanel.hidden = false;
  chatToggle.hidden = true;
  chatInput.focus();
});

chatClose.addEventListener("click", () => {
  chatPanel.hidden = true;
  chatToggle.hidden = false;
});

function addChatMessage(text, className) {
  const message = document.createElement("p");
  message.className = `cc-ai-message ${className}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = chatInput.value.trim();
  if (!question) return;

  addChatMessage(question, "cc-ai-user");
  chatInput.value = "";
  chatSend.disabled = true;

  const thinkingMessage = addChatMessage("Thinking…", "cc-ai-assistant");

  try {
    const response = await fetch("http://127.0.0.1:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "The server could not answer.");
    }

    thinkingMessage.textContent = data.answer;
  } catch (error) {
    thinkingMessage.textContent =
      "I couldn't reach the AI server. Check that the server is running.";
    console.error(error);
  } finally {
    chatSend.disabled = false;
    chatInput.focus();
  }
});

