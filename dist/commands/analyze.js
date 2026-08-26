import { GitService } from "../core/git/git.service.js";
export function registerAnalyzeCommand(program) {
    program
        .command("analyze")
        .description("Analyze staged Git changes")
        .action(async () => {
        const git = new GitService();
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
        console.log();
    });
}
function getStatusSymbol(status) {
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
