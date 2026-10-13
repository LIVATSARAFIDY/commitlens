import { CommitAnalyzer } from "../core/analyzer/commit.analyzer.js";
import { CommitMessageGenerator } from "../core/generator/commit-message.generator.js";
import type { GitStagedChanges } from "../core/git/git.types.js";

const analyzer = new CommitAnalyzer();
const generator = new CommitMessageGenerator();

const changes: GitStagedChanges = {
    files: [
        {
            path: "src/api/users.ts",
            status: "modified",
        },
    ],
    stats: {
        filesChanged: 1,
        additions: 5,
        deletions: 0,
    },
    diff: `
+router.post("/users", async (req, res) => {
+    const user = await createUser(req.body);
+    res.json(user);
+});
`,
};

console.log("\n--- CommitLens integration test ---");

// 1. Analyse les changements Git
const analysis = analyzer.analyze(changes);

console.log("\nAnalysis:");
console.dir(analysis, { depth: null });

// 2. Génère le message final
const message = generator.generate(analysis);

console.log("\nSuggested commit:");
console.log(message ?? "No commit message suggestion");

// 3. Vérifie le résultat attendu
const expected = "feat(api): add POST /users endpoint";

if (message !== expected) {
    throw new Error(
        [
            "Integration test failed.",
            `Expected: ${expected}`,
            `Received: ${message ?? "null"}`,
        ].join("\n"),
    );
}

console.log("\nIntegration test passed!");