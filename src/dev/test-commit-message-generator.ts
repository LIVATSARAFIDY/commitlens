import { CommitMessageGenerator } from "../core/generator/commit-message.generator.js";
import type { CommitAnalysis } from "../core/analyzer/analyzer.types.js";

const generator = new CommitMessageGenerator();

const cases: Array<{
    name: string;
    analysis: CommitAnalysis;
}> = [
        {
            name: "Feature in auth",
            analysis: {
                type: {
                    type: "feat",
                    confidence: 97,
                    reasons: ["New source file added"],
                },
                scope: {
                    scope: "auth",
                    confidence: 100,
                    reasons: ["Files belong to auth"],
                },
                changes: [
                    {
                        type: "new_function",
                        score: 25,
                        priority: "primary",
                        reason: "New function detected",
                        subjects: ["registerUser"],
                    },
                ],
            },
        },
        {
            name: "Feature in API",
            analysis: {
                type: {
                    type: "feat",
                    confidence: 95,
                    reasons: ["New endpoint detected"],
                },
                scope: {
                    scope: "api",
                    confidence: 100,
                    reasons: ["Files belong to api"],
                },
                changes: [
                    {
                        type: "new_endpoint",
                        score: 25,
                        priority: "primary",
                        reason: "New endpoint detected",
                        subjects: ["POST /users"],
                    },
                ],
            },
        },
        {
            name: "Feature with multiple scopes",
            analysis: {
                type: {
                    type: "feat",
                    confidence: 82,
                    reasons: ["New source file added"],
                },
                scope: {
                    scope: null,
                    confidence: 60,
                    reasons: ["Multiple scopes detected"],
                },
                changes: [
                    {
                        type: "new_function",
                        score: 25,
                        priority: "primary",
                        reason: "New function detected",
                        subjects: ["login"],
                    },
                ],
            },
        },
        {
            name: "Fix in auth",
            analysis: {
                type: {
                    type: "fix",
                    confidence: 91,
                    reasons: ["Error handling improved"],
                },
                scope: {
                    scope: "auth",
                    confidence: 100,
                    reasons: ["Files belong to auth"],
                },
                changes: [
                    {
                        type: "error_handling",
                        score: 20,
                        priority: "primary",
                        reason: "Error handling improved",
                    },
                ],
            },
        },
        {
            name: "Documentation",
            analysis: {
                type: {
                    type: "docs",
                    confidence: 95,
                    reasons: ["Documentation file modified"],
                },
                scope: {
                    scope: null,
                    confidence: 95,
                    reasons: [],
                },
                changes: [
                ]
            },
        },

        {
            name: "Feature without scope",
            analysis: {
                type: {
                    type: "feat",
                    confidence: 90,
                    reasons: [],
                },
                scope: {
                    scope: null,
                    confidence: 0,
                    reasons: [],
                },
                changes: [
                    {
                        type: "new_class",
                        score: 20,
                        priority: "primary",
                        reason: "New class detected",
                        subjects: ["UserService"],
                    },
                ],
            },
        },
        {
            name: "Unknown type",
            analysis: {
                type: {
                    type: "unknown",
                    confidence: 0,
                    reasons: [],
                },
                scope: {
                    scope: "core",
                    confidence: 90,
                    reasons: [],
                },
                changes: [],
            },
        },

    ];

for (const testCase of cases) {
    const message = generator.generate(testCase.analysis);

    console.log(`\n--- ${testCase.name} ---`);
    console.log(message ?? "No commit message suggestion");
}
