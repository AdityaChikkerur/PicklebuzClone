"use client";

import { useState } from "react";
import { CheckIcon, ClipboardDocumentIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { DEMO_CREDENTIALS, type DemoCredential } from "@/types/player";
import { cn } from "@/lib/utils";

interface DemoCredentialsPanelProps {
  onSelect: (credential: DemoCredential) => void;
  className?: string;
}

export function DemoCredentialsPanel({
  onSelect,
  className,
}: DemoCredentialsPanelProps) {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const copyField = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEmail(text);
      toast.success(`${label} copied`);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className={cn("rounded-xl border border-border bg-muted/30 p-4", className)}>
      <div className="mb-3 flex items-center gap-2">
        <InformationCircleIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs font-bold text-muted-foreground">
          Demo Accounts — click to autofill
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {DEMO_CREDENTIALS.map((cred) => (
          <div
            key={cred.role}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            <button
              type="button"
              onClick={() => {
                onSelect(cred);
                toast.success(`Filled ${cred.label} credentials`);
              }}
              className="flex min-w-0 flex-1 items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
            >
              <span className="shrink-0 rounded-full bg-green-light px-2 py-0.5 text-[10px] font-bold uppercase text-green-dark">
                {cred.label}
              </span>
              <span className="truncate font-mono text-xs text-muted-foreground">
                {cred.email}
              </span>
            </button>
            <button
              type="button"
              onClick={() => copyField(cred.email, "Email")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={`Copy ${cred.email}`}
            >
              {copiedEmail === cred.email ? (
                <CheckIcon className="h-4 w-4 text-primary" />
              ) : (
                <ClipboardDocumentIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
