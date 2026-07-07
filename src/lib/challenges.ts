import { useSyncExternalStore } from "react";

export type Challenge = {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  participants: number;
  goal: number;
  daysLeft: number;
  tag: string;
};

export type Submission = {
  id: string;
  author: string;
  imageUrl: string;
  votes: number;
};

export const challenges: Challenge[] = [
  {
    slug: "sourdough-bread",
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
    slug: "5-ingredient-sunday",
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
    slug: "garden-to-plate",
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

export const getChallengeBySlug = (slug: string) =>
  challenges.find((c) => c.slug === slug);

type State = {
  joined: Record<string, boolean>;
  proofs: Record<string, string | null>;
  submissions: Record<string, Submission[]>;
  voted: Record<string, boolean>;
};

const state: State = {
  joined: {},
  proofs: {},
  voted: {},
  submissions: {
    "sourdough-bread": [
      {
        id: "s1",
        author: "Maya",
        imageUrl:
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop",
        votes: 42,
      },
      {
        id: "s2",
        author: "Jonas",
        imageUrl:
          "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=600&auto=format&fit=crop",
        votes: 27,
      },
      {
        id: "s6",
        author: "Rosa",
        imageUrl:
          "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&auto=format&fit=crop",
        votes: 15,
      },
      {
        id: "s7",
        author: "Kenji",
        imageUrl:
          "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop",
        votes: 9,
      },
    ],
    "5-ingredient-sunday": [
      {
        id: "s3",
        author: "Priya",
        imageUrl:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop",
        votes: 18,
      },
      {
        id: "s8",
        author: "Tom",
        imageUrl:
          "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&auto=format&fit=crop",
        votes: 22,
      },
      {
        id: "s9",
        author: "Lea",
        imageUrl:
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop",
        votes: 11,
      },
    ],
    "garden-to-plate": [
      {
        id: "s4",
        author: "Eli",
        imageUrl:
          "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop",
        votes: 31,
      },
      {
        id: "s5",
        author: "Ana",
        imageUrl:
          "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=600&auto=format&fit=crop",
        votes: 12,
      },
      {
        id: "s10",
        author: "Sam",
        imageUrl:
          "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop",
        votes: 20,
      },
    ],
  },
};

let current: State = state;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => current;

const update = (patch: Partial<State>) => {
  current = { ...current, ...patch };
  emit();
};

export function useChallengeStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const toggleJoin = (slug: string) => {
  update({ joined: { ...current.joined, [slug]: !current.joined[slug] } });
};

export const submitProof = (slug: string, file: File) => {
  const url = URL.createObjectURL(file);
  const newSub: Submission = {
    id: `me-${slug}-${Date.now()}`,
    author: "You",
    imageUrl: url,
    votes: 0,
  };
  update({
    proofs: { ...current.proofs, [slug]: url },
    submissions: {
      ...current.submissions,
      [slug]: [newSub, ...(current.submissions[slug] ?? [])],
    },
  });
};

export const toggleVote = (slug: string, subId: string) => {
  const key = `${slug}:${subId}`;
  const hasVoted = !!current.voted[key];
  update({
    voted: { ...current.voted, [key]: !hasVoted },
    submissions: {
      ...current.submissions,
      [slug]: (current.submissions[slug] ?? []).map((s) =>
        s.id === subId ? { ...s, votes: s.votes + (hasVoted ? -1 : 1) } : s
      ),
    },
  });
};
