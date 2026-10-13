import { ScopeDetector } from "../core/analyzer/detectors/scope.detector.js";
import type { GitFileChange } from "../core/git/git.types.js";

const detector = new ScopeDetector();

const scenarios: {
    name: string;
    files: GitFileChange[];
}[] = [
        {
            name: "Single auth file",
            files: [
                {
                    path: "src/auth/login.ts",
                    status: "modified",
                },
            ],
        },
        {
            name: "Multiple auth files",
            files: [
                {
                    path: "src/auth/login.ts",
                    status: "modified",
                },
                {
                    path: "src/auth/register.ts",
                    status: "added",
                },
                {
                    path: "src/auth/user.ts",
                    status: "modified",
                },
            ],
        },
        {
            name: "API files",
            files: [
                {
                    path: "src/api/users.ts",
                    status: "modified",
                },
                {
                    path: "src/api/routes.ts",
                    status: "modified",
                },
            ],
        },
        {
            name: "Multiple scopes",
            files: [
                {
                    path: "src/auth/login.ts",
                    status: "modified",
                },
                {
                    path: "src/api/users.ts",
                    status: "modified",
                },
            ],
        },
        {
            name: "Root file",
            files: [
                {
                    path: "README.md",
                    status: "modified",
                },
            ],
        },
    ];

for (const scenario of scenarios) {
    console.log(`\n--- ${scenario.name} ---`);

    const result = detector.detect(scenario.files);

    console.log(result);
}