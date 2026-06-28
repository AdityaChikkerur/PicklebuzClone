import type { ReactNode } from "react";

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

export interface LegalDocument {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: LegalSection[];
}
