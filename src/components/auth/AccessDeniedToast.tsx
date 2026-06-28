"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

function AccessDeniedToastInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("access") !== "denied") return;

    toast.error("You don't have access to that page.");

    const url = new URL(window.location.href);
    url.searchParams.delete("access");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, [searchParams]);

  return null;
}

/** Shows a toast when middleware redirects with ?access=denied */
export function AccessDeniedToast() {
  return (
    <Suspense fallback={null}>
      <AccessDeniedToastInner />
    </Suspense>
  );
}
