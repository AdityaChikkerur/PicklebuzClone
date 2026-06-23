import { AppIcon } from "@/components/ui/AppIcon";
import { APP_NAME } from "@/lib/utils";

const STATS = [
  { value: "12,400+", label: "Active Players" },
  { value: "89,200+", label: "Matches Scored" },
  { value: "340+", label: "Tournaments" },
] as const;

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden min-h-screen w-[480px] shrink-0 overflow-hidden gradient-green lg:flex lg:flex-col xl:w-[540px]">
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
        viewBox="0 0 400 600"
        fill="none"
        aria-hidden="true"
      >
        <rect x="40" y="80" width="320" height="440" rx="8" stroke="white" strokeWidth="2" />
        <line x1="40" y1="300" x2="360" y2="300" stroke="white" strokeWidth="2" />
        <rect x="120" y="80" width="160" height="220" stroke="white" strokeWidth="2" />
        <rect x="120" y="300" width="160" height="220" stroke="white" strokeWidth="2" />
      </svg>

      <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-12">
        <div>
          <div className="mb-10 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <AppIcon size={28} className="text-white" />
            </span>
            <div>
              <p className="text-xl font-extrabold tracking-tight text-white">{APP_NAME}</p>
              <p className="text-sm font-medium text-white/80">Score. Compete. Improve.</p>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white xl:text-4xl">
            Your pickleball journey starts here.
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-white/85">
            Live scoring, verified stats, tournaments, and rankings — everything you need to
            level up your game.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-extrabold tabular-nums text-white">{stat.value}</p>
                <p className="mt-0.5 text-xs font-medium text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
          <div className="mb-2 flex gap-0.5 text-amber-300" aria-label="5 stars">
            {"★★★★★".split("").map((star, i) => (
              <span key={i} className="text-sm">
                {star}
              </span>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-white/90">
            &ldquo;PickleBuzz made running our club tournaments effortless. Players love the live
            scoreboard.&rdquo;
          </p>
          <p className="mt-3 text-xs font-semibold text-white/70">
            Marcus T., Club Organizer · Denver, CO
          </p>
        </div>
      </div>
    </aside>
  );
}
