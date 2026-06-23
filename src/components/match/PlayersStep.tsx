"use client";

import { useState } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { MatchPlayer, MatchSetupState, Team } from "@/types/match";
import type { Player } from "@/types/player";
import {
  PlayerSearchDrawer,
  playerToMatchPlayer,
} from "./PlayerSearchDrawer";
import { playersPerTeam } from "./validation";

interface PlayersStepProps {
  setup: MatchSetupState;
  onChange: (values: Partial<MatchSetupState>) => void;
}

interface ActiveSlot {
  team: Team;
  slotIndex: number;
}

function TeamPanel({
  team,
  teamName,
  players,
  slots,
  onTeamNameChange,
  onAddClick,
  onRemove,
}: {
  team: Team;
  teamName: string;
  players: MatchPlayer[];
  slots: number;
  onTeamNameChange: (name: string) => void;
  onAddClick: (slotIndex: number) => void;
  onRemove: (playerId: string) => void;
}) {
  return (
    <div className="card-base flex flex-col gap-4 p-4">
      <div>
        <label
          htmlFor={`team-${team}-name`}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Team {team} name
        </label>
        <input
          id={`team-${team}-name`}
          type="text"
          value={teamName}
          onChange={(e) => onTeamNameChange(e.target.value)}
          className="input-base font-semibold"
          placeholder={`Team ${team}`}
        />
      </div>

      <div
        className={cn(
          "grid gap-3",
          slots === 1 ? "grid-cols-1" : "grid-cols-2"
        )}
      >
        {Array.from({ length: slots }).map((_, index) => {
          const player = players.find(
            (p) => p.team === team && p.id === `${team}-slot-${index}`
          );
          return (
            <div key={`${team}-slot-${index}`} className="flex flex-col items-center gap-2">
              {player ? (
                <div className="relative">
                  <Avatar
                    src={player.avatarUrl}
                    name={player.fullName}
                    size="lg"
                    ring
                  />
                  <button
                    type="button"
                    onClick={() => onRemove(player.id)}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Remove ${player.fullName}`}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onAddClick(index)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted text-muted-foreground transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Add player to Team ${team} slot ${index + 1}`}
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              )}
              <span className="max-w-[6rem] truncate text-center text-xs text-muted-foreground">
                {player?.fullName ?? "Add player"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PlayersStep({ setup, onChange }: PlayersStepProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null);

  const slots = playersPerTeam(setup.matchType);
  const selectedIds = setup.players.map((p) => p.playerId);

  const openDrawer = (team: Team, slotIndex: number) => {
    setActiveSlot({ team, slotIndex });
    setDrawerOpen(true);
  };

  const removePlayer = (playerId: string) => {
    onChange({
      players: setup.players.filter((p) => p.id !== playerId),
    });
  };

  const addPlayer = (player: Player) => {
    if (!activeSlot) return;

    const { team, slotIndex } = activeSlot;
    const slotId = `${team}-slot-${slotIndex}`;

    const nextPlayers = [
      ...setup.players.filter(
        (p) => p.id !== slotId && p.playerId !== player.id
      ),
      playerToMatchPlayer(player, team, slotIndex),
    ];

    onChange({ players: nextPlayers });
    setActiveSlot(null);
  };

  const filled = setup.players.length;
  const required = slots * 2;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Players</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add {required} player{required > 1 ? "s" : ""} and set team names.
          <span className="ml-1 font-medium text-foreground">
            {filled}/{required} added
          </span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TeamPanel
          team="A"
          teamName={setup.teamAName}
          players={setup.players}
          slots={slots}
          onTeamNameChange={(name) => onChange({ teamAName: name })}
          onAddClick={(index) => openDrawer("A", index)}
          onRemove={removePlayer}
        />
        <TeamPanel
          team="B"
          teamName={setup.teamBName}
          players={setup.players}
          slots={slots}
          onTeamNameChange={(name) => onChange({ teamBName: name })}
          onAddClick={(index) => openDrawer("B", index)}
          onRemove={removePlayer}
        />
      </div>

      <PlayerSearchDrawer
        open={drawerOpen}
        team={activeSlot?.team ?? "A"}
        selectedPlayerIds={selectedIds}
        onClose={() => {
          setDrawerOpen(false);
          setActiveSlot(null);
        }}
        onSelect={addPlayer}
      />
    </div>
  );
}