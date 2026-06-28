"use client";



import Link from "next/link";

import { useEffect } from "react";

import {

  SignalIcon,

  TrophyIcon,

  UserGroupIcon,

  XMarkIcon,

} from "@heroicons/react/24/outline";

import { PlusCircleIcon } from "@heroicons/react/24/solid";

import { cn } from "@/lib/utils";

import { useAuthStore } from "@/store/authStore";

import type { UserRole } from "@/types/player";



type CreateAction = {

  href: string;

  label: string;

  description: string;

  icon: typeof PlusCircleIcon;

  color: string;

  roles?: UserRole[];

};



const CREATE_ACTIONS: CreateAction[] = [

  {

    href: "/match-setup",

    label: "Create match",

    description: "Set up teams & scoring",

    icon: PlusCircleIcon,

    color: "bg-green-light text-primary border border-primary/20",

    roles: ["player", "referee", "admin"] as UserRole[],

  },

  {

    href: "/live-scoring",

    label: "Live matches",

    description: "Watch ongoing games",

    icon: SignalIcon,

    color: "bg-red-light text-red-brand border border-red-brand/20",

  },

  {

    href: "/discover",

    label: "Find partner",

    description: "Discover players nearby",

    icon: UserGroupIcon,

    color: "bg-muted text-foreground border border-border",

    roles: ["player", "admin"] as UserRole[],

  },

  {

    href: "/create-tournament",

    label: "Create tournament",

    description: "Organize an event",

    icon: TrophyIcon,

    color: "bg-amber-light text-amber-brand border border-amber-brand/20",

    roles: ["organizer", "admin"] as UserRole[],

  },

];



interface CreateActionSheetProps {

  open: boolean;

  onClose: () => void;

}



export function CreateActionSheet({ open, onClose }: CreateActionSheetProps) {

  const role = useAuthStore((s) => s.profile?.role);



  const actions = CREATE_ACTIONS.filter(

    (action) => !action.roles || (role && action.roles.includes(role))

  );



  useEffect(() => {

    if (!open) return;



    const onKey = (e: KeyboardEvent) => {

      if (e.key === "Escape") onClose();

    };



    document.addEventListener("keydown", onKey);

    document.body.style.overflow = "hidden";

    return () => {

      document.removeEventListener("keydown", onKey);

      document.body.style.overflow = "";

    };

  }, [open, onClose]);



  if (!open) return null;



  return (

    <div className="fixed inset-0 z-50 md:hidden">

      <button

        type="button"

        className="absolute inset-0 bg-black/60 backdrop-blur-sm fade-in"

        aria-label="Close create menu"

        onClick={onClose}

      />

      <div

        role="dialog"

        aria-modal="true"

        aria-labelledby="create-sheet-title"

        className="absolute inset-x-0 bottom-0 slide-up rounded-t-3xl glass-strong border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-16px_48px_rgba(0,0,0,0.5)]"

      >

        <div className="mb-4 flex items-center justify-between">

          <h2 id="create-sheet-title" className="font-display text-lg font-black italic text-foreground">

            Create

          </h2>

          <button

            type="button"

            onClick={onClose}

            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"

            aria-label="Close"

          >

            <XMarkIcon className="h-5 w-5" />

          </button>

        </div>



        <ul className="grid gap-2">

          {actions.map((action) => (

            <li key={action.href}>

              <Link

                href={action.href}

                onClick={onClose}

                className="flex items-center gap-3 rounded-xl glass p-3 transition-all duration-200 hover:border-primary/30 hover:shadow-neon-sm"

              >

                <span

                  className={cn(

                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",

                    action.color

                  )}

                >

                  <action.icon className="h-5 w-5" aria-hidden="true" />

                </span>

                <span>

                  <span className="block font-semibold text-foreground">

                    {action.label}

                  </span>

                  <span className="block text-xs text-muted-foreground">

                    {action.description}

                  </span>

                </span>

              </Link>

            </li>

          ))}

        </ul>

      </div>

    </div>

  );

}

