import type {
    CommitAnalysis,
} from "./analyzer.types.js";

import { TypeDetector } from "./detectors/type.detector.js";
import { ScopeDetector } from "./detectors/scope.detector.js";

import type {
    GitStagedChanges,
} from "../git/git.types.js";

export class CommitAnalyzer {
    private readonly typeDetector = new TypeDetector();
    private readonly scopeDetector = new ScopeDetector();

    analyze(changes: GitStagedChanges): CommitAnalysis {
        const typeResult = this.typeDetector.detect(changes);
        const scope = this.scopeDetector.detect(changes.files);

        return {
            type: typeResult.detection,
            scope,
            changes: typeResult.signals,
        };
    }
}