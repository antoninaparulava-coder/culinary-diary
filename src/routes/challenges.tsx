import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Trophy,
  Users,
  Clock,
  Flame,
  Check,
  Camera,
  Upload,
  Sparkles,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { initialIngredients } from "@/lib/pantry";

export const Route = createFileRoute("/challenges")({
  component: ChallengesPage,
  head: () => ({
    meta: [
      { title: "Community Challenges — Culinary Diary" },
      { name: "description", content: "Join trending cooking challenges." },
    ],
  }),
});

type Challenge = {
  title: string;
  description: string;
  emoji: string;
  participants: number;
  goal: number;
  daysLeft: number;
  tag: string;
};

const challenges: Challenge[] = [
  {
    title: "Bake Your Own Sourdough Bread",
    description:
      "Nurture a starter, fold the dough, and share your first golden crust.",
    emoji: "🍞",
    participants: 320,
    goal: 500,
    daysLeft: 12,
    tag: "Baking",
  },
  {
    title: "5-Ingredient Sunday Dinner",
    description:
      "Cook a complete dinner using only five pantry ingredients. Less is more.",
    emoji: "🥘",
    participants: 120,
    goal: 500,
    daysLeft: 5,
    tag: "Minimalist",
  },
  {
    title: "Garden to Plate Week",
    description:
      "Pick one herb or veg from your garden (or windowsill!) each day this week.",
    emoji: "🌿",
    participants: 248,
    goal: 400,
    daysLeft: 7,
    tag: "Seasonal",
  },
];

function ChallengesPage() {
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [proofs, setProofs] = useState<Record<string, string | null>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const toggle = (title: string) =>
    setJoined((prev) => ({ ...prev, [title]: !prev[title] }));

  const handleProofClick = () => fileInputRef.current?.click();

  const handleFileChange = (title: string, file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProofs((prev) => ({ ...prev, [title]: url }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <Sidebar pantryCount={initialIngredients.length} />

        <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
          <header>
            <p className="text-xs uppercase tracking-widest text-sage">
              Community Challenges
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl">
              Trending this week
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Cook along with thousands of home cooks. Share your dish, swap
              tips, and earn cozy little badges.
            </p>
          </header>

          <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {challenges.map((c) => {
              const isJoined = !!joined[c.title];
              const participants = c.participants + (isJoined ? 1 : 0);
              const pct = Math.round((participants / c.goal) * 100);
              return (
                <article
                  key={c.title}
                  className="flex flex-col rounded-3xl border border-border bg-card p-6 hover:border-sage/50 hover:shadow-lg hover:shadow-sage/5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-beige text-2xl">
                      {c.emoji}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-sage-soft px-2.5 py-1 text-[11px] font-medium text-[oklch(0.35_0.06_145)]">
                      <Flame className="h-3 w-3" />
                      {c.tag}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-lg leading-tight">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {c.description}
                  </p>

                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {participants}/{c.goal} participants
                      </span>
                      <span className="font-medium text-foreground">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-beige">
                      <div
                        className="h-full rounded-full bg-sage transition-all duration-500 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {c.daysLeft} days left
                    </span>
                    <button
                      onClick={() => toggle(c.title)}
                      aria-pressed={isJoined}
                      className={
                        isJoined
                          ? "group inline-flex items-center justify-center gap-1.5 rounded-full border border-sage/40 bg-sage-soft px-4 py-2 text-xs font-medium text-[oklch(0.35_0.06_145)] hover:bg-[color:var(--destructive)]/10 hover:border-[color:var(--destructive)]/40 hover:text-[color:var(--destructive)] transition-all w-[140px]"
                          : "inline-flex items-center justify-center gap-1.5 rounded-full bg-sage px-4 py-2 text-xs font-medium text-sage-foreground shadow-sm shadow-sage/20 hover:shadow-md hover:shadow-sage/30 hover:-translate-y-0.5 transition-all w-[140px]"
                      }
                    >
                      {isJoined ? (
                        <>
                          <Check className="h-3.5 w-3.5 group-hover:hidden shrink-0" />
                          <span className="group-hover:hidden">Joined</span>
                          <span className="hidden group-hover:inline">Leave</span>
                        </>
                      ) : (
                        <>
                          <Trophy className="h-3.5 w-3.5 shrink-0" />
                          Join Challenge
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        </main>
      </div>
    </div>
  );
}
