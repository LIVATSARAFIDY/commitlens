import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);
export class GitService {
    async executeGit(args) {
        try {
            const { stdout } = await execFileAsync("git", args, {
                encoding: "utf8",
            });
            return stdout.trim();
        }
        catch (error) {
            throw new Error(`Git command failed: ${args.join(" ")}`);
        }
    }
    async isRepository() {
        try {
            const result = await this.executeGit([
                "rev-parse",
                "--is-inside-work-tree",
            ]);
            return result === "true";
        }
        catch {
            return false;
        }
    }
    async getStagedFiles() {
        const output = await this.executeGit([
            "diff",
            "--cached",
            "--name-status",
        ]);
        if (!output) {
            return [];
        }
        return output.split("\n").map((line) => {
            const [statusCode, ...pathParts] = line.split("\t");
            const path = pathParts.join("\t");
            return {
                path,
                status: this.mapStatus(statusCode),
            };
        });
    }
    async getStagedDiff() {
        return this.executeGit([
            "diff",
            "--cached",
        ]);
    }
    async getDiffStats() {
        const output = await this.executeGit([
            "diff",
            "--cached",
            "--numstat",
        ]);
        if (!output) {
            return {
                filesChanged: 0,
                additions: 0,
                deletions: 0,
            };
        }
        let additions = 0;
        let deletions = 0;
        let filesChanged = 0;
        for (const line of output.split("\n")) {
            const [added, deleted] = line.split("\t");
            const addedLines = Number(added);
            const deletedLines = Number(deleted);
            if (!Number.isNaN(addedLines)) {
                additions += addedLines;
            }
            if (!Number.isNaN(deletedLines)) {
                deletions += deletedLines;
            }
            filesChanged++;
        }
        return {
            filesChanged,
            additions,
            deletions,
        };
    }
    async getStagedChanges() {
        const [files, stats, diff] = await Promise.all([
            this.getStagedFiles(),
            this.getDiffStats(),
            this.getStagedDiff(),
        ]);
        return {
            files,
            stats,
            diff,
        };
    }
    mapStatus(status) {
        switch (status.charAt(0)) {
            case "A":
                return "added";
            case "M":
                return "modified";
            case "D":
                return "deleted";
            case "R":
                return "renamed";
            case "C":
                return "copied";
            default:
                return "unknown";
        }
    }
}
