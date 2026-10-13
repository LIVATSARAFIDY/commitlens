import { FileClassifier } from "../core/analyzer/file-classifier.js";

const classifier = new FileClassifier();

const files = [
    "src/auth/login.ts",
    "src/auth/login.test.ts",
    "tests/auth.spec.ts",
    "README.md",
    "docs/api.md",
    ".github/workflows/ci.yml",
    ".gitlab-ci.yml",
    "package.json",
    "package-lock.json",
    ".gitignore",
    "tsconfig.json",
    "image.png",
];

for (const file of files) {
    console.log(`${file} → ${classifier.classify(file)}`);
}