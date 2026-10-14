
import type { Command } from "commander";

import { GitService } from "../core/git/git.service.js";
import { CommitAnalyzer } from "../core/analyzer/commit.analyzer.js";
import { CommitMessageGenerator } from "../core/generator/commit-message.generator.js";
import { OllamaCloudClient } from "../ai/ollama-cloud.client.js";

export function registerAnalyzeCommand(program: Command): void {
    program
        .command("analyze")
        .description("Analyze staged Git changes")
        .action(async () => {
            const git = new GitService();
            const analyzer = new CommitAnalyzer();
            const messageGenerator = new CommitMessageGenerator();

            const isRepository = await git.isRepository();

            if (!isRepository) {
                console.error("\n✖ Not inside a Git repository.\n");
                process.exitCode = 1;
                return;
            }

            console.log("\nCommitLens 🔍\n");
            console.log("✓ Git repository detected");

            const changes = await git.getStagedChanges();

            if (changes.files.length === 0) {
                console.log("\nNo staged changes found.\n");
                console.log("Stage your changes first:");
                console.log("  git add <file>\n");
                return;
            }

            console.log(`✓ ${changes.files.length} staged file(s) detected\n`);

            console.log("Files:\n");

            for (const file of changes.files) {
                console.log(`  ${getStatusSymbol(file.status)} ${file.path}`);
            }

            console.log("\nChanges:\n");

            console.log(`  + ${changes.stats.additions} additions`);
            console.log(`  - ${changes.stats.deletions} deletions`);

            const analysis = analyzer.analyze(changes);

            console.log("\nAnalysis:\n");

            console.log(`  Type        ${analysis.type.type}`);
            console.log(`  Confidence  ${analysis.type.confidence}%`);
            console.log(`  Scope       ${analysis.scope.scope ?? "null"}`);
            console.log(`  Confidence  ${analysis.scope.confidence}%`);

            if (analysis.type.reasons.length > 0) {
                console.log("\nReasons:\n");

                for (const reason of analysis.type.reasons) {
                    console.log(`  • ${reason}`);
                }
            }
            if (analysis.changes.length > 0) {
                console.log("\nChange signals:\n");

                for (const change of analysis.changes) {
                    console.log(
                        `  • [${change.type}] ${change.reason}`,
                    );
                }
            }


            const ollama = new OllamaCloudClient();

            let suggestedCommit: string | null = null;
            let suggestionSource = "Ollama Cloud";

            try {
                suggestedCommit = await ollama.suggestCommitMessage(changes.diff);
            } catch (error) {
                console.warn("\nAI unavailable. Using deterministic fallback.");

                if (error instanceof Error) {
                    console.warn(`  Reason: ${error.message}`);
                }

                suggestedCommit = messageGenerator.generate(analysis);
                suggestionSource = "deterministic fallback";
            }

            console.log(`\nSuggested commit (${suggestionSource}):\n`);

            if (suggestedCommit) {
                console.log(`  ${suggestedCommit}`);
            } else {
                console.log("  No reliable commit message suggestion.");
            }

            console.log();

        });
}

function getStatusSymbol(status: string): string {
    switch (status) {
        case "added":
            return "A";

        case "modified":
            return "M";

        case "deleted":
            return "D";

        case "renamed":
            return "R";

        case "copied":
            return "C";

        default:
            return "?";
    }
}
