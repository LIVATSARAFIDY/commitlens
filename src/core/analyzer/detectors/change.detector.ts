

export type SignalPriority =
    | "primary"
    | "secondary"
    | "context";

export type ChangeSignalType =
    | "new_function"
    | "new_class"
    | "new_method"
    | "error_handling"
    | "validation"
    | "new_endpoint"
    | "removed_function"
    | "removed_class";

export interface ChangeSignal {
    type: ChangeSignalType;
    score: number;
    priority: SignalPriority;
    reason: string;
    subjects?: string[];
}

export class ChangeDetector {

    detect(diff: string): ChangeSignal[] {
        const addedLines = this.getAddedLines(diff);
        const removedLines = this.getRemovedLines(diff);

        const modifiedFunctionNames = this.getModifiedFunctionNames(diff);
        const signals: ChangeSignal[] = [];

        this.detectNewFunctions(addedLines, signals);
        this.detectNewMethods(addedLines, signals);
        this.detectNewClasses(addedLines, signals);
        this.detectErrorHandling(addedLines, signals);
        this.detectValidation(addedLines, signals);
        this.detectNewEndpoints(addedLines, signals);

        this.detectRemovedFunctions(removedLines, signals);
        this.detectRemovedClasses(removedLines, signals);

        return signals
            .map((signal) => {
                if (
                    signal.type !== "new_function" &&
                    signal.type !== "new_method" &&
                    signal.type !== "removed_function"
                ) {
                    return signal;
                }

                const subjects = signal.subjects?.filter(
                    (name) => !modifiedFunctionNames.has(name),
                );

                if (!subjects || subjects.length === 0) {
                    return null;
                }

                return {
                    ...signal,
                    subjects,
                    reason:
                        signal.type === "new_function"
                            ? `${subjects.length} new function(s) detected`
                            : signal.type === "new_method"
                                ? `${subjects.length} new method(s) detected`
                                : `${subjects.length} function(s) removed`,
                };
            })
            .filter((signal) => signal !== null);
    }


    private detectNewFunctions(
        diff: string,
        signals: ChangeSignal[],
    ): void {
        const functionPattern =
            /^\+\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)\s*\(/gm;

        const arrowFunctionPattern =
            /^\+\s*(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>/gm;

        const subjects: string[] = [];

        for (const match of diff.matchAll(functionPattern)) {
            const name = match[1];

            if (name) {
                subjects.push(name);
            }
        }

        for (const match of diff.matchAll(arrowFunctionPattern)) {
            const name = match[1];

            if (name) {
                subjects.push(name);
            }
        }

        if (subjects.length === 0) {
            return;
        }

        signals.push({
            type: "new_function",
            score: 15,
            priority: "primary",
            reason: `${subjects.length} new function(s) detected`,
            subjects,
        });
    }

    private detectNewMethods(
        diff: string,
        signals: ChangeSignal[],
    ): void {
        const methodPattern =
            /^\+\s*(?:(?:public|private|protected|static|async|override)\s+)*([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/gm;

        const excludedNames = new Set([
            "if",
            "for",
            "while",
            "switch",
            "catch",
            "with",
            "constructor",
        ]);

        const subjects: string[] = [];

        for (const match of diff.matchAll(methodPattern)) {
            const name = match[1];

            if (name && !excludedNames.has(name)) {
                subjects.push(name);
            }
        }

        if (subjects.length === 0) {
            return;
        }

        signals.push({
            type: "new_method",
            score: 15,
            priority: "primary",
            reason: `${subjects.length} new method(s) detected`,
            subjects,
        });
    }


    private detectNewClasses(
        diff: string,
        signals: ChangeSignal[],
    ): void {
        const classPattern =
            /^\+\s*(?:export\s+)?(?:default\s+)?class\s+(\w+)/gm;

        const subjects: string[] = [];

        for (const match of diff.matchAll(classPattern)) {
            const name = match[1];

            if (name) {
                subjects.push(name);
            }
        }

        if (subjects.length === 0) {
            return;
        }

        signals.push({
            type: "new_class",
            score: 20,
            priority: "primary",
            reason: `${subjects.length} new class(es) detected`,
            subjects: subjects,
        });
    }

    private detectErrorHandling(
        diff: string,
        signals: ChangeSignal[],
    ): void {
        const tryCatch =
            /^\+.*\btry\s*\{|\+.*\bcatch\s*\(/gm;

        const throwError =
            /^\+.*\bthrow\s+(?:new\s+)?\w*Error\b/gm;

        const tryCatchCount =
            diff.match(tryCatch)?.length ?? 0;

        const throwErrorCount =
            diff.match(throwError)?.length ?? 0;

        if (tryCatchCount > 0 || throwErrorCount > 0) {
            signals.push({
                type: "error_handling",
                score: 20,
                priority: "secondary",
                reason: "Error handling detected",
            });
        }
    }


    private detectValidation(
        diff: string,
        signals: ChangeSignal[],
    ): void {
        const validationPatterns = [
            /\bif\s*\([^)]*!\s*\w+/i,
            /\bvalidate(?:\s*\(|\s+)\w*/i,
            /\bvalidation\b/i,
            /\brequired\b/i,
        ];


        const addedCodeLines = diff
            .split("\n")
            .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
            .map((line) => line.slice(1))
            .filter((line) => !this.isCommentLine(line))
            .map((line) => line.replace(/\/\/.*$/, ""))
            .map((line) => this.removeStringLiterals(line).trim());

        const count = addedCodeLines.reduce(
            (total, line) =>
                total +
                (validationPatterns.some((pattern) => pattern.test(line)) ? 1 : 0),
            0,
        );

        if (count > 0) {
            signals.push({
                type: "validation",
                score: 15,
                priority: "secondary",
                reason: "Input validation detected",
            });
        }
    }



    private getModifiedFunctionNames(diff: string): Set<string> {
        const addedNames = new Set<string>();
        const removedNames = new Set<string>();

        const addedFunctionPatterns = [
            /^\+\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)\s*\(/gm,
            /^\+\s*(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>/gm,
            /^\+\s*(?:(?:public|private|protected|static|async|override)\s+)*([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/gm
        ];

        const removedFunctionPatterns = [
            /^-\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)\s*\(/gm,
            /^-\s*(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>/gm,
            /^\-\s*(?:(?:public|private|protected|static|async|override)\s+)*([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/gm
        ];

        for (const pattern of addedFunctionPatterns) {
            for (const match of diff.matchAll(pattern)) {
                if (match[1]) addedNames.add(match[1]);
            }
        }

        for (const pattern of removedFunctionPatterns) {
            for (const match of diff.matchAll(pattern)) {
                if (match[1]) removedNames.add(match[1]);
            }
        }

        return new Set(
            [...addedNames].filter((name) => removedNames.has(name)),
        );
    }


    private detectNewEndpoints(
        diff: string,
        signals: ChangeSignal[],
    ): void {
        const expressPattern =
            /^\+\s*(?:router|app)\.(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/gim;

        const decoratorPattern =
            /^\+\s*@(Get|Post|Put|Patch|Delete)\s*\(\s*["'`]([^"'`]+)["'`]/gm;

        const subjects: string[] = [];

        for (const match of diff.matchAll(expressPattern)) {
            const method = match[1];
            const path = match[2];

            if (method && path) {
                subjects.push(`${method.toUpperCase()} ${path}`);
            }
        }

        for (const match of diff.matchAll(decoratorPattern)) {
            const method = match[1];
            const path = match[2];

            if (method && path) {
                subjects.push(`${method.toUpperCase()} ${path}`);
            }
        }

        if (subjects.length === 0) {
            return;
        }

        signals.push({
            type: "new_endpoint",
            score: 25,
            priority: "primary",
            reason: `${subjects.length} new endpoint(s) detected`,
            subjects: subjects,
        });
    }


    private detectRemovedFunctions(
        diff: string,
        signals: ChangeSignal[],
    ): void {
        const functionPatterns = [
            /^-\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)\s*\(/gm,
            /^-\s*(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>/gm,
            /^-\s*(?:(?:public|private|protected|static|async|override)\s+)*([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/gm
        ];

        const subjects: string[] = [];

        for (const pattern of functionPatterns) {
            for (const match of diff.matchAll(pattern)) {
                const name = match[1];

                if (name && !subjects.includes(name)) {
                    subjects.push(name);
                }
            }
        }

        if (subjects.length === 0) {
            return;
        }

        signals.push({
            type: "removed_function",
            score: 10,
            priority: "primary",
            reason: `${subjects.length} function(s) removed`,
            subjects,
        });
    }


    private detectRemovedClasses(
        diff: string,
        signals: ChangeSignal[],
    ): void {
        const classPattern =
            /^-\s*(?:export\s+)?(?:default\s+)?class\s+(\w+)/gm;

        const subjects: string[] = [];

        for (const match of diff.matchAll(classPattern)) {
            const name = match[1];

            if (name) {
                subjects.push(name);
            }
        }

        if (subjects.length === 0) {
            return;
        }

        signals.push({
            type: "removed_class",
            score: 15,
            priority: "primary",
            reason: `${subjects.length} class(es) removed`,
            subjects: subjects,
        });
    }
    private getAddedLines(diff: string): string {
        return diff
            .split("\n")
            .map((line) => line.trimStart())
            .filter(
                (line) =>
                    line.startsWith("+") &&
                    !line.startsWith("+++"),
            )
            .join("\n");
    }
    private getRemovedLines(diff: string): string {
        return diff
            .split("\n")
            .map((line) => line.trimStart())
            .filter(
                (line) =>
                    line.startsWith("-") &&
                    !line.startsWith("---"),
            )
            .join("\n");
    }

    private isCommentLine(line: string): boolean {
        return /^\s*(?:\/\/|\/\*|\*|\*\/)/.test(line);
    }


    private removeStringLiterals(line: string): string {
        return line.replace(
            /(["'`])(?:\\.|(?!\1)[^\\])*?\1/g,
            "",
        );
    }

}