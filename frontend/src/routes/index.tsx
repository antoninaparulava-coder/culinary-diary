import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Sparkles,
  Bell,
  Settings,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Culinary Diary — Your cozy kitchen companion" },
      {
        name: "description",
        content:
          "Track your pantry, plan meals, and discover what to cook today with Culinary Diary.",
      },
    ],
  }),
});

interface PantryItem {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

interface MealPlan {
  _id: string;
  date: string; // YYYY-MM-DD
  mealType: "Breakfast" | "Lunch" | "Dinner";
  recipe: {
    _id: string;
    title: string;
    emoji: string;
  };
}

// Helpers for Week & Date calculations
function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function formatDateISO(d: Date) {
  return d.toISOString().split("T")[0];
}

function Index() {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [unitInput, setUnitInput] = useState("pcs");
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);

  // Calculate current week dates
  const today = new Date();
  const todayISO = formatDateISO(today);
  const monday = getMonday(today);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });

  const startDateStr = formatDateISO(weekDays[0]);
  const endDateStr = formatDateISO(weekDays[6]);

  // Fetch Pantry items from MongoDB
  const fetchPantry = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/pantry");
      const data = await res.json();
      if (Array.isArray(data)) setPantryItems(data);
    } catch (err) {
      console.error("Error fetching pantry items:", err);
    }
  };

  // Fetch current week's planned meals
  useEffect(() => {
    fetchPantry();

    async function fetchMeals() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/meal-plans?startDate=${startDateStr}&endDate=${endDateStr}`
        );
        const data = await res.json();
        setMealPlans(data);
      } catch (err) {
        console.error("Error fetching dashboard meal plans:", err);
      }
    }

    fetchMeals();
  }, [startDateStr, endDateStr]);

  // Add new ingredient to MongoDB
  const addIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;

    try {
      const res = await fetch("http://localhost:5000/api/pantry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          quantity: Number(quantityInput) || 1,
          unit: unitInput,
        }),
      });

      if (res.ok) {
        setNameInput("");
        setQuantityInput(1);
        fetchPantry(); // refresh list
      }
    } catch (err) {
      console.error("Error adding pantry item:", err);
    }
  };

  // Delete item when used up
  const deleteIngredient = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/pantry/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPantryItems((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Error deleting pantry item:", err);
    }
  };

  // Format today's date for header
  const formattedTodayHeader = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <Sidebar pantryCount={pantryItems.length} />

        {/* Main */}
        <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
          {/* Header */}
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {formattedTodayHeader}
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl">
                Good afternoon, Antonina
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="grid h-10 w-10 place-items-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition">
                <Bell className="h-4 w-4" />
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition">
                <Settings className="h-4 w-4" />
              </button>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-sage text-sage-foreground font-medium text-sm">
                A
              </div>
            </div>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
            {/* Left column */}
            <div className="space-y-6">
              {/* Pantry */}
              <section className="rounded-3xl bg-card border border-border p-6 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-sage">
                      Pantry Tracker
                    </p>
                    <h3 className="mt-1 font-display text-xl sm:text-2xl">
                      Your virtual fridge
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pantryItems.length} ingredients
                  </p>
                </div>

                <form onSubmit={addIngredient} className="mt-5 flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/20 transition">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Add an ingredient…"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>

                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(Number(e.target.value))}
                    className="w-20 rounded-2xl border border-border bg-background px-3 py-3 text-sm text-center outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition"
                  />

                  <select
                    value={unitInput}
                    onChange={(e) => setUnitInput(e.target.value)}
                    className="rounded-2xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition"
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                    <option value="pack">pack</option>
                    <option value="tbsp">tbsp</option>
                  </select>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-2xl bg-sage px-5 py-3 text-sm font-medium text-sage-foreground hover:opacity-90 transition shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </form>

                {/* Ingredient Chips */}
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {pantryItems.map((item) => (
                    <span
                      key={item._id}
                      className="group inline-flex items-center gap-2 rounded-full border border-border bg-beige/60 px-3.5 py-2 text-sm font-medium transition hover:border-sage"
                    >
                      <span>{item.name}</span>
                      <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground border border-border">
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        onClick={() => deleteIngredient(item._id)}
                        className="text-muted-foreground hover:text-destructive opacity-60 hover:opacity-100 transition"
                        title="Remove from pantry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  {pantryItems.length === 0 && (
                    <p className="text-sm text-muted-foreground">Your pantry is empty. Add some ingredients above!</p>
                  )}
                </div>
              </section>

              {/* Center action */}
              <section className="rounded-3xl bg-gradient-to-br from-sage-soft to-beige p-8 sm:p-10 text-center">
                <p className="text-xs uppercase tracking-widest text-[oklch(0.4_0.06_145)]">
                  Daily Inspiration
                </p>
                <h3 className="mt-2 font-display text-2xl sm:text-3xl text-[oklch(0.3_0.04_145)]">
                  Hungry? Let's see what's possible.
                </h3>
                <Link
                  to="/recipes"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-sage px-7 py-4 text-base font-medium text-sage-foreground shadow-lg shadow-sage/20 hover:shadow-xl hover:shadow-sage/30 hover:-translate-y-0.5 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  What can I cook today?
                </Link>
                <p className="mt-3 text-xs text-muted-foreground">
                  Based on {pantryItems.length} items in your pantry
                </p>
              </section>
            </div>

            {/* Right column: Dynamic Meal Calendar */}
            <aside className="rounded-3xl bg-card border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-sage">
                    This Week
                  </p>
                  <h3 className="mt-1 font-display text-xl">Meal Calendar</h3>
                </div>
                <Link
                  to="/calendar"
                  className="text-xs text-muted-foreground hover:text-foreground transition"
                >
                  View all
                </Link>
              </div>

              <div className="mt-5 space-y-2">
                {weekDays.map((dObj) => {
                  const dateISO = formatDateISO(dObj);
                  const isToday = dateISO === todayISO;

                  const dayShort = dObj.toLocaleDateString("en-US", { weekday: "short" });
                  const dayNum = String(dObj.getDate()).padStart(2, "0");

                  const dayMeals = mealPlans.filter((m) => m.date === dateISO);
                  const activeMeal =
                    dayMeals.find((m) => m.mealType === "Dinner") ||
                    dayMeals.find((m) => m.mealType === "Lunch") ||
                    dayMeals.find((m) => m.mealType === "Breakfast");

                  return (
                    <div
                      key={dateISO}
                      className={`flex items-center gap-3 rounded-2xl p-3 transition ${
                        isToday
                          ? "bg-sage-soft"
                          : "bg-beige/60 hover:bg-beige"
                      }`}
                    >
                      <div
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                          isToday
                            ? "bg-sage text-sage-foreground"
                            : "bg-card text-foreground"
                        }`}
                      >
                        <div className="text-center leading-tight">
                          <div className="text-[10px] uppercase tracking-wider opacity-80">
                            {dayShort}
                          </div>
                          <div className="font-display text-sm">{dayNum}</div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">
                          {isToday ? "Today" : "Planned"}
                        </p>
                        <p className="truncate text-sm font-medium">
                          {activeMeal ? activeMeal.recipe.title : "—"}
                        </p>
                      </div>
                      <span className="text-xl">
                        {activeMeal ? activeMeal.recipe.emoji : "✨"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}