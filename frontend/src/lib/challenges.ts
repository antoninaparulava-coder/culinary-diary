import { useEffect, useState } from "react";

export type Challenge = {
  _id?: string;
  slug: string;
  title: string;
  description: string;
  emoji: string;
  participants: number;
  goal: number;
  daysLeft: number;
  tag: string;
  startDate: string;
  endDate: string;
  active: boolean;
  ended: boolean;
  joined?: boolean;
};


export type Submission = {
  id: string;
  userId: string;
  author: string;
  imageUrl: string;
  votes: number;
};

const API = "http://localhost:5000/api/challenges";

export const challenges: Challenge[] = [];



export const getChallengeBySlug = (slug: string) =>
  challenges.find((c) => c.slug === slug);

export type ChallengeStore = {
  joined: Record<string, boolean>;
  proofs: Record<string, string | null>;
  submissions: Record<string, Submission[]>;
  voted: Record<string, boolean>;
  loading: boolean;
};

const emptyStore: ChallengeStore = {
  joined: {},
  proofs: {},
  submissions: {},
  voted: {},
  loading: true,
};

let globalStore = emptyStore;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setStore(patch: Partial<ChallengeStore>) {
  globalStore = {
    ...globalStore,
    ...patch,
  };

  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}


export function useChallengeStore() {
  const [store, setLocalStore] = useState(globalStore);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setLocalStore(globalStore);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    loadChallenges();
  }, []);

  return store;
}

export async function loadChallengeData() {
  const response = await fetch(API, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load challenges.");
  }

  return response.json();
}

async function loadChallenges() {
  try {
    const user = await getCurrentUser();

    cachedUserId = user._id || user.id;

    const challengeResponse = await fetch(API, {
      credentials: "include",
    });

    if (!challengeResponse.ok) {
      throw new Error("Failed to load challenges.");
    }

    const challengeData: Challenge[] =
      await challengeResponse.json();

    const [statusResponse, ...submissionResponses] =
      await Promise.all([
        fetch(`${API}/status`, {
          credentials: "include",
        }),

        ...challengeData.map((challenge) =>
          fetch(`${API}/${challenge.slug}/submissions`)
        ),
      ]);

    if (!statusResponse.ok) {
      throw new Error("Failed to load challenge status.");
    }

    const status = await statusResponse.json();

    const submissions: Record<string, Submission[]> = {};

    for (let i = 0; i < challengeData.length; i++) {
      if (submissionResponses[i].ok) {
        submissions[challengeData[i].slug] =
          await submissionResponses[i].json();
      }
    }

    const voted: Record<string, boolean> = {};

    for (const challenge of challengeData) {
      const voteResponse = await fetch(
        `${API}/${challenge.slug}/votes`,
        {
          credentials: "include",
        }
      );

      if (voteResponse.ok) {
        const votedIds: string[] =
          await voteResponse.json();

        votedIds.forEach((id) => {
          voted[`${challenge.slug}:${id}`] = true;
        });
      }
    }

    const proofs: Record<string, string | null> = {};

    for (const challenge of challengeData) {
      const ownSubmission = (
        submissions[challenge.slug] ?? []
      ).find(
        (submission) =>
          submission.userId === cachedUserId
      );

      proofs[challenge.slug] =
        ownSubmission?.imageUrl ?? null;
    }

    setStore({
      joined: status.joined ?? {},
      submissions,
      voted,
      proofs,
      loading: false,
    });
  } catch (error) {
    console.error("Failed to load challenges:", error);

    setStore({
      loading: false,
    });
  }
}


let cachedUserId: string | null = null;

async function getCurrentUser() {
  const response = await fetch(
    "http://localhost:5000/api/auth/me",
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Not authenticated.");
  }

  return response.json();
}

function getCurrentUserId() {
  return cachedUserId;
}

async function ensureCurrentUser() {
  if (cachedUserId) return cachedUserId;

  const user = await getCurrentUser();

  cachedUserId = user._id || user.id;

  return cachedUserId;
}

export async function toggleJoin(slug: string) {
  const isJoined = !!globalStore.joined[slug];

  try {
    const response = await fetch(
      `${API}/${slug}/join`,
      {
        method: isJoined ? "DELETE" : "POST",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update challenge."
      );
    }

    setStore({
      joined: {
        ...globalStore.joined,
        [slug]: !isJoined,
      },
    });

    window.dispatchEvent(
      new CustomEvent("challenge-updated")
    );
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "Something went wrong."
    );
  }
}

export async function submitProof(
  slug: string,
  file: File
) {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `${API}/${slug}/submissions`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to submit proof."
      );
    }

    const existing = globalStore.submissions[slug] ?? [];

    setStore({
      proofs: {
        ...globalStore.proofs,
        [slug]: data.imageUrl,
      },

      submissions: {
        ...globalStore.submissions,
        [slug]: [data, ...existing],
      },
    });
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to submit proof."
    );
  }
}

export async function deleteSubmission(
  slug: string,
  subId: string
) {
  try {
    const response = await fetch(
      `${API}/${slug}/submissions/${subId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to delete submission."
      );
    }

    const remaining = (
      globalStore.submissions[slug] ?? []
    ).filter((submission) => submission.id !== subId);

    setStore({
      submissions: {
        ...globalStore.submissions,
        [slug]: remaining,
      },

      proofs: {
        ...globalStore.proofs,
        [slug]: null,
      },
    });
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to delete submission."
    );
  }
}

export async function toggleVote(
  slug: string,
  subId: string
) {
  try {
    const response = await fetch(
      `${API}/${slug}/submissions/${subId}/vote`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to vote."
      );
    }

    const key = `${slug}:${subId}`;

    setStore({
      voted: {
        ...globalStore.voted,
        [key]: data.voted,
      },

      submissions: {
        ...globalStore.submissions,
        [slug]: (
          globalStore.submissions[slug] ?? []
        ).map((submission) =>
          submission.id === subId
            ? {
                ...submission,
                votes: data.votes,
              }
            : submission
        ),
      },
    });
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to vote."
    );
  }
}