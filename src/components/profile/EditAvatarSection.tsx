"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CameraIcon, PencilIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { updateProfileAvatar } from "@/lib/db/profiles";
import { useAuthStore } from "@/store/authStore";

export function EditAvatarSection() {
  const profile = useAuthStore((s) => s.profile);
  const userId = useAuthStore((s) => s.user?.id ?? s.profile?.id);
  const setProfile = useAuthStore((s) => s.setProfile);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const clearPreview = useCallback(() => {
    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
  }, [avatarPreview]);

  const startEditing = () => {
    clearPreview();
    setEditing(true);
  };

  const cancelEditing = () => {
    clearPreview();
    setEditing(false);
  };

  const onPickPhoto = () => {
    fileInputRef.current?.click();
  };

  const onPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }

    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    event.target.value = "";
  };

  const saveAvatar = async () => {
    if (!userId) return;

    if (!avatarFile) {
      toast.error("Choose a photo first");
      return;
    }

    setSaving(true);
    const result = await updateProfileAvatar(userId, avatarFile);
    setSaving(false);

    if (result.error || !result.data) {
      toast.error(result.error ?? "Could not save photo");
      return;
    }

    setProfile(result.data);
    clearPreview();
    setEditing(false);
    toast.success("Profile photo updated");
  };

  if (!profile || !userId) {
    return null;
  }

  const displaySrc = avatarPreview ?? profile.avatarUrl;

  return (
    <section
      className="card-base overflow-hidden"
      aria-labelledby="profile-photo-section-title"
    >
      <div className="border-b border-border bg-muted/30 px-4 py-2.5">
        <h3
          id="profile-photo-section-title"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Profile photo
        </h3>
      </div>

      {editing ? (
        <div className="flex flex-col items-center gap-4 px-4 py-5">
          <button
            type="button"
            onClick={onPickPhoto}
            className={cn(
              "group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              !avatarPreview && "ring-2 ring-dashed ring-primary/40 ring-offset-2 ring-offset-background"
            )}
            aria-label="Choose profile photo"
          >
            {displaySrc ? (
              <Avatar src={displaySrc} name={profile.fullName} size="xl" ring />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                <CameraIcon className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md">
              <CameraIcon className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Tap the photo to choose a new image (JPG, PNG, or WebP, max 5 MB)
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={onPhotoChange}
          />

          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={() => void saveAvatar()}
              disabled={saving || !avatarFile}
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
          <Avatar src={profile.avatarUrl} name={profile.fullName} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Shown on your profile and matches</p>
            <p className="text-sm font-medium text-foreground">Profile picture</p>
          </div>
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Change profile photo"
          >
            <PencilIcon className="h-4 w-4" aria-hidden="true" />
            Change
          </button>
        </div>
      )}
    </section>
  );
}
