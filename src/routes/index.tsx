import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Sparkles,
  Bell,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { initialIngredients, toneClass, type Ingredient } from "@/lib/pantry";

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

const week = [
  { day: "Mon", date: "26", meal: "Tomato Basil Pasta", emoji: "🍝", today: false },
  { day: "Tue", date: "27", meal: "Lemon Roast Chicken", emoji: "🍗", today: true },
  { day: "Wed", date: "28", meal: "Garden Salad Bowl", emoji: "🥗", today: false },
  { day: "Thu", date: "29", meal: "Sourdough Pizza", emoji: "🍕", today: false },
  { day: "Fri", date: "30", meal: "Berry Pancakes", emoji: "🥞", today: false },
  { day: "Sat", date: "31", meal: "—", emoji: "✨", today: false },
  { day: "Sun", date: "01", meal: "Sunday Risotto", emoji: "🍚", today: false },
];

function Index() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [query, setQuery] = useState("");

  const addIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const name = query.trim();
    if (!name) return;
    setIngredients((prev) => [
      { name, emoji: "🍃", tone: "herb" },
      ...prev,
    ]);
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <Sidebar pantryCount={ingredients.length} />

        {/* Main */}
        <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
          {/* Header */}
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Tuesday, May 26
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
                    {ingredients.length} ingredients
                  </p>
                </div>

                <form onSubmit={addIngredient} className="mt-5">
                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/20 transition">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Add an ingredient…"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-full bg-sage px-3 py-1.5 text-xs font-medium text-sage-foreground hover:opacity-90 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>
                </form>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  {ingredients.map((ing, i) => (
                    <span
                      key={`${ing.name}-${i}`}
                      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium ${toneClass[ing.tone]}`}
                    >
                      <span className="text-base leading-none">{ing.emoji}</span>
                      {ing.name}
                    </span>
                  ))}
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
                <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-sage px-7 py-4 text-base font-medium text-sage-foreground shadow-lg shadow-sage/20 hover:shadow-xl hover:shadow-sage/30 hover:-translate-y-0.5 transition-all">
                  <Sparkles className="h-4 w-4" />
                  What can I cook today?
                </button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Based on {ingredients.length} items in your pantry
                </p>
              </section>
            </div>

            {/* Right column: Calendar */}
            <aside className="rounded-3xl bg-card border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-sage">
                    This Week
                  </p>
                  <h3 className="mt-1 font-display text-xl">Meal Calendar</h3>
                </div>
                <button className="text-xs text-muted-foreground hover:text-foreground">
                  View all
                </button>
              </div>

              <div className="mt-5 space-y-2">
                {week.map((d) => (
                  <div
                    key={d.day}
                    className={`flex items-center gap-3 rounded-2xl p-3 transition ${
                      d.today
                        ? "bg-sage-soft"
                        : "bg-beige/60 hover:bg-beige"
                    }`}
                  >
                    <div
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                        d.today
                          ? "bg-sage text-sage-foreground"
                          : "bg-card text-foreground"
                      }`}
                    >
                      <div className="text-center leading-tight">
                        <div className="text-[10px] uppercase tracking-wider opacity-80">
                          {d.day}
                        </div>
                        <div className="font-display text-sm">{d.date}</div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {d.today ? "Today" : "Planned"}
                      </p>
                      <p className="truncate text-sm font-medium">{d.meal}</p>
                    </div>
                    <span className="text-xl">{d.emoji}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
