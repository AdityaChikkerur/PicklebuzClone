import { AppIcon } from "@/components/ui/AppIcon";

const STATS = [
  { value: "12,400+", label: "Active Players" },
  { value: "89,200+", label: "Matches Scored" },
  { value: "340+", label: "Tournaments" },
] as const;

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden min-h-screen w-[480px] shrink-0 overflow-hidden bg-background lg:flex lg:flex-col xl:w-[540px]">
      {/* Neon ambient glow */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Court grid pattern */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
        viewBox="0 0 400 600"
        fill="none"
        aria-hidden="true"
      >
        <rect x="40" y="80" width="320" height="440" rx="8" stroke="#C8FF00" strokeWidth="2" />
        <line x1="40" y1="300" x2="360" y2="300" stroke="#C8FF00" strokeWidth="2" />
        <rect x="120" y="80" width="160" height="220" stroke="#C8FF00" strokeWidth="2" />
        <rect x="120" y="300" width="160" height="220" stroke="#C8FF00" strokeWidth="2" />
      </svg>

      <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-12">
        <div>
          <div className="mb-10 flex items-center gap-4">
            <AppIcon size={52} />
            <div>
              <p className="font-display text-2xl font-black italic leading-none tracking-tight">
                <span className="text-foreground">Pickle</span>
                <span className="text-primary">Buzz</span>
              </p>
              <p className="tagline mt-2 text-primary/70">Play • Connect • Compete</p>
            </div>
          </div>

          <h2 className="font-display text-3xl font-black italic leading-tight tracking-tight text-foreground xl:text-4xl">
            Your pickleball journey{" "}
            <span className="text-gradient-neon">starts here.</span>
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
            Live scoring, verified stats, tournaments, and rankings. Everything you need to
            level up your game.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-xl font-black italic tabular-nums text-primary">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glow p-5">
          <div className="relative z-10">
            <div className="mb-2 flex gap-0.5 text-primary" aria-label="5 stars">
              {"★★★★★".split("").map((star, i) => (
                <span key={i} className="text-sm">
                  {star}
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              &ldquo;PickleBuzz made running our club tournaments effortless. Players love the live
              scoreboard.&rdquo;
            </p>
            <p className="mt-3 text-xs font-semibold text-muted-foreground">
              Priya S., Club Organizer · Mumbai, MH
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
