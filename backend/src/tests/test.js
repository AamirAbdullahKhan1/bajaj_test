/**
 * Lightweight test runner — no external dependencies needed.
 * Run:  npm test
 */
const { processHierarchy } = require("../services/processHierarchy");

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✔  ${label}`);
    passed++;
  } else {
    console.error(`  ✘  ${label}`);
    failed++;
  }
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ------------------------------------------------------------------
// TEST 1 — Full example from the challenge spec
// ------------------------------------------------------------------
console.log("\nTEST 1: Full example input");
{
  const result = processHierarchy([
    "A->B", "A->C", "B->D", "C->E", "E->F",
    "X->Y", "Y->Z", "Z->X",
    "P->Q", "Q->R",
    "G->H", "G->H", "G->I",
    "hello", "1->2", "A->",
  ]);

  assert(
    deepEqual(result.invalid_entries, ["hello", "1->2", "A->"]),
    "invalid_entries correct"
  );

  assert(
    deepEqual(result.duplicate_edges, ["G->H"]),
    "duplicate_edges correct"
  );

  assert(result.summary.total_trees === 3, "total_trees = 3");
  assert(result.summary.total_cycles === 1, "total_cycles = 1");
  assert(result.summary.largest_tree_root === "A", "largest_tree_root = A");

  // A-tree depth
  const aTree = result.hierarchies.find((h) => h.root === "A");
  assert(aTree && aTree.depth === 4, "A-tree depth = 4");

  // X-group cycle
  const xGroup = result.hierarchies.find((h) => h.root === "X");
  assert(xGroup && xGroup.has_cycle === true, "X-group has_cycle");
  assert(
    xGroup && deepEqual(xGroup.tree, {}),
    "X-group tree is empty object"
  );

  // P-tree depth
  const pTree = result.hierarchies.find((h) => h.root === "P");
  assert(pTree && pTree.depth === 3, "P-tree depth = 3");

  // G-tree depth
  const gTree = result.hierarchies.find((h) => h.root === "G");
  assert(gTree && gTree.depth === 2, "G-tree depth = 2");
}

// ------------------------------------------------------------------
// TEST 2 — Self‑loop is invalid
// ------------------------------------------------------------------
console.log("\nTEST 2: Self-loop");
{
  const result = processHierarchy(["A->A"]);
  assert(
    deepEqual(result.invalid_entries, ["A->A"]),
    "self-loop in invalid_entries"
  );
  assert(result.hierarchies.length === 0, "no hierarchies");
}

// ------------------------------------------------------------------
// TEST 3 — Duplicate edges
// ------------------------------------------------------------------
console.log("\nTEST 3: Triple duplicates");
{
  const result = processHierarchy(["A->B", "A->B", "A->B"]);
  assert(
    deepEqual(result.duplicate_edges, ["A->B"]),
    "duplicate listed once"
  );
  assert(result.hierarchies.length === 1, "one hierarchy");
  assert(result.hierarchies[0].depth === 2, "depth = 2");
}

// ------------------------------------------------------------------
// TEST 4 — Multi-parent (diamond)
// ------------------------------------------------------------------
console.log("\nTEST 4: Multi-parent / diamond");
{
  const result = processHierarchy(["A->D", "B->D"]);
  assert(result.invalid_entries.length === 0, "no invalid entries");
  assert(result.duplicate_edges.length === 0, "no duplicate edges");
  // D's parent should be A (first wins). B->D silently discarded.
  // Because B->D is discarded and B has no other edges, B is ignored completely.
  assert(result.summary.total_trees === 1, "one tree (A-D)");
}

// ------------------------------------------------------------------
// TEST 5 — Empty input
// ------------------------------------------------------------------
console.log("\nTEST 5: Empty array");
{
  const result = processHierarchy([]);
  assert(result.hierarchies.length === 0, "no hierarchies");
  assert(result.summary.total_trees === 0, "total_trees = 0");
  assert(result.summary.total_cycles === 0, "total_cycles = 0");
  assert(result.summary.largest_tree_root === "", "largest_tree_root empty");
}

// ------------------------------------------------------------------
// TEST 6 — Only invalid entries
// ------------------------------------------------------------------
console.log("\nTEST 6: Only invalid entries");
{
  const result = processHierarchy(["hello", "", "AB->C", "1->2"]);
  assert(result.invalid_entries.length === 4, "4 invalid entries");
  assert(result.hierarchies.length === 0, "no hierarchies");
}

// ------------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------------
console.log(`\n${"=".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
