import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/challenges")({
  component: () => <Outlet />,
  head: () => ({
    meta: [
      { title: "Community Challenges — Culinary Diary" },
      { name: "description", content: "Join trending cooking challenges." },
    ],
  }),
});
