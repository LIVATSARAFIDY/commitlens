import type { ChangeSignal } from "./detectors/change.detector.js";
export type CommitType =
    | "feat"
    | "fix"
    | "refactor"
    | "test"
    | "docs"
    | "style"
    | "perf"
    | "build"
    | "ci"
    | "chore"
    | "revert"
    | "unknown";

export interface TypeDetection {
    type: CommitType;
    confidence: number;
    reasons: string[];
}

export interface ScopeDetection {
    scope: string | null;
    confidence: number;
    reasons: string[];
}

export interface CommitAnalysis {
    type: TypeDetection;
    scope: ScopeDetection;
    changes: ChangeSignal[];
}