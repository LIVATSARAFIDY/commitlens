import { DescriptionGenerator } from "../core/generator/description.generator.js";
import type { CommitAnalysis } from "../core/analyzer/analyzer.types.js";

const generator = new DescriptionGenerator();

const scenarios: {
    name: string;
    analysis: CommitAnalysis;
}[] = [
        {
            name: "New endpoint",
            analysis: {
                type: {
                    type: "feat",
                    confidence: 90,
                    reasons: [],
                },
                scope: {
                    scope: "api",
                    confidence: 100,
                    reasons: [],
                },
                changes: [
                    {
                        type: "new_endpoint",
                        score: 25,
                        priority: "primary",
                        reason: "1 new endpoint(s) detected",
                        subjects: ["POST /users"],
                    },
                ],
            },
        },

        {
            name: "New class",
            analysis: {
                type: {
                    type: "feat",
                    confidence: 90,
                    reasons: [],
                },
                scope: {
                    scope: "core",
                    confidence: 100,
                    reasons: [],
                },
                changes: [
                    {
                        type: "new_class",
                        score: 20,
                        priority: "primary",
                        reason: "1 new class(es) detected",
                        subjects: ["UserService"],
                    },
                ],
            },
        },

        {
            name: "New function",
            analysis: {
                type: {
                    type: "feat",
                    confidence: 97,
                    reasons: ["1 new function(s) detected"],
                },
                scope: {
                    scope: "auth",
                    confidence: 100,
                    reasons: ['1 of 1 file(s) belong to "auth"'],
                },
                changes: [
                    {
                        type: "new_function",
                        score: 15,
                        priority: "primary",
                        reason: "1 new function(s) detected",
                        subjects: ["createUser"],
                    },
                ],
            },
        },

        {
            name: "Error handling",
            analysis: {
                type: {
                    type: "fix",
                    confidence: 90,
                    reasons: ["Error handling detected"],
                },
                scope: {
                    scope: "auth",
                    confidence: 100,
                    reasons: ['1 of 1 file(s) belong to "auth"'],
                },
                changes: [
                    {
                        type: "error_handling",
                        score: 20,
                        priority: "secondary",
                        reason: "Error handling detected",
                    },
                ],
            },
        },

        {
            name: "Validation",
            analysis: {
                type: {
                    type: "fix",
                    confidence: 85,
                    reasons: ["Input validation detected"],
                },
                scope: {
                    scope: "api",
                    confidence: 100,
                    reasons: ['1 of 1 file(s) belong to "api"'],
                },
                changes: [
                    {
                        type: "validation",
                        score: 15,
                        priority: "secondary",
                        reason: "Input validation detected",
                    },
                ],
            },
        },

        {
            name: "Removed function",
            analysis: {
                type: {
                    type: "refactor",
                    confidence: 90,
                    reasons: ["1 function removed"],
                },
                scope: {
                    scope: "core",
                    confidence: 100,
                    reasons: ['1 of 1 file(s) belong to "core"'],
                },
                changes: [
                    {
                        type: "removed_function",
                        score: 10,
                        priority: "primary",
                        reason: "1 function(s) removed",
                        subjects: ["oldFunction"],
                    },
                ],
            },
        },

        {
            name: "Removed class",
            analysis: {
                type: {
                    type: "refactor",
                    confidence: 90,
                    reasons: ["1 class removed"],
                },
                scope: {
                    scope: "core",
                    confidence: 100,
                    reasons: ['1 of 1 file(s) belong to "core"'],
                },
                changes: [
                    {
                        type: "removed_class",
                        score: 15,
                        priority: "primary",
                        reason: "1 class(es) removed",
                        subjects: ["OldUserService"],
                    },
                ],
            },
        },

        {
            name: "Primary signal beats secondary signal",
            analysis: {
                type: {
                    type: "feat",
                    confidence: 90,
                    reasons: [
                        "1 new class(es) detected",
                        "Input validation detected",
                    ],
                },
                scope: {
                    scope: "core",
                    confidence: 90,
                    reasons: [],
                },
                changes: [
                    {
                        type: "new_class",
                        score: 20,
                        priority: "primary",
                        reason: "1 new class(es) detected",
                    },
                    {
                        type: "validation",
                        score: 15,
                        priority: "secondary",
                        reason: "Input validation detected",
                    },
                ],
            },
        },

        {
            name: "No changes",
            analysis: {
                type: {
                    type: "unknown",
                    confidence: 0,
                    reasons: [],
                },
                scope: {
                    scope: null,
                    confidence: 0,
                    reasons: [],
                },
                changes: [],
            },
        },
        {
            name: "Multiple functions",
            analysis: {
                type: {
                    type: "feat",
                    confidence: 90,
                    reasons: [],
                },
                scope: {
                    scope: "auth",
                    confidence: 100,
                    reasons: [],
                },
                changes: [
                    {
                        type: "new_function",
                        score: 15,
                        priority: "primary",
                        reason: "2 new function(s) detected",
                        subjects: ["createUser", "deleteUser"],
                    },
                ],
            },
        },

        {
            name: "Priority beats higher score",
            analysis: {
                type: {
                    type: "feat",
                    confidence: 90,
                    reasons: [],
                },
                scope: {
                    scope: "core",
                    confidence: 90,
                    reasons: [],
                },
                changes: [
                    {
                        type: "new_class",
                        score: 15,
                        priority: "primary",
                        reason: "New class detected",
                        subjects: ["UserService"],
                    },
                    {
                        type: "new_endpoint",
                        score: 25,
                        priority: "secondary",
                        reason: "New endpoint detected",
                        subjects: ["POST /users"],
                    },
                ],
            },
        },

        {
            name: "First signal wins on equal priority and score",
            analysis: {
                type: {
                    type: "feat",
                    confidence: 90,
                    reasons: [],
                },
                scope: {
                    scope: "core",
                    confidence: 90,
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
                    {
                        type: "new_endpoint",
                        score: 20,
                        priority: "primary",
                        reason: "New endpoint detected",
                        subjects: ["POST /users"],
                    },
                ],
            },
        },


    ];

for (const scenario of scenarios) {
    const description = generator.generate(scenario.analysis);

    console.log(`\n--- ${scenario.name} ---`);
    console.log(description ?? "No description suggestion");
}