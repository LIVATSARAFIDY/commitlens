export type FileCategory =
    | "source"
    | "test"
    | "documentation"
    | "ci"
    | "build"
    | "config"
    | "unknown";

export class FileClassifier {
    classify(path: string): FileCategory {
        const normalizedPath = path.toLowerCase();

        if (this.isTestFile(normalizedPath)) {
            return "test";
        }

        if (this.isDocumentationFile(normalizedPath)) {
            return "documentation";
        }

        if (this.isCiFile(normalizedPath)) {
            return "ci";
        }

        if (this.isBuildFile(normalizedPath)) {
            return "build";
        }

        if (this.isConfigFile(normalizedPath)) {
            return "config";
        }

        if (this.isSourceFile(normalizedPath)) {
            return "source";
        }

        return "unknown";
    }

    private isTestFile(path: string): boolean {
        return (
            path.includes("/test/") ||
            path.includes("/tests/") ||
            path.includes("__tests__/") ||
            path.startsWith("test/") ||
            path.startsWith("tests/") ||
            path.endsWith(".test.ts") ||
            path.endsWith(".test.tsx") ||
            path.endsWith(".test.js") ||
            path.endsWith(".test.jsx") ||
            path.endsWith(".spec.ts") ||
            path.endsWith(".spec.tsx") ||
            path.endsWith(".spec.js") ||
            path.endsWith(".spec.jsx")
        );
    }

    private isDocumentationFile(path: string): boolean {
        return (
            path.endsWith(".md") ||
            path.startsWith("docs/") ||
            path.includes("/docs/")
        );
    }

    private isCiFile(path: string): boolean {
        return (
            path.startsWith(".github/workflows/") ||
            path === ".gitlab-ci.yml" ||
            path.includes("/.circleci/") ||
            path === "jenkinsfile" ||
            path.endsWith("jenkinsfile")
        );
    }

    private isBuildFile(path: string): boolean {
        const buildFiles = [
            "package.json",
            "package-lock.json",
            "yarn.lock",
            "pnpm-lock.yaml",
            "vite.config.ts",
            "vite.config.js",
            "webpack.config.js",
            "webpack.config.ts",
            "rollup.config.js",
            "rollup.config.ts",
            "dockerfile",
            "docker-compose.yml",
            "docker-compose.yaml",
        ];

        return buildFiles.includes(path);
    }

    private isConfigFile(path: string): boolean {
        return (
            path === ".gitignore" ||
            path === ".editorconfig" ||
            path === ".nvmrc" ||
            path.includes(".prettierrc") ||
            path.includes("eslint") ||
            path.startsWith("tsconfig")
        );
    }

    private isSourceFile(path: string): boolean {
        const sourceExtensions = [
            ".ts",
            ".tsx",
            ".js",
            ".jsx",
            ".mjs",
            ".cjs",
            ".py",
            ".java",
            ".php",
            ".go",
            ".rs",
            ".c",
            ".cpp",
            ".cs",
        ];

        return sourceExtensions.some((extension) =>
            path.endsWith(extension),
        );
    }
}