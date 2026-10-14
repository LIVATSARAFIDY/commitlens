import type {
    ChangeSignal,
    ChangeSignalType,
    SignalPriority,
} from "../analyzer/detectors/change.detector.js";

import type {
    CommitAnalysis,
} from "../analyzer/analyzer.types.js";

interface DescriptionRule {
    generate: (subjects?: string[]) => string;
}

const DESCRIPTION_RULES: Partial<
    Record<ChangeSignalType, DescriptionRule>
> = {
    new_endpoint: {
        generate: (subjects) =>
            subjects && subjects.length > 0
                ? `add ${formatSubjects(subjects)} endpoint${subjects.length > 1 ? "s" : ""}`
                : "add endpoint",
    },

    new_class: {
        generate: (subjects) =>
            subjects && subjects.length > 0
                ? `add ${formatSubjects(subjects)} class${subjects.length > 1 ? "es" : ""}`
                : "add class",
    },

    new_function: {
        generate: (subjects) =>
            subjects && subjects.length > 0
                ? `add ${formatSubjects(subjects)} function${subjects.length > 1 ? "s" : ""}`
                : "add function",
    },

    new_method: {
        generate: (subjects) =>
            subjects && subjects.length > 0
                ? `add ${formatSubjects(subjects)} method${subjects.length > 1 ? "s" : ""}`
                : "add method",
    },

    error_handling: {
        generate: () => "improve error handling",
    },

    validation: {
        generate: () => "add input validation",
    },

    removed_class: {
        generate: (subjects) =>
            subjects && subjects.length > 0
                ? `remove ${formatSubjects(subjects)} class${subjects.length > 1 ? "es" : ""}`
                : "remove class",
    },

    removed_function: {
        generate: (subjects) =>
            subjects && subjects.length > 0
                ? `remove ${formatSubjects(subjects)} function${subjects.length > 1 ? "s" : ""}`
                : "remove function",
    },
};

export class DescriptionGenerator {

    generate(analysis: CommitAnalysis): string | null {
        const primarySignal = selectPrimarySignal(
            analysis.changes,
        );

        if (!primarySignal) {
            return getFallbackDescription(analysis.type.type);
        }

        const rule = DESCRIPTION_RULES[primarySignal.type];

        if (!rule) {
            return null;
        }

        return rule.generate(primarySignal.subjects);
    }

}
function formatSubjects(subjects: string[]): string {
    if (subjects.length === 1) {
        return subjects[0];
    }

    if (subjects.length === 2) {
        return `${subjects[0]} and ${subjects[1]}`;
    }

    return `${subjects[0]} and ${subjects.length - 1} others`;
}

function selectPrimarySignal(
    signals: ChangeSignal[],
): ChangeSignal | undefined {
    const priorityRank: Record<SignalPriority, number> = {
        primary: 3,
        secondary: 2,
        context: 1,
    };

    let bestSignal: ChangeSignal | undefined;

    for (const signal of signals) {
        if (!DESCRIPTION_RULES[signal.type]) {
            continue;
        }

        if (!bestSignal) {
            bestSignal = signal;
            continue;
        }

        const currentPriority = priorityRank[signal.priority];
        const bestPriority = priorityRank[bestSignal.priority];

        const hasHigherPriority =
            currentPriority > bestPriority;

        const hasHigherScore =
            currentPriority === bestPriority &&
            signal.score > bestSignal.score;

        const prefersClassOverMethod =
            currentPriority === bestPriority &&
            signal.score === bestSignal.score &&
            signal.type === "new_class" &&
            bestSignal.type === "new_method";

        if (
            hasHigherPriority ||
            hasHigherScore ||
            prefersClassOverMethod
        ) {
            bestSignal = signal;
        }

    }

    return bestSignal;
}

function getFallbackDescription(
    type: CommitAnalysis["type"]["type"],
): string | null {
    switch (type) {
        case "docs":
            return "update documentation";

        case "test":
            return "update tests";

        case "ci":
            return "update CI configuration";

        case "build":
            return "update build configuration";

        case "chore":
            return "update project configuration";

        default:
            return null;
    }
}