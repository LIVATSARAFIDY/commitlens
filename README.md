# CommitLens

**Generate meaningful Git commit messages from staged changes.**

CommitLens is a TypeScript CLI tool that analyzes staged Git changes and suggests clear, consistent commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification.

It combines deterministic analysis with AI-powered suggestions through Ollama Cloud, helping developers write more meaningful commit messages while keeping the final decision in their hands.

## Features

- **Staged changes analysis** — inspect staged files, change statistics, and Git diffs.
- **Deterministic analysis** — identify change patterns and signals to help classify the work.
- **AI-powered suggestions** — generate contextual commit messages using Ollama Cloud.
- **Conventional Commits** — suggest messages using standard types such as `feat`, `fix`, `refactor`, `test`, and `chore`.
- **Fallback mechanism** — use the deterministic generator when the AI service is unavailable.
- **Interactive commit workflow** — review the suggested message, accept it, edit it, or cancel.
- **Safe Git execution** — execute Git commands through Node.js child processes without constructing shell commands from the commit message.

## How it works

```text
Staged Git changes
        |
        v
  Git diff collection
        |
        v
 Deterministic analysis
        |
        v
 AI commit suggestion
 (Ollama Cloud)
        |
        v
 Deterministic fallback
 if AI is unavailable
        |
        v
 Review the suggestion
        |
        +---- Accept ------+
        |                  |
        +---- Edit --------+
        |                  |
        +---- Cancel        |
                           v
                      git commit
```

The deterministic analysis provides an initial understanding of the changes. The AI then uses the actual staged diff to produce a more contextual commit message. If the AI service fails, CommitLens falls back to its deterministic generator.

## Requirements

- Node.js
- Git
- An Ollama Cloud account and API key for AI-powered suggestions

AI suggestions require an internet connection. The deterministic fallback can generate a suggestion without relying on the AI service.

## Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd commitlens
npm install
```

Build the project:

```bash
npm run build
```

## Configuration

Create a `.env` file at the project root:

```env
OLLAMA_API_KEY=your_ollama_cloud_api_key
```

CommitLens uses the `gemma4:cloud` model through the Ollama Cloud API.

Never commit your `.env` file or expose your API key. Keep `.env` excluded from version control and provide a `.env.example` file if you want to document the required configuration.

## Usage

### 1. Stage your changes

```bash
git add src/
```

Review the staged changes before running CommitLens:

```bash
git diff --cached
```

### 2. Analyze the changes

Using the development command:

```bash
npm run dev -- analyze
```

CommitLens analyzes the staged changes and displays a suggested commit message.

### 3. Review and commit

After the suggestion is generated, you can:

- **Press Enter** to accept the suggested message and create the commit.
- **Choose `m`** to enter a custom commit message and commit with it.
- **Choose `a`** to cancel without creating a commit.

Review your staged files carefully before accepting the commit. Git commits all currently staged changes, not just the files analyzed individually.

## Example

Suppose you have staged a new API endpoint and its associated validation.

CommitLens might suggest:

```text
feat(users): add user creation endpoint
```

For changes that reorganize existing code without introducing new functionality, a suggestion might look like:

```text
refactor(auth): simplify authentication flow
```

The exact result depends on the staged diff and the analysis performed.

## Conventional Commits

CommitLens follows the Conventional Commits format:

```text
<type>(<scope>): <description>
```

Common types include:

| Type | Purpose |
|---|---|
| `feat` | Introduce a new feature |
| `fix` | Fix a bug |
| `refactor` | Improve code structure without changing intended behavior |
| `test` | Add or modify tests |
| `docs` | Update documentation |
| `perf` | Improve performance |
| `build` | Change build configuration or dependencies |
| `ci` | Modify CI/CD configuration |
| `chore` | Handle maintenance tasks |

The scope is optional and should reflect the area affected by the changes.

## Technology stack

- **TypeScript** — application logic and type safety
- **Node.js** — CLI runtime
- **Commander** — command-line interface
- **Git** — staged changes and commit execution
- **Ollama Cloud API** — AI-powered commit message generation
- **dotenv** — environment variable configuration

## Design principles

CommitLens focuses on a practical development workflow:

- **Deterministic analysis first** — use explicit rules and detected change signals as a foundation.
- **AI for contextual interpretation** — let the model interpret the staged diff rather than relying only on filenames.
- **Graceful degradation** — preserve a usable workflow when the AI service is unavailable.
- **Developer control** — let the developer review, modify, or reject the proposed message before committing.

## Project status

CommitLens is a personal development project focused on Git tooling, TypeScript CLI design, and the practical integration of AI into developer workflows.

## License

No license has been specified yet. Add a `LICENSE` file if you intend to distribute the project for reuse.
