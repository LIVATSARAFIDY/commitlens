import type {
    CommitType,
    TypeDetection,
} from "../analyzer.types.js";

import {
    FileClassifier,
    type FileCategory,
} from "../file-classifier.js";

import type {
    GitFileChange,
    GitFileStatus,
    GitStagedChanges,
} from "../../git/git.types.js";

import {
    ChangeDetector,
    type ChangeSignal,
} from "./change.detector.js";

interface TypeScore {
    type: CommitType;
    score: number;
    reasons: string[];
}

interface ClassifiedFile {
    path: string;
    status: GitFileStatus;
    category: FileCategory;
}

export interface TypeDetectionResult {
    detection: TypeDetection;
    signals: ChangeSignal[];
}

export class TypeDetector {
    private readonly classifier = new FileClassifier();
    private readonly changeDetector = new ChangeDetector();

    detect(changes: GitStagedChanges): TypeDetectionResult {
        const files = this.classifyFiles(changes.files);

        const exclusiveResult = this.detectExclusiveCategory(files);

        if (exclusiveResult) {
            return {
                detection: exclusiveResult,
                signals: [],
            };
        }

        const scores = this.initializeScores();

        this.analyzeFiles(files, scores);

        const signals = this.changeDetector.detect(changes.diff);

        this.applyChangeSignals(signals, scores);

        this.analyzeDiff(changes.diff, scores);

        const best = this.getBestScore(scores);

        return {
            detection: {
                type: best.type,
                confidence: this.calculateConfidence(scores),
                reasons: best.reasons,
            },
            signals,
        };
    }

    private classifyFiles(
        files: GitFileChange[],
    ): ClassifiedFile[] {
        return files.map((file) => ({
            path: file.path,
            status: file.status,
            category: this.classifier.classify(file.path),
        }));
    }

    private detectExclusiveCategory(
        files: ClassifiedFile[],
    ): TypeDetection | null {
        if (files.length === 0) {
            return null;
        }

        const categories = files.map((file) => file.category);

        if (categories.every((category) => category === "test")) {
            return {
                type: "test",
                confidence: 95,
                reasons: ["All staged files are test files"],
            };
        }

        if (
            categories.every(
                (category) => category === "documentation",
            )
        ) {
            return {
                type: "docs",
                confidence: 95,
                reasons: ["All staged files are documentation files"],
            };
        }

        if (categories.every((category) => category === "ci")) {
            return {
                type: "ci",
                confidence: 95,
                reasons: ["All staged files are CI files"],
            };
        }

        if (categories.every((category) => category === "build")) {
            return {
                type: "build",
                confidence: 95,
                reasons: ["All staged files are build/dependency files"],
            };
        }

        if (categories.every((category) => category === "config")) {
            return {
                type: "chore",
                confidence: 90,
                reasons: ["All staged files are configuration files"],
            };
        }

        return null;
    }

    private initializeScores(): Map<CommitType, TypeScore> {
        const types: CommitType[] = [
            "feat",
            "fix",
            "refactor",
            "test",
            "docs",
            "style",
            "perf",
            "build",
            "ci",
            "chore",
            "revert",
            "unknown",
        ];

        return new Map(
            types.map((type) => [
                type,
                {
                    type,
                    score: 0,
                    reasons: [],
                },
            ]),
        );
    }

    private analyzeFiles(
        files: ClassifiedFile[],
        scores: Map<CommitType, TypeScore>,
    ): void {
        for (const file of files) {
            this.analyzeFile(file, scores);
        }
    }

    private analyzeFile(
        file: ClassifiedFile,
        scores: Map<CommitType, TypeScore>,
    ): void {
        switch (file.category) {
            case "source":
                this.analyzeSourceFile(file, scores);
                break;

            case "test":
                this.addScore(
                    scores,
                    "test",
                    10,
                    `Test file modified: ${file.path}`,
                );
                break;

            case "documentation":
                this.addScore(
                    scores,
                    "docs",
                    10,
                    `Documentation file modified: ${file.path}`,
                );
                break;

            case "ci":
                this.addScore(
                    scores,
                    "ci",
                    15,
                    `CI file modified: ${file.path}`,
                );
                break;

            case "build":
                this.addScore(
                    scores,
                    "build",
                    15,
                    `Build/dependency file modified: ${file.path}`,
                );
                break;

            case "config":
                this.addScore(
                    scores,
                    "chore",
                    10,
                    `Configuration file modified: ${file.path}`,
                );
                break;

            case "unknown":
                break;
        }
    }

    private analyzeSourceFile(
        file: ClassifiedFile,
        scores: Map<CommitType, TypeScore>,
    ): void {
        if (file.status === "added") {
            this.addScore(
                scores,
                "feat",
                15,
                `New source file added: ${file.path}`,
            );
        }

        if (file.status === "deleted") {
            this.addScore(
                scores,
                "refactor",
                10,
                `Source file removed: ${file.path}`,
            );
        }

        if (file.status === "modified") {
            this.addScore(
                scores,
                "unknown",
                1,
                `Source file modified: ${file.path}`,
            );
        }
    }

    private analyzeDiff(
        diff: string,
        scores: Map<CommitType, TypeScore>,
    ): void {
        const normalizedDiff = diff.toLowerCase();

        if (
            normalizedDiff.includes("refactor") ||
            normalizedDiff.includes("extract")
        ) {
            this.addScore(
                scores,
                "refactor",
                15,
                "Refactoring-related changes detected in diff",
            );
        }

        if (
            normalizedDiff.includes("performance") ||
            normalizedDiff.includes("optimize") ||
            normalizedDiff.includes("optimization")
        ) {
            this.addScore(
                scores,
                "perf",
                15,
                "Performance-related changes detected in diff",
            );
        }

        if (
            normalizedDiff.includes("revert") ||
            normalizedDiff.includes("reverted")
        ) {
            this.addScore(
                scores,
                "revert",
                30,
                "Revert-related changes detected in diff",
            );
        }
    }

    private applyChangeSignals(
        signals: ChangeSignal[],
        scores: Map<CommitType, TypeScore>,
    ): void {
        for (const signal of signals) {
            switch (signal.type) {
                case "new_function":
                case "new_class":
                case "new_endpoint":
                    this.applySignalScore(
                        scores,
                        "feat",
                        signal,
                    );
                    break;

                case "error_handling":
                case "validation":
                    this.applySignalScore(
                        scores,
                        "fix",
                        signal,
                    );
                    break;

                case "removed_function":
                case "removed_class":
                    this.applySignalScore(
                        scores,
                        "refactor",
                        signal,
                    );
                    break;
            }
        }
    }

    private addScore(
        scores: Map<CommitType, TypeScore>,
        type: CommitType,
        points: number,
        reason: string,
    ): void {
        const result = scores.get(type);

        if (!result) {
            return;
        }

        result.score += points;
        result.reasons.push(reason);
    }

    private getBestScore(
        scores: Map<CommitType, TypeScore>,
    ): TypeScore {
        return [...scores.values()].reduce((best, current) => {
            return current.score > best.score
                ? current
                : best;
        });
    }

    private calculateConfidence(
        scores: Map<CommitType, TypeScore>,
    ): number {
        const sorted = [...scores.values()]
            .map((result) => result.score)
            .sort((a, b) => b - a);

        const highest = sorted[0] ?? 0;
        const secondHighest = sorted[1] ?? 0;

        if (highest === 0) {
            return 0;
        }

        if (highest === secondHighest) {
            return 50;
        }

        const confidence =
            (highest / (highest + secondHighest)) * 100;

        return Math.round(Math.min(confidence, 100));
    }

    private applySignalScore(
        scores: Map<CommitType, TypeScore>,
        type: CommitType,
        signal: ChangeSignal,
    ): void {
        let score = signal.score;

        if (signal.priority === "secondary") {
            score *= 0.5;
        }

        if (signal.priority === "context") {
            score *= 0.25;
        }

        this.addScore(
            scores,
            type,
            score,
            signal.reason,
        );
    }
}