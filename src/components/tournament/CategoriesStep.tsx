"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { cn, formatCurrency, generateId } from "@/lib/utils";
import { SKILL_LEVELS } from "@/types/player";
import {
  CATEGORY_TYPE_LABELS,
  type CategoryType,
  type TournamentCategory,
  type TournamentForm,
} from "@/types/tournament";

interface CategoriesStepProps {
  form: TournamentForm;
  onChange: (values: Partial<TournamentForm>) => void;
}

const CATEGORY_TYPES: CategoryType[] = ["singles", "doubles", "mixed"];

const DEFAULT_DRAFT = {
  categoryType: "doubles" as CategoryType,
  skillLevel: "3.5" as (typeof SKILL_LEVELS)[number],
  maxTeams: 16,
  entryFee: 500,
};

export function CategoriesStep({ form, onChange }: CategoriesStepProps) {
  const [draft, setDraft] = useState(DEFAULT_DRAFT);

  const addCategory = () => {
    const category: TournamentCategory = {
      id: generateId(),
      ...draft,
    };
    onChange({ categories: [...form.categories, category] });
    setDraft(DEFAULT_DRAFT);
  };

  const removeCategory = (id: string) => {
    onChange({ categories: form.categories.filter((c) => c.id !== id) });
  };

  const canAdd = draft.maxTeams >= 2 && draft.entryFee >= 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Categories</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add divisions by format, skill level, and entry fee.
        </p>
      </div>

      {form.categories.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {form.categories.map((category) => (
            <li
              key={category.id}
              className="card-base flex items-start justify-between gap-3 p-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {CATEGORY_TYPE_LABELS[category.categoryType]}
                  </span>
                  <Badge variant="secondary">{category.skillLevel}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Max {category.maxTeams} teams · {formatCurrency(category.entryFee)} entry
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeCategory(category.id)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Remove ${CATEGORY_TYPE_LABELS[category.categoryType]} category`}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card-base border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No categories yet. Add at least one to continue.
          </p>
        </div>
      )}

      <div className="card-base flex flex-col gap-4 p-4">
        <p className="text-sm font-semibold text-foreground">Add category</p>

        <div>
          <p className="mb-2 text-sm font-medium">Type</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_TYPES.map((type) => (
              <Chip
                key={type}
                label={CATEGORY_TYPE_LABELS[type]}
                active={draft.categoryType === type}
                onClick={() => setDraft((prev) => ({ ...prev, categoryType: type }))}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Skill level (DUPR)</p>
          <div className="flex flex-wrap gap-2">
            {SKILL_LEVELS.map((level) => (
              <Chip
                key={level}
                label={level}
                active={draft.skillLevel === level}
                onClick={() => setDraft((prev) => ({ ...prev, skillLevel: level }))}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="max-teams" className="mb-1.5 block text-sm font-medium">
              Max teams
            </label>
            <input
              id="max-teams"
              type="number"
              min={2}
              max={128}
              value={draft.maxTeams}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  maxTeams: Number(e.target.value) || 2,
                }))
              }
              className="input-base"
            />
          </div>

          <div>
            <label htmlFor="entry-fee" className="mb-1.5 block text-sm font-medium">
              Entry fee (₹)
            </label>
            <input
              id="entry-fee"
              type="number"
              min={0}
              step={50}
              value={draft.entryFee}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  entryFee: Number(e.target.value) || 0,
                }))
              }
              className="input-base"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={addCategory}
          disabled={!canAdd}
          className={cn(
            "btn-outline inline-flex w-full items-center justify-center gap-2 sm:w-auto",
            !canAdd && "opacity-50"
          )}
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Add category
        </button>
      </div>
    </div>
  );
}
