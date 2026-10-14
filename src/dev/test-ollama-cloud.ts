
import { OllamaCloudClient } from "../ai/ollama-cloud.client.js";

const diff = `
diff --git a/src/users/create-user.ts b/src/users/create-user.ts
new file mode 100644
--- /dev/null
+++ b/src/users/create-user.ts
@@ -0,0 +1,5 @@
+export function createUser(name: string) {
+    if (!name.trim()) {
+        throw new Error("Name is required");
+    }
+    return { name };
+}
`;

const client = new OllamaCloudClient();

try {
    const message = await client.suggestCommitMessage(diff);

    console.log("\nAI suggested commit:");
    console.log(message);
} catch (error) {
    console.error(
        "AI analysis failed:",
        error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
}
