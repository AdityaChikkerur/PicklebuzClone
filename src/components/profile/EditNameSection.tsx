"use client";

import { useEffect, useState } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { updateProfileFullName } from "@/lib/db/profiles";
import { useAuthStore } from "@/store/authStore";

export function EditNameSection() {
  const profile = useAuthStore((s) => s.profile);
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.fullName ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) {
      setName(profile?.fullName ?? "");
    }
  }, [profile?.fullName, editing]);

  if (!profile || !userId) {
    return null;
  }

  const startEditing = () => {
    setName(profile.fullName);
    setEditing(true);
  };

  const cancelEditing = () => {
    setName(profile.fullName);
    setEditing(false);
  };

  const saveName = async () => {
    const trimmed = name.trim();

    if (trimmed === profile.fullName) {
      setEditing(false);
      return;
    }

    setSaving(true);
    const result = await updateProfileFullName(userId, trimmed);
    setSaving(false);

    if (result.error || !result.data) {
      toast.error(result.error ?? "Could not save name");
      return;
    }

    setProfile(result.data);
    setEditing(false);
    toast.success("Name updated");
  };

  return (
    <section
      className="card-base overflow-hidden"
      aria-labelledby="display-name-section-title"
    >
      <div className="border-b border-border bg-muted/30 px-4 py-2.5">
        <h3
          id="display-name-section-title"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Display name
        </h3>
      </div>

      {editing ? (
        <div className="flex flex-col gap-3 px-4 py-4">
          <label htmlFor="profile-display-name" className="sr-only">
            Display name
          </label>
          <input
            id="profile-display-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={80}
            className="input-base"
            placeholder="Your name"
            disabled={saving}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void saveName()}
              disabled={saving || name.trim().length < 2}
              className="btn-primary flex-1 text-sm"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="btn-outline flex-1 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Shown on your profile and matches</p>
            <p className="truncate text-sm font-medium text-foreground">{profile.fullName}</p>
          </div>
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Edit display name"
          >
            <PencilIcon className="h-4 w-4" aria-hidden="true" />
            Edit
          </button>
        </div>
      )}
    </section>
  );
}
