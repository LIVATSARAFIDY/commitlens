import { TypeDetector } from "../core/analyzer/detectors/type.detector.js";

const detector = new TypeDetector();

const scenarios = [
    {
        name: "Only tests",
        changes: {
            files: [
                {
                    path: "tests/auth.test.ts",
                    status: "modified" as const,
                },
                {
                    path: "tests/user.test.ts",
                    status: "added" as const,
                },
            ],
            stats: {
                filesChanged: 2,
                additions: 20,
                deletions: 5,
            },
            diff: "",
        },
    },

    {
        name: "Only documentation",
        changes: {
            files: [
                {
                    path: "README.md",
                    status: "modified" as const,
                },
                {
                    path: "docs/api.md",
                    status: "added" as const,
                },
            ],
            stats: {
                filesChanged: 2,
                additions: 30,
                deletions: 2,
            },
            diff: "",
        },
    },

    {
        name: "Feature with tests",
        changes: {
            files: [
                {
                    path: "src/auth/login.ts",
                    status: "added" as const,
                },
                {
                    path: "tests/auth.test.ts",
                    status: "added" as const,
                },
            ],
            stats: {
                filesChanged: 2,
                additions: 50,
                deletions: 0,
            },
            diff: "",
        },
    },

    {
        name: "Possible fix",
        changes: {
            files: [
                {
                    path: "src/auth/login.ts",
                    status: "modified" as const,
                },
            ],
            stats: {
                filesChanged: 1,
                additions: 10,
                deletions: 2,
            },
            diff: `
+if (!user) {
+    throw new Error("User not found");
+}
`,
        },
    },

    {
        name: "New API endpoint",
        changes: {
            files: [
                {
                    path: "src/api/user.controller.ts",
                    status: "modified" as const,
                },
            ],
            stats: {
                filesChanged: 1,
                additions: 15,
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
        name: "Feature with validation and error handling",
        changes: {
            files: [
                {
                    path: "src/api/user.controller.ts",
                    status: "modified" as const,
                },
            ],
            stats: {
                filesChanged: 1,
                additions: 20,
                deletions: 2,
            },
            diff: `
+router.post("/users", async (req, res) => {
+    if (!req.body.email) {
+        throw new Error("Email required");
+    }
+
+    const user = await createUser(req.body);
+    res.json(user);
+});
`,
        },
    },
];

for (const scenario of scenarios) {
    console.log(`\n--- ${scenario.name} ---`);

    const result = detector.detect(scenario.changes);

    console.log(result);
}