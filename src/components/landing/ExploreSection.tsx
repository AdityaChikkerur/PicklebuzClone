import Link from "next/link";
import {
  BuildingStorefrontIcon,
  SignalIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const EXPLORE_LINKS = [
  {
    href: "/discover",
    label: "Players",
    description: "Find partners and open-match players near you",
    icon: UserGroupIcon,
    color: "text-primary bg-primary/10",
  },
  {
    href: "#featured-tournaments",
    label: "Tournaments",
    description: "Browse featured events and register",
    icon: TrophyIcon,
    color: "text-secondary bg-secondary/10",
  },
  {
    href: "/clubs",
    label: "Clubs",
    description: "Explore courts, amenities, and book slots",
    icon: BuildingStorefrontIcon,
    color: "text-accent bg-accent/10",
  },
  {
    href: "#live-now",
    label: "Live matches",
    description: "Watch scores update in real time",
    icon: SignalIcon,
    color: "text-danger bg-danger/10",
  },
] as const;

export function ExploreSection() {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground">Explore</h2>
        <p className="text-sm text-muted-foreground">
          Jump into the PickleBuzz community
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {EXPLORE_LINKS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="card-base flex items-start gap-3 p-4 transition-colors hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold text-foreground">
                {item.label}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {item.description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
