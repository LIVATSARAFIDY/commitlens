import type {
    ScopeDetection,
} from "../analyzer.types.js";

import type {
    GitFileChange,
} from "../../git/git.types.js";

export class ScopeDetector {
    detect(files: GitFileChange[]): ScopeDetection {
        if (files.length === 0) {
            return {
                scope: null,
                confidence: 0,
                reasons: [],
            };
        }

        const scopes = files
            .map((file) => this.extractScope(file.path))
            .filter((scope): scope is string => scope !== null);

        if (scopes.length === 0) {
            return {
                scope: null,
                confidence: 0,
                reasons: ["No scope could be inferred from file paths"],
            };
        }

        const scopeCounts = new Map<string, number>();

        for (const scope of scopes) {
            scopeCounts.set(
                scope,
                (scopeCounts.get(scope) ?? 0) + 1,
            );
        }

        const sortedScopes = [...scopeCounts.entries()]
            .sort((a, b) => b[1] - a[1]);

        const [bestScope, bestCount] = sortedScopes[0];

        const secondCount = sortedScopes[1]?.[1] ?? 0;

        if (bestCount === secondCount) {
            return {
                scope: null,
                confidence: 0,
                reasons: [
                    "Multiple scopes detected with equal frequency",
                ],
            };
        }

        const confidence = Math.round(
            (bestCount / files.length) * 100,
        );

        return {
            scope: bestScope,
            confidence,
            reasons: [
                `${bestCount} of ${files.length} file(s) belong to "${bestScope}"`,
            ],
        };
    }

    private extractScope(path: string): string | null {
        const normalizedPath = path.replaceAll("\\", "/");

        const parts = normalizedPath.split("/");

        if (parts.length < 2) {
            return null;
        }

        if (parts[0] === "src" && parts.length >= 3) {
            return parts[1];
        }

        return null;
    }
}