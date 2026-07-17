import { Link, useRouterState } from "@tanstack/react-router";
import {
  Refrigerator,
  Search,
  CalendarDays,
  Trophy,
  Sparkles,
  Gift,
} from "lucide-react";
import type { ComponentType } from "react";

type NavItem = {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "My Pantry", to: "/", icon: Refrigerator },
  { label: "Recipe Search", to: "/recipes", icon: Search },
  { label: "Meal Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Mystery Box", to: "/mystery-box", icon: Gift },
  { label: "Community Challenges", to: "/challenges", icon: Trophy },
];

export function Sidebar({ pantryCount }: { pantryCount: number }) {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <aside className="lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-card/40 backdrop-blur">
      <div className="flex h-full flex-col p-5">
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-sage text-sage-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">Culinary</h1>
            <p className="text-xs text-muted-foreground mt-1">Diary</p>
          </div>
        </Link>

        <nav className="mt-8 flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-sage-soft text-[oklch(0.32_0.06_145)]"
                    : "text-muted-foreground hover:bg-beige hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden lg:block">
          <div className="rounded-2xl bg-beige p-4">
            <p className="text-xs text-muted-foreground">Pantry items</p>
            <p className="mt-1 font-display text-2xl">{pantryCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fresh & ready to cook
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
