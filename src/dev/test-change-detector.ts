import { ChangeDetector } from "../core/analyzer/detectors/change.detector.js";

const detector = new ChangeDetector();

function assertSignal(
    scenarioName: string,
    actualTypes: string[],
    expectedTypes: string[],
): void {
    const actual = [...actualTypes].sort();
    const expected = [...expectedTypes].sort();

    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
            [
                `Test failed: ${scenarioName}`,
                `Expected: ${expected.join(", ") || "(none)"}`,
                `Received: ${actual.join(", ") || "(none)"}`,
            ].join("\n"),
        );
    }
}

const scenarios = [
    {
        name: "New functions",
        diff: `
+export function createUser() {
+    return {};
+}
+
+export const deleteUser = () => {
+    return true;
+}
`,
    },

    {
        name: "New class",
        diff: `
+export class UserService {
+}
`,
    },

    {
        name: "Error handling",
        diff: `
+try {
+    const user = await getUser();
+} catch (error) {
+    console.error(error);
+}
`,
    },

    {
        name: "Validation",
        diff: `
+if (!email) {
+    throw new Error("Email is required");
+}
`,
    },

    {
        name: "New endpoint",
        diff: `
+router.post("/users", async (req, res) => {
+    const user = await createUser(req.body);
+    res.json(user);
+});
`,
    },

    {
        name: "Removed function",
        diff: `
-function oldFunction() {
-    return true;
-}
`,
    },

    {
        name: "Removed class",
        diff: `
-class OldUserService {
-}
`,
    },

    {
        name: "Possible fix",
        diff: `
+if (!user) {
+    throw new Error("User not found");
+}
`,
    },
    {
        name: "Error without validation",
        diff: `
+throw new Error("Unexpected server failure");
`,
    },
    {
        name: "Required in comment",
        diff: `
+// The required field is documented here.
+const status = "ready";
`,
    },
    {
        name: "Context line only",
        diff: `
 function existingFunction() {
     return true;
 }
`,
    },
];

for (const scenario of scenarios) {
    console.log(`\n--- ${scenario.name} ---`);

    const signals = detector.detect(scenario.diff);

    if (signals.length === 0) {
        console.log("No signals detected.");
        continue;
    }
    console.dir(signals, { depth: null });
    // for (const signal of signals) {
    //     console.log(
    //         `[${signal.type}] ${signal.priority} +${signal.score} → ${signal.reason}`,
    //     );
    // }
}

const regressionCases = [
    {
        name: "Error without validation",
        diff: `
+throw new Error("Unexpected server failure");
`,
        expected: ["error_handling"],
    },
    {
        name: "Required in comment",
        diff: `
+// The required field is documented here.
+const status = "ready";
`,
        expected: [],
    },
    {
        name: "Context line only",
        diff: `
 function existingFunction() {
     return true;
 }
`,
        expected: [],
    },

    {
        name: "Required in end-of-line comment",
        diff: `
+const status = "ready"; // required field
`,
        expected: [],
    },
    {
        name: "Function declared across multiple lines",
        diff: `
+function createUser(
+    name: string,
+    email: string,
+) {
+    return { name, email };
+}
`,
        expected: ["new_function"],
    },
    {
        name: "Validation keyword in string",
        diff: `
+const message = "required field";
`,
        expected: [],
    },

    {
        name: "Modify existing function without adding or removing it",
        diff: `
 function createUser(name: string, email: string) {
-    return { name, email };
+    const normalizedEmail = email.trim().toLowerCase();
+    return { name, email: normalizedEmail };
 }
`,
        expected: [],
    },


    {
        name: "Modify existing function signature",
        diff: `
-function createUser(name: string) {
+function createUser(name: string, email: string) {
     return { name, email };
 }
`,
        expected: [],
    },

    {
        name: "Add a genuinely new function",
        diff: `
+function sendNotification(userId: string) {
+    return notify(userId);
+}
`,
        expected: ["new_function"],
    },
    {
        name: "Remove an existing function",
        diff: `
-function obsoleteHandler() {
-    return true;
-}
`,
        expected: ["removed_function"],
    },

    {
        name: "Modify existing arrow function signature",
        diff: `
-const createUser = (name: string) => ({ name });
+const createUser = (name: string, email: string) => ({ name, email });
`,
        expected: [],
    },

    {
        name: "Add a genuinely new arrow function",
        diff: `
+const sendNotification = (userId: string) => notify(userId);
`,
        expected: ["new_function"],
    },
    {
        name: "Remove an existing arrow function",
        diff: `
-const obsoleteHandler = () => true;
`,
        expected: ["removed_function"],
    },

    {
        name: "Modify existing class method",
        diff: `
 class UserService {
     createUser(name: string) {
-        return { name };
+        return { name, active: true };
     }
 }
`,
        expected: [],
    },
    {
        name: "Modify existing class method signature",
        diff: `
 class UserService {
-    createUser(name: string) {
+    createUser(name: string, email: string) {
         return { name, email };
     }
 }
`,
        expected: [],
    },

    {
        name: "Add a genuinely new class method",
        diff: `
 class UserService {
+    deleteUser(id: string) {
+        return removeUser(id);
+    }
 }
`,
        expected: ["new_function"],
    },
    {
        name: "Remove an existing class method",
        diff: `
 class UserService {
-    deleteUser(id: string) {
-        return removeUser(id);
-    }
 }
`,
        expected: ["removed_function"],
    },

    {
        name: "Modify existing async class method",
        diff: `
 class UserService {
-    async createUser(name: string) {
+    async createUser(name: string, email: string) {
         return { name, email };
     }
 }
`,
        expected: [],
    },

];

for (const testCase of regressionCases) {
    const signals = detector.detect(testCase.diff);

    assertSignal(
        testCase.name,
        signals.map((signal) => signal.type),
        testCase.expected,
    );

    console.log(`✓ ${testCase.name}`);
}