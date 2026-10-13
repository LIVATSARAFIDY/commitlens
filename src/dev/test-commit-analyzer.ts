import { CommitAnalyzer } from "../core/analyzer/commit.analyzer.js";
import type { GitStagedChanges } from "../core/git/git.types.js";

const analyzer = new CommitAnalyzer();

const scenarios: {
    name: string;
    changes: GitStagedChanges;
}[] = [
        {
            name: "Feature in auth",
            changes: {
                files: [
                    {
                        path: "src/auth/register.ts",
                        status: "added",
                    },
                    {
                        path: "src/auth/user.ts",
                        status: "modified",
                    },
                ],
                stats: {
                    filesChanged: 2,
                    additions: 20,
                    deletions: 3,
                },
                diff: `
+export function registerUser() {
+    return createUser();
+}
`,
            },
        },
        {
            name: "Feature in API",
            changes: {
                files: [
                    {
                        path: "src/api/users.ts",
                        status: "modified",
                    },
                ],
                stats: {
                    filesChanged: 1,
                    additions: 10,
                    deletions: 2,
                },
                diff: `
+router.post("/users", async (req, res) => {
+    const user = await createUser(req.body);
+    res.json(user);
+});
`,
            },
        },
        {
            name: "Multiple scopes",
            changes: {
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
                stats: {
                    filesChanged: 2,
                    additions: 15,
                    deletions: 5,
                },
                diff: `
+function login() {
+    return authenticate();
+}
`,
            },
        },
    ];

for (const scenario of scenarios) {
    console.log(`\n--- ${scenario.name} ---`);

    const result = analyzer.analyze(scenario.changes);

    console.log(result);
}

