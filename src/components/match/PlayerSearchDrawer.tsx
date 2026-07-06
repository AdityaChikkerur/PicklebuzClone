"use client";

import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatDupr } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import type { MatchPlayer, Team } from "@/types/match";
import type { Player } from "@/types/player";

interface PlayerSearchDrawerProps {
  open: boolean;
  team: Team;
  selectedPlayerIds: string[];
  onClose: () => void;
  onSelect: (player: Player) => void;
}

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  skill_level: string | null;
  dupr_rating: number | null;
};

export function PlayerSearchDrawer({
  open,
  team,
  selectedPlayerIds,
  onClose,
  onSelect,
}: PlayerSearchDrawerProps) {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    async function loadPlayers() {
      setLoading(true);

      const supabase = createClient();

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, city, skill_level, dupr_rating")
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error loading players:", error);
        setPlayers([]);
      } else {
        const mappedPlayers: Player[] = ((data ?? []) as ProfileRow[]).map(
          (profile) => ({
            id: profile.id,
            fullName: profile.full_name ?? "Unnamed Player",
            avatarUrl: profile.avatar_url ?? null,
            city: profile.city ?? "Unknown",
            skillLevel: (profile.skill_level ?? "3.0") as Player["skillLevel"],
            duprRating: profile.dupr_rating ?? 0,
          })
        );

        setPlayers(mappedPlayers);
      }

      setLoading(false);
    }

    loadPlayers();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return players.filter((player) => {
      if (selectedPlayerIds.includes(player.id)) return false;
      if (!q) return true;

      return (
        player.fullName.toLowerCase().includes(q) ||
        player.city.toLowerCase().includes(q)
      );
    });
  }, [query, selectedPlayerIds, players]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close player search"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-search-title"
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-card shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 id="player-search-title" className="font-bold text-foreground">
              Add player
            </h2>
            <p className="text-xs text-muted-foreground">
              Team {team} · search by name or city
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border px-4 py-3">
          <div className="relative">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search players…"
              className="input-base pl-9"
              autoFocus
            />
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              Loading players...
            </li>
          ) : filtered.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              No players found. Try a different search.
            </li>
          ) : (
            filtered.map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(player);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar
                    src={player.avatarUrl}
                    name={player.fullName}
                    size="md"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {player.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {player.city} · DUPR {formatDupr(player.duprRating)}
                    </p>
                  </div>

                  <Badge variant="outline">{player.skillLevel}</Badge>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export function playerToMatchPlayer(
  player: Player,
  team: Team,
  slotIndex: number,
  serverNumber: MatchPlayer["serverNumber"] = null
): MatchPlayer {
  return {
    id: `${team}-slot-${slotIndex}`,
    playerId: player.id,
    fullName: player.fullName,
    avatarUrl: player.avatarUrl,
    team,
    serverNumber,
  };
}