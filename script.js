const recipes = [
  {
    name: "Chicken Quesadillas",
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
    ingredients: ["rice", "eggs", "onion", "peas"],
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