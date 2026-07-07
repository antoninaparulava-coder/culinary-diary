import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Trophy,
  Users,
  Clock,
  Flame,
  Check,
  Camera,
  Sparkles,
  Images,
  ArrowRight,
  Medal,
  Crown,
  Trash2,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { initialIngredients } from "@/lib/pantry";
import {
  challenges,
  useChallengeStore,
  toggleJoin,
  submitProof,
  deleteSubmission,
} from "@/lib/challenges";

export const Route = createFileRoute("/challenges/")({
  component: ChallengesPage,
  head: () => ({
    meta: [
      { title: "Community Challenges — Culinary Diary" },
      { name: "description", content: "Join trending cooking challenges." },
    ],
  }),
});

function ChallengesPage() {
  const { joined, proofs, submissions } = useChallengeStore();

  // Aggregate leaderboard from all submissions across challenges
  const totals = new Map<string, number>();
  Object.values(submissions).forEach((subs) => {
    subs.forEach((s) => {
      totals.set(s.author, (totals.get(s.author) ?? 0) + s.votes);
    });
  });
  const leaderboard = [...totals.entries()]
    .map(([author, votes]) => ({ author, votes }))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 10);

  const rankStyles = [
    "bg-[oklch(0.85_0.12_85)] text-[oklch(0.35_0.1_85)]",
    "bg-beige text-foreground",
    "bg-[oklch(0.82_0.08_45)] text-[oklch(0.35_0.08_45)]",
  ];

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
              const isJoined = !!joined[c.slug];
              const proofUrl = proofs[c.slug];
              const isCompleted = isJoined && !!proofUrl;
              const participants = c.participants + (isJoined ? 1 : 0);
              const pct = Math.round((participants / c.goal) * 100);
              const subs = submissions[c.slug] ?? [];
              const previewSubs = subs.slice(0, 4);
              return (
                <article
                  key={c.slug}
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

                  {isCompleted && (
                    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-sage-soft p-3">
                      <img
                        src={proofUrl!}
                        alt="Proof thumbnail"
                        className="h-10 w-10 rounded-xl object-cover ring-1 ring-sage/20"
                      />
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[oklch(0.35_0.06_145)]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Completed
                      </span>
                    </div>
                  )}

                  {subs.length > 0 && (
                    <Link
                      to="/challenges/$slug"
                      params={{ slug: c.slug }}
                      className="group mt-5 block rounded-2xl border border-border bg-background/60 p-3 hover:border-sage/50 hover:bg-sage-soft/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                          <Images className="h-3.5 w-3.5" />
                          Submissions Gallery
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sage group-hover:gap-2 transition-all">
                          View all {subs.length}
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-1.5">
                        {previewSubs.map((s) => (
                          <div
                            key={s.id}
                            className="aspect-square overflow-hidden rounded-lg bg-beige"
                          >
                            <img
                              src={s.imageUrl}
                              alt={`${s.author}'s submission`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </Link>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 mt-5">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {c.daysLeft} days left
                    </span>
                    <div className="flex items-center gap-2">
                      {isJoined && !isCompleted && (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`proof-${c.slug}`}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) submitProof(c.slug, f);
                            }}
                          />
                          <label
                            htmlFor={`proof-${c.slug}`}
                            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-sage px-3 py-2 text-xs font-medium text-sage-foreground shadow-sm shadow-sage/20 hover:shadow-md hover:shadow-sage/30 hover:-translate-y-0.5 transition-all"
                          >
                            <Camera className="h-3.5 w-3.5 shrink-0" />
                            Submit Proof
                          </label>
                        </>
                      )}
                      <button
                        onClick={() => toggleJoin(c.slug)}
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
                  </div>
                </article>
              );
            })}
          </section>

          {/* Leaderboard */}
          <section className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-sage">
                  Community Leaderboard
                </p>
                <h2 className="mt-1 font-display text-xl sm:text-2xl">
                  Top cooks by votes
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ranked by total ❤️ earned across all challenge submissions.
                </p>
              </div>
              <Crown className="hidden h-8 w-8 text-sage sm:block" />
            </div>

            {leaderboard.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No votes yet. Be the first to cheer on a dish!
              </p>
            ) : (
              <ol className="mt-6 space-y-2">
                {leaderboard.map((entry, i) => {
                  const initial = entry.author.charAt(0).toUpperCase();
                  const badge = rankStyles[i] ?? "bg-beige text-muted-foreground";
                  return (
                    <li
                      key={entry.author}
                      className="flex items-center gap-4 rounded-2xl border border-border bg-background/60 p-3 sm:p-4 hover:border-sage/40 transition-colors"
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${badge}`}
                      >
                        {i < 3 ? <Medal className="h-4 w-4" /> : i + 1}
                      </span>
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage-soft text-sm font-semibold text-[oklch(0.35_0.06_145)]">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {entry.author}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rank #{i + 1}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-beige px-3 py-1.5 text-xs font-semibold text-foreground">
                        ❤️ {entry.votes}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
