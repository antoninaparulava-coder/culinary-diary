import { createFileRoute } from "@tanstack/react-router";
import { Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { initialIngredients } from "@/lib/pantry";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
  head: () => ({
    meta: [
      { title: "Meal Calendar — Culinary Diary" },
      { name: "description", content: "Plan your week of meals." },
    ],
  }),
});

type Slot = "Breakfast" | "Lunch" | "Dinner";

interface Recipe {
  _id: string;
  title: string;
  emoji: string;
}

interface MealPlan {
  _id: string;
  date: string; // YYYY-MM-DD
  mealType: Slot;
  recipe: Recipe;
}

const slots: Slot[] = ["Breakfast", "Lunch", "Dinner"];

// Helper: Get Monday of a given date
function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

// Helper: Format Date to YYYY-MM-DD for backend
function formatDateISO(d: Date) {
  return d.toISOString().split("T")[0];
}

function CalendarPage() {
  const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: Slot } | null>(null);

  // Generate 7 days starting from current Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentMonday);
    day.setDate(currentMonday.getDate() + i);
    return day;
  });

  const startDateStr = formatDateISO(weekDays[0]);
  const endDateStr = formatDateISO(weekDays[6]);

  // Fetch meals and recipes from MongoDB
  const fetchCalendarData = async () => {
    try {
      const [resPlans, resRecipes] = await Promise.all([
        fetch(`http://localhost:5000/api/meal-plans?startDate=${startDateStr}&endDate=${endDateStr}`),
        fetch(`http://localhost:5000/api/recipes`),
      ]);
      const dataPlans = await resPlans.json();
      const dataRecipes = await resRecipes.json();

      setMealPlans(dataPlans);
      setRecipes(dataRecipes);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [startDateStr]);

  const changeWeek = (direction: "prev" | "next") => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(currentMonday.getDate() + (direction === "next" ? 7 : -7));
    setCurrentMonday(newMonday);
  };

  const handleAssignRecipe = async (recipeId: string) => {
    if (!selectedSlot) return;

    try {
      const res = await fetch("http://localhost:5000/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedSlot.date,
          mealType: selectedSlot.mealType,
          recipeId,
        }),
      });

      if (res.ok) {
        setSelectedSlot(null);
        fetchCalendarData();
      }
    } catch (err) {
      console.error("Error assigning meal:", err);
    }
  };

  const todayStr = formatDateISO(new Date());

  // Date range header display (e.g. "Week of May 26 – Jun 1")
  const weekLabel = `Week of ${weekDays[0].toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} – ${weekDays[6].toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <Sidebar pantryCount={initialIngredients.length} />

        <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-sage">
                Meal Calendar
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl">
                {weekLabel}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeWeek("prev")}
                className="grid h-10 w-10 place-items-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => changeWeek("next")}
                className="grid h-10 w-10 place-items-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </header>

          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
            {weekDays.map((dObj) => {
              const dateISO = formatDateISO(dObj);
              const isToday = dateISO === todayStr;
              const dayName = dObj.toLocaleDateString("en-US", { weekday: "short" });
              const dayNum = String(dObj.getDate()).padStart(2, "0");

              return (
                <article
                  key={dateISO}
                  className={`flex flex-col rounded-3xl border p-4 transition ${
                    isToday
                      ? "border-sage bg-sage-soft/40"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {dayName}
                      </p>
                      <p className="font-display text-2xl leading-none">
                        {dayNum}
                      </p>
                    </div>
                    {isToday && (
                      <span className="rounded-full bg-sage px-2 py-0.5 text-[10px] font-medium text-sage-foreground">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-1 flex-col gap-2">
                    {slots.map((slot) => {
                      const mealPlan = mealPlans.find(
                        (p) => p.date === dateISO && p.mealType === slot
                      );
                      const meal = mealPlan?.recipe;

                      return (
                        <div
                          key={slot}
                          className={`rounded-2xl p-3 text-left transition ${
                            meal
                              ? "bg-beige/70"
                              : "border border-dashed border-border bg-transparent hover:bg-beige/40"
                          }`}
                        >
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {slot}
                          </p>
                          {meal ? (
                            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium leading-snug">
                              <span>{meal.emoji}</span>
                              <span className="truncate">{meal.title}</span>
                            </p>
                          ) : (
                            <button
                              onClick={() => setSelectedSlot({ date: dateISO, mealType: slot })}
                              className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-sage transition"
                            >
                              <Plus className="h-3 w-3" /> Add meal
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </section>

          {/* Modal to pick a recipe from MongoDB */}
          {selectedSlot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl">
                    Select {selectedSlot.mealType}
                  </h3>
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose a recipe for {selectedSlot.date}:
                </p>

                <div className="mt-4 max-h-60 overflow-y-auto flex flex-col gap-2 pr-1">
                  {recipes.map((r) => (
                    <button
                      key={r._id}
                      onClick={() => handleAssignRecipe(r._id)}
                      className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-sage/10 transition text-left"
                    >
                      <span className="text-sm font-medium">{r.title}</span>
                      <span className="text-lg">{r.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}