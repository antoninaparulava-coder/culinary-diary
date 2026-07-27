import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/recipe/$id")({
  component: RecipeDetailPage,
});

interface Recipe {
  _id: string;
  title: string;
  emoji?: string;
  blurb?: string;
  ingredients: (string | { name: string; amount?: string })[];
  instructions?: string;
}

interface PantryItem {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
}

function RecipeDetailPage() {
  const { id } = Route.useParams();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [resRecipe, resPantry] = await Promise.all([
          fetch(`http://localhost:5000/api/recipes/${id}`),
          fetch(`http://localhost:5000/api/pantry`),
        ]);

        if (!resRecipe.ok) throw new Error("Failed to load recipe details");

        const dataRecipe = await resRecipe.json();
        const dataPantry = await resPantry.json();

        setRecipe(dataRecipe);
        setPantryItems(Array.isArray(dataPantry) ? dataPantry : []);
      } catch (err: any) {
        console.error("Error fetching detail data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">Loading recipe ingredients...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">{error || "Recipe not found."}</p>
        <Link
          to="/recipes"
          className="inline-flex items-center gap-2 rounded-2xl bg-sage px-4 py-2 text-xs font-medium text-sage-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
          <Link
            to="/recipes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Recipes
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-4xl">{recipe.emoji || "🍲"}</span>
            <div>
              <h1 className="font-display text-3xl">{recipe.title}</h1>
              {recipe.blurb && (
                <p className="text-sm text-muted-foreground mt-1">{recipe.blurb}</p>
              )}
            </div>
          </div>

          <section className="mt-8">
            <h2 className="font-display text-xl mb-4">Ingredients & Pantry Quantity</h2>

            <div className="space-y-3 max-w-xl">
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((ing, idx) => {
                  // Safely handle both string entries ("200g Pasta") and object entries ({ name: "Pasta", amount: "200g" })
                  const ingredientText = typeof ing === "string" 
                    ? ing 
                    : ing && typeof ing === "object" && ing.name 
                    ? `${ing.amount ? ing.amount + " " : ""}${ing.name}` 
                    : String(ing);

                  // Find if ingredient name exists in Pantry safely
                  const pantryMatch = pantryItems.find((p) =>
                    p && p.name && ingredientText.toLowerCase().includes(p.name.toLowerCase())
                  );

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        {pantryMatch ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                        )}
                        <span className="font-medium">{ingredientText}</span>
                      </div>

                      <span className="rounded-full bg-beige/60 px-3 py-1 text-xs border border-border text-muted-foreground">
                        In Pantry:{" "}
                        <strong className="text-foreground">
                          {pantryMatch ? `${pantryMatch.quantity} ${pantryMatch.unit}` : "0"}
                        </strong>
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No ingredients listed for this recipe.</p>
              )}
            </div>
          </section>

          {recipe.instructions && (
            <section className="mt-8 max-w-xl">
              <h2 className="font-display text-xl mb-3">Instructions</h2>
              <p className="text-sm leading-relaxed text-muted-foreground bg-card border border-border p-5 rounded-2xl">
                {recipe.instructions}
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}