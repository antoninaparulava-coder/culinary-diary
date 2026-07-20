import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Clock, Flame, ChefHat } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { initialIngredients } from "@/lib/pantry";

// ვქმნით ინტერფეისს ჩვენი ბექენდის მონაცემებისთვის
interface BackendRecipe {
  _id: string;
  title: string;
  emoji: string;
  blurb: string;
  tags: string[];
  ingredients: string[];
  instructions: string;
  prepTime: number;
  calories?: number;
  difficulty?: "Easy" | "Medium" | "Hard";
}

export const Route = createFileRoute("/recipes")({
  component: RecipesPage,
  head: () => ({
    meta: [
      { title: "Recipe Search — Culinary Diary" },
      { name: "description", content: "Discover recipes that match your pantry." },
    ],
  }),
});

type FilterKey = "time" | "calories" | "difficulty";

// ლოგიკა, რომელიც ითვლის თუ რამდენი პროცენტით ემთხვევა მაცივრის ინგრედიენტები რეცეპტს
function matchScore(recipeIngredients: string[], pantry: Set<string>) {
  if (recipeIngredients.length === 0) return 0;
  const matched = recipeIngredients.filter((ing) => pantry.has(ing)).length;
  return Math.round((matched / recipeIngredients.length) * 100);
}

function RecipesPage() {
  const [dbRecipes, setDbRecipes] = useState<BackendRecipe[]>([]);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);
  const [loading, setLoading] = useState(true);

  const pantrySet = useMemo(
    () => new Set(initialIngredients.map((i) => i.name)),
    [],
  );

  // ბექენდიდან რეცეპტების წამოღება გვერდის ჩატვირთვისას
  useEffect(() => {
    fetch("http://localhost:5000/api/recipes")
      .then((res) => res.json())
      .then((data) => {
        setDbRecipes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching recipes:", err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    const list = dbRecipes.map((r) => ({
      recipe: r,
      score: matchScore(r.ingredients, pantrySet)
    }));

    // ფილტრაცია ძებნის მიხედვით
    const filteredList = list.filter(({ recipe }) =>
      q ? recipe.title.toLowerCase().includes(q) : true
    );

    // სორტირება ფილტრების მიხედვით
    // სორტირება ფილტრების მიხედვით
    if (activeFilter === "time") {
      filteredList.sort((a, b) => a.recipe.prepTime - b.recipe.prepTime);
    } else if (activeFilter === "calories") {
      filteredList.sort((a, b) => (a.recipe.calories || 0) - (b.recipe.calories || 0));
    } else if (activeFilter === "difficulty") {
      const order = { Easy: 0, Medium: 1, Hard: 2 };
      filteredList.sort(
        (a, b) => (order[a.recipe.difficulty || "Easy"]) - (order[b.recipe.difficulty || "Easy"])
      );
    } else {
      filteredList.sort((a, b) => b.score - a.score);
    }

    return filteredList;
  }, [query, activeFilter, dbRecipes, pantrySet]);

  const filters: { key: FilterKey; label: string; icon: typeof Clock }[] = [
    { key: "time", label: "Cooking Time", icon: Clock },
    { key: "calories", label: "Calories", icon: Flame },
    { key: "difficulty", label: "Difficulty", icon: ChefHat },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <Sidebar pantryCount={initialIngredients.length} />

        <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
          <header>
            <p className="text-xs uppercase tracking-widest text-sage">
              Recipe Search
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl">
              Find your next favorite dish
            </h2>
          </header>

          {/* Search + filters */}
          <section className="mt-6 rounded-3xl bg-card border border-border p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/20 transition">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search recipes…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                onClick={() => setActiveFilter(null)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {filters.map((f) => {
                const Icon = f.icon;
                const active = activeFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(active ? null : f.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-sage text-sage-foreground"
                        : "bg-beige text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {f.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Recipe grid */}
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <p className="col-span-full text-center text-sm text-muted-foreground">Loading recipes from database...</p>
            ) : (
              filtered.map(({ recipe, score }) => (
                <article
                  key={recipe._id}
                  className="group flex flex-col rounded-3xl border border-border bg-card p-5 hover:border-sage/50 hover:shadow-lg hover:shadow-sage/5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-3xl">{recipe.emoji}</span> {/* დროებითი ემოჯი ბაზის რეცეპტებისთვის */}
                    <span className="inline-flex items-center gap-1 rounded-full bg-beige px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {recipe.prepTime} min
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-lg leading-tight">
                    {recipe.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                    {recipe.blurb || recipe.instructions}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {recipe.tags?.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-sage-soft px-2.5 py-0.5 text-[11px] font-medium text-[oklch(0.35_0.06_145)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 border-t border-border pt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Match Score</span>
                      <span className="font-medium text-foreground">{score}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-beige">
                      <div
                        className="h-full rounded-full bg-sage transition-all"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </article>
              ))
            )}

            {!loading && filtered.length === 0 && (
              <p className="col-span-full rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
                No recipes match your search.
              </p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}