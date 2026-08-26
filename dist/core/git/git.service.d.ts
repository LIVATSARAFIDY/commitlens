import type { GitDiffStats, GitFileChange, GitStagedChanges } from "./git.types.js";
export declare class GitService {
    private executeGit;
    isRepository(): Promise<boolean>;
    getStagedFiles(): Promise<GitFileChange[]>;
    getStagedDiff(): Promise<string>;
    getDiffStats(): Promise<GitDiffStats>;
    getStagedChanges(): Promise<GitStagedChanges>;
    private mapStatus;
}
//# sourceMappingURL=git.service.d.ts.map