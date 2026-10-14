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
        expected: ["new_method"],
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
    {
        name: "Add a class with constructor and methods",
        diff: `
+export class ClassTextWithMethod {
+    constructor() { }
+
+    public methodPublic() {
+        this.method1();
+    }
+
+    private method1() {
+        return "method1";
+    }
+}
`,
        expected: ["new_class", "new_method"],
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

const classMethodsDiff = `
+export class ClassTextWithMethod {
+    constructor() { }
+
+    public methodPublic() {
+        this.method1();
+    }
+
+    private method1() {
+        return "method1";
+    }
+}
`;

const classMethodSignals = detector.detect(classMethodsDiff);

const methodSignal = classMethodSignals.find(
    (signal) => signal.type === "new_method",
);

const actualMethods = [...(methodSignal?.subjects ?? [])].sort();
const expectedMethods = ["method1", "methodPublic"].sort();

if (JSON.stringify(actualMethods) !== JSON.stringify(expectedMethods)) {
    throw new Error(
        `Expected methods: ${expectedMethods.join(", ")}\n` +
        `Received methods: ${actualMethods.join(", ") || "(none)"}`,
    );
}

console.log("✓ Detect exact class methods");

const ordinaryFunctionDiff = `
+export function createUser() {
+    return {
+        name: "Alice",
+    };
+}
`;

const ordinaryFunctionSignals = detector.detect(ordinaryFunctionDiff);

const ordinaryFunctionTypes = ordinaryFunctionSignals
    .map((signal) => signal.type)
    .sort();

const expectedOrdinaryFunctionTypes = ["new_function"];

if (
    JSON.stringify(ordinaryFunctionTypes) !==
    JSON.stringify(expectedOrdinaryFunctionTypes)
) {
    throw new Error(
        `Expected signals: ${expectedOrdinaryFunctionTypes.join(", ")}\n` +
        `Received signals: ${ordinaryFunctionTypes.join(", ") || "(none)"}`,
    );
}

console.log("✓ Ordinary function is not detected as a method");

const nestedFunctionDiff = `
+export function processUser() {
+    function validateUser() {
+        return true;
+    }
+
+    return validateUser();
+}
`;

const nestedFunctionSignals = detector.detect(nestedFunctionDiff);
console.log(
    "Nested function signals:",
    nestedFunctionSignals.map((signal) => ({
        type: signal.type,
        subjects: signal.subjects,
    })),
);
const nestedFunctionTypes = nestedFunctionSignals
    .map((signal) => signal.type)
    .sort();

const expectedNestedFunctionTypes = ["new_function"];

if (
    JSON.stringify(nestedFunctionTypes) !==
    JSON.stringify(expectedNestedFunctionTypes)
) {
    throw new Error(
        `Expected signals: ${expectedNestedFunctionTypes.join(", ")}\n` +
        `Received signals: ${nestedFunctionTypes.join(", ") || "(none)"}`,
    );
}

console.log("✓ Nested function is not detected as a method");

