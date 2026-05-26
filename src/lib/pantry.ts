export type Ingredient = {
  name: string;
  emoji: string;
  tone: "tomato" | "cheese" | "herb" | "berry" | "bread";
};

export const initialIngredients: Ingredient[] = [
  { name: "Tomato", emoji: "🍅", tone: "tomato" },
  { name: "Parmesan", emoji: "🧀", tone: "cheese" },
  { name: "Basil", emoji: "🌿", tone: "herb" },
  { name: "Strawberry", emoji: "🍓", tone: "berry" },
  { name: "Sourdough", emoji: "🍞", tone: "bread" },
  { name: "Garlic", emoji: "🧄", tone: "bread" },
  { name: "Spinach", emoji: "🥬", tone: "herb" },
  { name: "Egg", emoji: "🥚", tone: "cheese" },
  { name: "Olive Oil", emoji: "🫒", tone: "herb" },
  { name: "Lemon", emoji: "🍋", tone: "cheese" },
];

export const toneClass: Record<Ingredient["tone"], string> = {
  tomato: "bg-[color:var(--tag-tomato)]/60 text-[oklch(0.35_0.08_30)]",
  cheese: "bg-[color:var(--tag-cheese)]/60 text-[oklch(0.4_0.08_85)]",
  herb: "bg-[color:var(--tag-herb)]/60 text-[oklch(0.35_0.08_145)]",
  berry: "bg-[color:var(--tag-berry)]/60 text-[oklch(0.38_0.08_0)]",
  bread: "bg-[color:var(--tag-bread)]/60 text-[oklch(0.38_0.06_70)]",
};

export type Recipe = {
  title: string;
  time: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  uses: string[]; // ingredient names this recipe leverages
  emoji: string;
  blurb: string;
};

export const recipes: Recipe[] = [
  {
    title: "Tomato Basil Bruschetta",
    time: "15 min",
    difficulty: "Easy",
    tags: ["Vegetarian", "Snack"],
    uses: ["Tomato", "Basil", "Sourdough", "Olive Oil", "Garlic"],
    emoji: "🍅",
    blurb: "Charred sourdough rubbed with garlic, piled with ripe tomatoes and torn basil.",
  },
  {
    title: "Lemon Garlic Spinach Pasta",
    time: "25 min",
    difficulty: "Easy",
    tags: ["Vegetarian", "Dinner"],
    uses: ["Lemon", "Garlic", "Spinach", "Parmesan", "Olive Oil"],
    emoji: "🍝",
    blurb: "Silky pasta tossed with wilted spinach, lemon zest and a snow of parmesan.",
  },
  {
    title: "Strawberry Basil Toast",
    time: "10 min",
    difficulty: "Easy",
    tags: ["Breakfast", "Sweet"],
    uses: ["Strawberry", "Basil", "Sourdough"],
    emoji: "🍓",
    blurb: "Buttery toast crowned with sliced strawberries and a whisper of basil.",
  },
  {
    title: "Cheesy Garlic Egg Flatbread",
    time: "20 min",
    difficulty: "Medium",
    tags: ["Brunch"],
    uses: ["Egg", "Garlic", "Parmesan", "Sourdough", "Olive Oil"],
    emoji: "🥚",
    blurb: "Crisp flatbread, a sunny egg, and a generous flurry of nutty parmesan.",
  },
  {
    title: "Sage Green Garden Salad",
    time: "12 min",
    difficulty: "Easy",
    tags: ["Salad", "Light"],
    uses: ["Spinach", "Lemon", "Olive Oil", "Parmesan"],
    emoji: "🥗",
    blurb: "Baby spinach, shaved parmesan, lemony olive oil. Quiet, fresh, restorative.",
  },
  {
    title: "Rustic Tomato Garlic Soup",
    time: "35 min",
    difficulty: "Medium",
    tags: ["Soup", "Comfort"],
    uses: ["Tomato", "Garlic", "Olive Oil", "Sourdough"],
    emoji: "🍲",
    blurb: "Slow-roasted tomatoes blended with garlic, served with toasted sourdough.",
  },
];
