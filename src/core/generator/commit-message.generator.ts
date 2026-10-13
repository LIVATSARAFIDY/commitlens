
import type { CommitAnalysis } from "../analyzer/analyzer.types.js";
import { DescriptionGenerator } from "./description.generator.js";

export class CommitMessageGenerator {
    private readonly descriptionGenerator =
        new DescriptionGenerator();

    generate(analysis: CommitAnalysis): string | null {
        const { type, scope } = analysis;

        if (type.type === "unknown") {
            return null;
        }

        const description =
            this.descriptionGenerator.generate(analysis);

        if (!description) {
            return null;
        }

        if (scope.scope) {
            return `${type.type}(${scope.scope}): ${description}`;
        }

        return `${type.type}: ${description}`;
    }
}
