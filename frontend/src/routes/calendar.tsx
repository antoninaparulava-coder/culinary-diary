import { createFileRoute } from "@tanstack/react-router";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
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
type DayPlan = {
  day: string;
  date: string;
  today?: boolean;
  meals: Partial<Record<Slot, { name: string; emoji: string }>>;
};

const week: DayPlan[] = [
  {
    day: "Monday",
    date: "26",
    meals: {
      Breakfast: { name: "Berry Pancakes", emoji: "🥞" },
      Lunch: { name: "Garden Salad Bowl", emoji: "🥗" },
      Dinner: { name: "Tomato Basil Pasta", emoji: "🍝" },
    },
  },
  {
    day: "Tuesday",
    date: "27",
    today: true,
    meals: {
      Breakfast: { name: "Avocado Toast", emoji: "🥑" },
      Lunch: { name: "Lemon Spinach Soup", emoji: "🍲" },
      Dinner: { name: "Lemon Roast Chicken", emoji: "🍗" },
    },
  },
  {
    day: "Wednesday",
    date: "28",
    meals: {
      Breakfast: { name: "Greek Yogurt + Berries", emoji: "🍓" },
      Dinner: { name: "Cheesy Garlic Flatbread", emoji: "🧀" },
    },
  },
  {
    day: "Thursday",
    date: "29",
    meals: {
      Lunch: { name: "Bruschetta Plate", emoji: "🍅" },
      Dinner: { name: "Sourdough Pizza", emoji: "🍕" },
    },
  },
  {
    day: "Friday",
    date: "30",
    meals: {
      Breakfast: { name: "Strawberry Basil Toast", emoji: "🍓" },
      Dinner: { name: "Rustic Tomato Soup", emoji: "🍲" },
    },
  },
  {
    day: "Saturday",
    date: "31",
    meals: {},
  },
  {
    day: "Sunday",
    date: "01",
    meals: {
      Lunch: { name: "Sage Garden Salad", emoji: "🥗" },
      Dinner: { name: "Sunday Risotto", emoji: "🍚" },
    },
  },
];

const slots: Slot[] = ["Breakfast", "Lunch", "Dinner"];

function CalendarPage() {
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
                Week of May 26 – June 1
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="grid h-10 w-10 place-items-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </header>

          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
            {week.map((d) => (
              <article
                key={d.day}
                className={`flex flex-col rounded-3xl border p-4 transition ${
                  d.today
                    ? "border-sage bg-sage-soft/40"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {d.day.slice(0, 3)}
                    </p>
                    <p className="font-display text-2xl leading-none">
                      {d.date}
                    </p>
                  </div>
                  {d.today && (
                    <span className="rounded-full bg-sage px-2 py-0.5 text-[10px] font-medium text-sage-foreground">
                      Today
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-1 flex-col gap-2">
                  {slots.map((slot) => {
                    const meal = d.meals[slot];
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
                            <span className="truncate">{meal.name}</span>
                          </p>
                        ) : (
                          <button className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-sage transition">
                            <Plus className="h-3 w-3" /> Add meal
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
