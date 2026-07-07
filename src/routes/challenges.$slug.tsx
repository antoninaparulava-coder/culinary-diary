import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Heart, Flame, Users, Clock, Trophy, Trash2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { initialIngredients } from "@/lib/pantry";
import {
  getChallengeBySlug,
  useChallengeStore,
  toggleVote,
  deleteSubmission,
} from "@/lib/challenges";

export const Route = createFileRoute("/challenges/$slug")({
  loader: ({ params }) => {
    const challenge = getChallengeBySlug(params.slug);
    if (!challenge) throw notFound();
    return { challenge };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.challenge.title} — Submissions`
          : "Submissions",
      },
      {
        name: "description",
        content: "Browse every submission and vote for your favorite dish.",
      },
    ],
  }),
  component: GalleryPage,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <p className="text-muted-foreground">Challenge not found.</p>
      <Link to="/challenges" className="mt-4 inline-block text-sage underline">
        Back to challenges
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">
      Something went wrong: {error.message}
    </div>
  ),
});

function GalleryPage() {
  const { challenge } = Route.useLoaderData();
  const { submissions, voted } = useChallengeStore();
  const subs = [...(submissions[challenge.slug] ?? [])].sort(
    (a, b) => b.votes - a.votes
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <Sidebar pantryCount={initialIngredients.length} />

        <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
          <Link
            to="/challenges"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to challenges
          </Link>

          <header className="mt-4 flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-beige text-4xl">
              {challenge.emoji}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-sage-soft px-2.5 py-1 text-[11px] font-medium text-[oklch(0.35_0.06_145)]">
                  <Flame className="h-3 w-3" />
                  {challenge.tag}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {challenge.participants} joined
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {challenge.daysLeft} days left
                </span>
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl">
                {challenge.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {challenge.description}
              </p>
            </div>
          </header>

          <div className="mt-8 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-sage">
                Submissions Gallery
              </p>
              <h2 className="mt-1 font-display text-xl sm:text-2xl">
                {subs.length} {subs.length === 1 ? "dish" : "dishes"} from the
                community
              </h2>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" />
              Ranked by votes
            </span>
          </div>

          {subs.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No submissions yet. Be the first to share your dish!
            </div>
          ) : (
            <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {subs.map((s, i) => {
                const key = `${challenge.slug}:${s.id}`;
                const hasVoted = !!voted[key];
                return (
                  <article
                    key={s.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card hover:border-sage/50 hover:shadow-lg hover:shadow-sage/5 transition-all"
                  >
                    <div className="relative aspect-square overflow-hidden bg-beige">
                      <img
                        src={s.imageUrl}
                        alt={`${s.author}'s submission`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {i < 3 && (
                        <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground shadow-sm">
                          #{i + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3">
                      <span className="truncate text-sm font-medium">
                        {s.author}
                      </span>
                      <button
                        onClick={() => toggleVote(challenge.slug, s.id)}
                        aria-pressed={hasVoted}
                        className={
                          hasVoted
                            ? "inline-flex items-center gap-1.5 rounded-full bg-[color:var(--destructive)]/10 px-2.5 py-1 text-xs font-semibold text-[color:var(--destructive)] transition-all"
                            : "inline-flex items-center gap-1.5 rounded-full bg-beige px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-[color:var(--destructive)]/10 hover:text-[color:var(--destructive)] transition-all"
                        }
                      >
                        <Heart
                          className={
                            hasVoted ? "h-3.5 w-3.5 fill-current" : "h-3.5 w-3.5"
                          }
                        />
                        {s.votes}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
