import { createFileRoute } from "@tanstack/react-router";
import { Gift, Sparkles, Clock, ChefHat, RefreshCw } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { initialIngredients, recipes, type Recipe } from "@/lib/pantry";

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

function pickRandomMatch(pantryNames: string[]): Recipe {
  const set = new Set(pantryNames.map((n) => n.toLowerCase()));
  const scored = recipes
    .map((r) => {
      const matches = r.uses.filter((u) => set.has(u.toLowerCase())).length;
      return { r, matches };
    })
    .filter((x) => x.matches > 0);
  const pool = scored.length > 0 ? scored.map((s) => s.r) : recipes;
  return pool[Math.floor(Math.random() * pool.length)];
}

function MysteryBoxPage() {
  const pantry = initialIngredients;
  const pantryNames = useMemo(() => pantry.map((p) => p.name), [pantry]);

  const [spinning, setSpinning] = useState(false);
  const [reel, setReel] = useState<string>("🎁");
  const [revealed, setRevealed] = useState<Recipe | null>(null);
  const intervalRef = useRef<number | null>(null);

  const reelEmojis = ["🍅", "🧀", "🌿", "🍓", "🍞", "🧄", "🥬", "🥚", "🫒", "🍋", "🍝", "🥗", "🍲", "🥞"];

  const startSpin = () => {
    if (spinning) return;
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
      const recipe = pickRandomMatch(pantryNames);
      setReel(recipe.emoji);
      setRevealed(recipe);
      setSpinning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <Sidebar pantryCount={pantry.length} />

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
                Spin the box and let your pantry decide tonight's dinner.
              </p>
            </div>
          </header>

          <section className="mt-10 grid place-items-center">
            {/* Mystery Box */}
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

            {/* Action */}
            <button
              onClick={startSpin}
              disabled={spinning}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-sage px-8 py-4 text-base font-medium text-sage-foreground shadow-lg shadow-sage/20 hover:shadow-xl hover:shadow-sage/30 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:translate-y-0 disabled:cursor-not-allowed"
            >
              {spinning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Spinning…
                </>
              ) : revealed ? (
                <>
                  <Gift className="h-4 w-4" />
                  Spin Again
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4" />
                  Open Mystery Box
                </>
              )}
            </button>

            <p className="mt-3 text-xs text-muted-foreground">
              Drawn from {pantry.length} pantry ingredients
            </p>
          </section>

          {/* Reveal */}
          {revealed && (
            <section className="mt-12 grid place-items-center animate-fade-in">
              <article className="w-full max-w-xl rounded-3xl bg-card border border-border p-7 sm:p-9 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[oklch(0.32_0.06_145)]">
                    <Sparkles className="h-3 w-3" />
                    Tonight's pick
                  </span>
                  <span className="text-3xl">{revealed.emoji}</span>
                </div>

                <h3 className="mt-5 font-display text-2xl sm:text-3xl leading-tight">
                  {revealed.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {revealed.blurb}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-beige px-3 py-1.5 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {revealed.time}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-beige px-3 py-1.5 font-medium">
                    <ChefHat className="h-3.5 w-3.5" />
                    {revealed.difficulty}
                  </span>
                  {revealed.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-sage-soft px-3 py-1.5 font-medium text-[oklch(0.32_0.06_145)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-6 border-t border-border pt-5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    From your pantry
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {revealed.uses.map((u) => (
                      <span
                        key={u}
                        className="rounded-full border border-border px-3 py-1 text-xs text-foreground/80"
                      >
                        {u}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
