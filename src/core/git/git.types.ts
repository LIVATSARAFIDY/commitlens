export type GitFileStatus =
    | "added"
    | "modified"
    | "deleted"
    | "renamed"
    | "copied"
    | "untracked"
    | "unknown";

export interface GitFileChange {
    path: string;
    status: GitFileStatus;
}

export interface GitDiffStats {
    filesChanged: number;
    additions: number;
    deletions: number;
}

export interface GitStagedChanges {
    files: GitFileChange[];
    stats: GitDiffStats;
    diff: string;
}