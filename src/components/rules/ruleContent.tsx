import type { ReactNode } from "react";
import {
  DiagonalServeDiagram,
  DoublesScoringDiagram,
  FaultsDiagram,
  KitchenDiagram,
  SideOutDiagram,
  TwoBounceDiagram,
  UnderhandServeDiagram,
} from "./ruleDiagrams";

export interface RuleSection {
  id: string;
  title: string;
  summary: string;
  diagram: ReactNode;
}

export const RULE_SECTIONS: RuleSection[] = [
  {
    id: "two-bounce",
    title: "Two-Bounce Rule",
    summary:
      "After the serve, the ball must bounce once on each side before either team may volley. The receiving team lets the serve bounce, returns it, and the serving team must let that return bounce before hitting it out of the air.",
    diagram: <TwoBounceDiagram className="mx-auto h-auto w-full max-w-sm text-foreground" />,
  },
  {
    id: "kitchen",
    title: "Kitchen / Non-Volley Zone",
    summary:
      "The 7-foot zone on each side of the net is the kitchen. You cannot volley (hit the ball in the air) while standing in the kitchen or touching the kitchen line. You may enter the kitchen to play a ball that has bounced.",
    diagram: <KitchenDiagram className="mx-auto h-auto w-full max-w-sm text-foreground" />,
  },
  {
    id: "underhand-serve",
    title: "Underhand Serve",
    summary:
      "Serves must be hit underhand with the paddle below the wrist. Contact must be below the waist. The serve is diagonal to the opposite service court and must clear the kitchen.",
    diagram: <UnderhandServeDiagram className="mx-auto h-auto w-full max-w-[200px] text-foreground" />,
  },
  {
    id: "diagonal-serve",
    title: "Diagonal Serve",
    summary:
      "In doubles, the first serve of each side-out starts from the right court and goes diagonally to the opponent's right court. The server alternates sides after each point scored (rally scoring) or after each side-out (side-out scoring).",
    diagram: <DiagonalServeDiagram className="mx-auto h-auto w-full max-w-sm text-foreground" />,
  },
  {
    id: "faults",
    title: "Fault Rules",
    summary:
      "A fault ends the rally. Common faults: hitting the ball into the net, out of bounds, volleying from the kitchen, double-bouncing on your side, or a service fault (wrong court, foot fault, illegal serve motion).",
    diagram: <FaultsDiagram className="mx-auto h-auto w-full max-w-sm text-foreground" />,
  },
  {
    id: "doubles-scoring",
    title: "Doubles Scoring Logic",
    summary:
      "In rally scoring, every rally awards a point. In side-out scoring, only the serving team scores. Doubles uses server 1 and server 2 — both partners serve before the serve passes to the opponents, except the very first serve of the game.",
    diagram: <DoublesScoringDiagram className="mx-auto h-auto w-full max-w-sm text-foreground" />,
  },
  {
    id: "side-out",
    title: "Side-Out Explained",
    summary:
      "In side-out scoring, when the receiving team wins the rally, they do not score — they earn a side-out and the serve passes to them. PickleBuzz tracks side-outs automatically when your match uses side-out rules.",
    diagram: <SideOutDiagram className="mx-auto h-auto w-full max-w-sm text-foreground" />,
  },
];
