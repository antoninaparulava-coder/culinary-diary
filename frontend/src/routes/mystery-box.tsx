import { createFileRoute } from "@tanstack/react-router";
import { Gift, Sparkles, Clock, ChefHat, RefreshCw, Tag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export const Route = createFileRoute("/mystery-box")({
  component: MysteryBoxPage,
  head: () => ({
    meta: [
      { title: "Mystery Box — Culinary Diary" },
      {
        name: "description",
        content:
          "Spin the Mystery Box and reveal a surprise recipe based on what's in your pantry.",
      },
    ],
  }),
});

interface Recipe {
  _id?: string;
  title: string;
  description?: string;
  prepTime?: string;
  time?: string;
  difficulty?: string;
  category?: string;
  tags?: string[];
  emoji: string;
  uses?: string[];
  ingredients?: string[];
}

interface PantryItem {
  _id?: string;
  name: string;
}

function pickRandomMatch(recipes: Recipe[], pantryNames: string[]): Recipe | null {
  if (recipes.length === 0) return null;
  const set = pantryNames.map((n) => n.toLowerCase());

  const scored = recipes
    .map((r) => {
      const usesList = r.uses || r.ingredients || [];
      const matches = usesList.filter((u) =>
        set.some((pantryItem) => u.toLowerCase().includes(pantryItem) || pantryItem.includes(u.toLowerCase()))
      ).length;
      return { r, matches };
    })
    .filter((x) => x.matches > 0);

  const pool = scored.length > 0 ? scored.map((s) => s.r) : recipes;
  return pool[Math.floor(Math.random() * pool.length)];
}

function MysteryBoxPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [spinning, setSpinning] = useState(false);
  const [reel, setReel] = useState<string>("🎁");
  const [revealed, setRevealed] = useState<Recipe | null>(null);
  const intervalRef = useRef<number | null>(null);

  const reelEmojis = ["🍅", "🧀", "🌿", "🍓", "🍞", "🧄", "🥬", "🥚", "🫒", "🍋", "🍝", "🥗", "🍲", "🥞"];

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRecipes, resPantry] = await Promise.all([
          fetch("http://localhost:5000/api/recipes"),
          fetch("http://localhost:5000/api/pantry"),
        ]);

        const dataRecipes = await resRecipes.json();
        const dataPantry = await resPantry.json();

        if (Array.isArray(dataRecipes)) setRecipes(dataRecipes);
        if (Array.isArray(dataPantry)) setPantryItems(dataPantry);
      } catch (err) {
        console.error("Error fetching data for mystery box:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pantryNames = useMemo(() => pantryItems.map((p) => p.name), [pantryItems]);

  // Compute matched pantry ingredients for the revealed recipe
  const matchedPantryIngredients = useMemo(() => {
    if (!revealed) return [];
    const recipeIngs = revealed.uses || revealed.ingredients || [];
    const lowerPantryNames = pantryNames.map((p) => p.toLowerCase());

    return recipeIngs.filter((ing) => {
      const lowerIng = ing.toLowerCase();
      return lowerPantryNames.some(
        (pName) => lowerIng.includes(pName) || pName.includes(lowerIng)
      );
    });
  }, [revealed, pantryNames]);

  const startSpin = () => {
    if (spinning || recipes.length === 0) return;
    setRevealed(null);
    setSpinning(true);
    let i = 0;

    intervalRef.current = window.setInterval(() => {
      setReel(reelEmojis[i % reelEmojis.length]);
      i++;
    }, 70);

    window.setTimeout(() => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const selected = pickRandomMatch(recipes, pantryNames);
      if (selected) {
        setReel(selected.emoji || "🍲");
        setRevealed(selected);
      }
      setSpinning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-sage">
                Today's Surprise
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl">
                Mystery Box Roulette
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Spin the box and let it decide tonight's dinner.
              </p>
            </div>
          </header>

          <section className="mt-10 flex flex-col items-center">
            {/* Mystery Box Container */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-sage-soft via-beige to-[color:var(--tag-berry)]/40 blur-2xl opacity-70" />
              <div className="relative h-72 w-72 sm:h-80 sm:w-80 rounded-[2rem] bg-gradient-to-br from-card to-beige border border-border shadow-xl overflow-hidden">
                {/* Ribbon */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-sage/90" />
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-10 bg-sage/90" />
                {/* Bow */}
                <div className="absolute left-1/2 top-2 -translate-x-1/2 grid h-12 w-20 place-items-center">
                  <div className="h-6 w-6 rounded-full bg-sage" />
                  <div className="absolute left-0 top-1 h-10 w-8 rounded-[60%] bg-sage/80 -rotate-12" />
                  <div className="absolute right-0 top-1 h-10 w-8 rounded-[60%] bg-sage/80 rotate-12" />
                </div>

                {/* Reel window */}
                <div className="absolute inset-0 grid place-items-center">
                  <div className="relative grid h-32 w-32 sm:h-36 sm:w-36 place-items-center rounded-2xl bg-background/95 border border-border shadow-inner overflow-hidden">
                    <div
                      key={reel + (spinning ? "-s" : "-r")}
                      className={`text-6xl sm:text-7xl ${
                        spinning ? "animate-spin-reel" : "animate-scale-in"
                      }`}
                    >
                      {reel}
                    </div>
                    {spinning && (
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/60" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Spin Button */}
            <div className="mt-8 flex flex-col items-center gap-2">
              <button
                disabled={spinning || loading}
                onClick={startSpin}
                className="inline-flex items-center gap-2 rounded-2xl bg-sage px-6 py-3 font-medium text-sage-foreground shadow-md hover:bg-sage/90 disabled:opacity-50 transition"
              >
                {spinning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Selecting...
                  </>
                ) : revealed ? (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Spin Again
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4" />
                    Open Mystery Box
                  </>
                )}
              </button>
            </div>

            {/* Revealed Recipe Result Card */}
            {revealed && (
              <div className="mt-8 w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-lg animate-scale-in">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-sage/20 px-3 py-1 text-xs font-semibold text-sage">
                    <Sparkles className="h-3.5 w-3.5" /> TONIGHT'S PICK
                  </span>
                  <span className="text-3xl">{revealed.emoji}</span>
                </div>

                <h3 className="mt-3 font-display text-2xl">{revealed.title}</h3>
                {revealed.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {revealed.description}
                  </p>
                )}

                {/* Prep Time, Difficulty & Tags */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {(revealed.prepTime || revealed.time) && (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-beige px-2.5 py-1 font-medium text-foreground">
                      <Clock className="h-3.5 w-3.5 text-sage" />
                      {revealed.prepTime || revealed.time}
                    </span>
                  )}

                  {revealed.difficulty && (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-beige px-2.5 py-1 font-medium text-foreground">
                      <ChefHat className="h-3.5 w-3.5 text-sage" />
                      {revealed.difficulty}
                    </span>
                  )}

                  {revealed.category && (
                    <span className="rounded-xl bg-beige px-2.5 py-1 font-medium text-foreground">
                      {revealed.category}
                    </span>
                  )}

                  {revealed.tags && revealed.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-xl bg-sage/10 px-2.5 py-1 font-medium text-sage"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Matched Pantry Ingredients */}
                <div className="mt-6 border-t border-border pt-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    From Your Pantry
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedPantryIngredients.length > 0 ? (
                      matchedPantryIngredients.map((ing, idx) => (
                        <span key={idx} className="rounded-lg bg-beige/80 px-2.5 py-1 text-xs font-medium text-foreground">
                          {ing}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        No exact ingredient matches found in pantry.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}