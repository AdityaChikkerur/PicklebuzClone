"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { MagnifyingGlassIcon, PhoneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatBuzzRating } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { lookupPlayerByPhone } from "@/lib/db/playerLookup";
import {
  formatPhoneDisplay,
  looksLikePhone,
  normalizePhone,
} from "@/lib/phone/normalizePhone";
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
  phone: string | null;
};

type AddMode = "search" | "phone";

export function PlayerSearchDrawer({
  open,
  team,
  selectedPlayerIds,
  onClose,
  onSelect,
}: PlayerSearchDrawerProps) {
  const [mode, setMode] = useState<AddMode>("phone");
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [phoneQuery, setPhoneQuery] = useState("");
  const [guestName, setGuestName] = useState("");
  const [phoneLookup, setPhoneLookup] = useState<Player | null | undefined>(
    undefined
  );
  const [phoneSearching, setPhoneSearching] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setPhoneQuery("");
      setGuestName("");
      setPhoneLookup(undefined);
      setMode("phone");
    }
  }, [open]);

  useEffect(() => {
    if (!open || mode !== "search") return;

    async function loadPlayers() {
      setLoading(true);

      const supabase = createClient();

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, avatar_url, city, skill_level, dupr_rating, phone"
        )
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
            playerRating: profile.dupr_rating ?? 0,
            phone: profile.phone,
          })
        );

        setPlayers(mappedPlayers);
      }

      setLoading(false);
    }

    loadPlayers();
  }, [open, mode]);

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
    const phoneDigits = normalizePhone(query);

    return players.filter((player) => {
      if (selectedPlayerIds.includes(player.id)) return false;
      if (!q) return true;

      const matchesPhone =
        phoneDigits.length >= 6 &&
        player.phone &&
        normalizePhone(player.phone) === phoneDigits;

      return (
        player.fullName.toLowerCase().includes(q) ||
        player.city.toLowerCase().includes(q) ||
        matchesPhone ||
        (player.phone?.includes(q) ?? false)
      );
    });
  }, [query, selectedPlayerIds, players]);

  const handlePhoneLookup = async () => {
    const digits = normalizePhone(phoneQuery);
    if (digits.length < 6) {
      toast.error("Enter a valid phone number");
      return;
    }

    setPhoneSearching(true);
    const result = await lookupPlayerByPhone(phoneQuery);
    setPhoneSearching(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setPhoneLookup(result.data);
  };

  const handleAddGuest = () => {
    const name = guestName.trim();
    const phone = phoneQuery.trim();
    if (!name) {
      toast.error("Enter the player's name");
      return;
    }
    if (normalizePhone(phone).length < 6) {
      toast.error("Enter a valid phone number");
      return;
    }

    const guestPlayer: Player = {
      id: `guest-${normalizePhone(phone)}`,
      fullName: name,
      avatarUrl: null,
      city: "Guest",
      skillLevel: "3.0",
      duprRating: 0,
      playerRating: 0,
      phone,
      isGuest: true,
    };

    onSelect(guestPlayer);
    onClose();
    toast.success(`${name} added — they can join PickleBuzz later`);
  };

  const handleSelectRegistered = (player: Player) => {
    if (selectedPlayerIds.includes(player.id)) return;
    onSelect(player);
    onClose();
  };

  if (!open || !mounted) return null;

  const drawer = (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close player search"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-search-title"
        className="relative z-10 flex max-h-[min(85vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:max-h-[min(80vh,720px)] sm:rounded-2xl"
      >
        <div className="shrink-0 flex items-center justify-between border-b border-border px-4 py-3">
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

        <div className="shrink-0 flex gap-1 border-b border-border px-4 py-2">
          <button
            type="button"
            onClick={() => setMode("phone")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              mode === "phone"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <PhoneIcon className="h-4 w-4" aria-hidden="true" />
            By phone
          </button>
          <button
            type="button"
            onClick={() => setMode("search")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              mode === "search"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
            Search
          </button>
        </div>

        {mode === "phone" ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div>
              <label
                htmlFor="phone-lookup"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Phone number
              </label>
              <div className="flex gap-2">
                <input
                  id="phone-lookup"
                  type="tel"
                  value={phoneQuery}
                  onChange={(e) => {
                    setPhoneQuery(e.target.value);
                    setPhoneLookup(undefined);
                  }}
                  placeholder="98765 43210"
                  className="input-base flex-1"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => void handlePhoneLookup()}
                  disabled={phoneSearching}
                  className="btn-primary shrink-0 text-sm"
                >
                  {phoneSearching ? "…" : "Find"}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Find registered players or add by name or number.
              </p>
            </div>

            {phoneLookup && (
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <button
                  type="button"
                  onClick={() => handleSelectRegistered(phoneLookup)}
                  disabled={selectedPlayerIds.includes(phoneLookup.id)}
                  className="flex w-full items-center gap-3 text-left disabled:opacity-50"
                >
                  <Avatar
                    src={phoneLookup.avatarUrl}
                    name={phoneLookup.fullName}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {phoneLookup.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {phoneLookup.city} · BUZZ{" "}
                      {formatBuzzRating(
                        phoneLookup.playerRating ?? phoneLookup.duprRating
                      )}
                      {phoneLookup.phone
                        ? ` · ${formatPhoneDisplay(phoneLookup.phone)}`
                        : ""}
                    </p>
                  </div>
                  <Badge variant="success">On PickleBuzz</Badge>
                </button>
              </div>
            )}

            {phoneLookup === null && (
              <div className="rounded-xl border border-dashed border-border p-4">
                <p className="text-sm font-medium text-foreground">
                  Not on PickleBuzz yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add them to this match — they can claim their profile when they
                  sign up with {formatPhoneDisplay(phoneQuery) || "this number"}.
                </p>
                <label
                  htmlFor="guest-name"
                  className="mb-1.5 mt-3 block text-xs font-semibold text-foreground"
                >
                  Player name
                </label>
                <input
                  id="guest-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Full name"
                  className="input-base"
                />
                <button
                  type="button"
                  onClick={handleAddGuest}
                  className="btn-primary mt-3 w-full text-sm"
                >
                  Add {guestName.trim() || "player"} to match
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-border px-4 py-3">
              <div className="relative">
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    looksLikePhone(query)
                      ? "Searching by phone…"
                      : "Search players…"
                  }
                  className="input-base pl-9"
                  autoFocus
                />
              </div>
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {loading ? (
                <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading players...
                </li>
              ) : filtered.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No players found. Try the &quot;By phone&quot; tab to add someone
                  new.
                </li>
              ) : (
                filtered.map((player) => (
                  <li key={player.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectRegistered(player)}
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
                          {player.city} · BUZZ{" "}
                          {formatBuzzRating(
                            player.playerRating ?? player.duprRating
                          )}
                          {player.phone
                            ? ` · ${formatPhoneDisplay(player.phone)}`
                            : ""}
                        </p>
                      </div>

                      <Badge variant="outline">{player.skillLevel}</Badge>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(drawer, document.body);
}

export function playerToMatchPlayer(
  player: Player,
  team: Team,
  slotIndex: number,
  serverNumber: MatchPlayer["serverNumber"] = null
): MatchPlayer {
  return {
    id: `${team}-slot-${slotIndex}`,
    playerId: player.isGuest ? `guest-${normalizePhone(player.phone ?? "")}` : player.id,
    fullName: player.fullName,
    avatarUrl: player.avatarUrl,
    team,
    serverNumber,
    isGuest: player.isGuest,
    guestPhone: player.isGuest ? player.phone ?? null : null,
  };
}
