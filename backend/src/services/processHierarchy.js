const { validateEdge } = require("../utils/validate");

/**
 * Core processing pipeline for the /bfhl endpoint.
 *
 * Steps:
 *   1. Validate & trim each entry
 *   2. Deduplicate edges (first occurrence wins)
 *   3. Apply first‑parent‑wins rule (each child gets at most one parent)
 *   4. Discover connected components (undirected traversal)
 *   5. For each component: find root, detect cycles, build tree, measure depth
 *   6. Assemble summary
 *
 * @param {string[]} data – array of raw edge strings from the request
 * @returns {object} – { hierarchies, invalid_entries, duplicate_edges, summary }
 */
function processHierarchy(data) {
  // ------------------------------------------------------------------
  // 1. VALIDATE
  // ------------------------------------------------------------------
  const invalidEntries = [];
  const validParsed = []; // { parent, child, trimmed }

  for (const raw of data) {
    const result = validateEdge(raw);
    if (!result.valid) {
      invalidEntries.push(result.trimmed);
    } else {
      validParsed.push(result);
    }
  }

  // ------------------------------------------------------------------
  // 2. DEDUPLICATE EDGES
  // ------------------------------------------------------------------
  const seenEdges = new Set();
  const duplicateEdgesSet = new Set();
  const uniqueEdges = []; // retain insertion order

  for (const { parent, child, trimmed } of validParsed) {
    const key = `${parent}->${child}`;
    if (seenEdges.has(key)) {
      duplicateEdgesSet.add(key);
    } else {
      seenEdges.add(key);
      uniqueEdges.push({ parent, child });
    }
  }

  // ------------------------------------------------------------------
  // 3. FIRST‑PARENT‑WINS RULE
  // ------------------------------------------------------------------
  const childParentMap = new Map(); // child → first parent
  const retainedEdges = [];         // edges that survive the rule

  for (const { parent, child } of uniqueEdges) {
    if (!childParentMap.has(child)) {
      childParentMap.set(child, parent);
      retainedEdges.push({ parent, child });
    }
    // else: silently discard (multi‑parent, NOT invalid, NOT duplicate)
  }

  // ------------------------------------------------------------------
  // 4. BUILD DIRECTED ADJACENCY + FIND CONNECTED COMPONENTS
  // ------------------------------------------------------------------
  const children = new Map();   // parent → sorted children list (directed)
  const allNodes = new Set();
  const childNodes = new Set(); // nodes that appear as a child

  for (const { parent, child } of retainedEdges) {
    allNodes.add(parent);
    allNodes.add(child);
    childNodes.add(child);

    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(child);
  }

  // Sort children of each parent lexicographically for deterministic output
  for (const [, kids] of children) {
    kids.sort();
  }

  // Undirected adjacency for component discovery
  const undirected = new Map();
  const addUndirected = (a, b) => {
    if (!undirected.has(a)) undirected.set(a, new Set());
    if (!undirected.has(b)) undirected.set(b, new Set());
    undirected.get(a).add(b);
    undirected.get(b).add(a);
  };

  for (const { parent, child } of retainedEdges) {
    addUndirected(parent, child);
  }

  // Handle isolated nodes (appear only as parent with no children that link back)
  // Every node in allNodes should be present in undirected
  for (const node of allNodes) {
    if (!undirected.has(node)) undirected.set(node, new Set());
  }

  // BFS to find connected components
  const visited = new Set();
  const components = []; // each component is a sorted array of node names

  const sortedNodes = [...allNodes].sort();

  for (const startNode of sortedNodes) {
    if (visited.has(startNode)) continue;

    const component = [];
    const queue = [startNode];
    visited.add(startNode);

    while (queue.length > 0) {
      const current = queue.shift();
      component.push(current);

      for (const neighbor of undirected.get(current) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    component.sort();
    components.push(component);
  }

  // ------------------------------------------------------------------
  // 5. PROCESS EACH COMPONENT
  // ------------------------------------------------------------------
  const hierarchies = [];

  for (const component of components) {
    // Find roots: nodes in this component that are not children
    const roots = component.filter((n) => !childNodes.has(n));

    let root;
    if (roots.length === 0) {
      // Pure cycle — pick lexicographically smallest
      root = component[0]; // already sorted
    } else {
      // Pick lexicographically smallest root
      root = roots.sort()[0];
    }

    // Cycle detection (DFS with recursion‑stack coloring)
    const hasCycle = detectCycle(root, children, new Set(component));

    if (hasCycle) {
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      const tree = { [root]: buildTreeObj(root, children) };
      const depth = computeDepth(tree);
      hierarchies.push({ root, tree, depth });
    }
  }

  // Sort hierarchies deterministically by root
  hierarchies.sort((a, b) => a.root.localeCompare(b.root));

  // ------------------------------------------------------------------
  // 6. SUMMARY
  // ------------------------------------------------------------------
  const validTrees = hierarchies.filter((h) => !h.has_cycle);
  const totalCycles = hierarchies.filter((h) => h.has_cycle).length;

  let largestTreeRoot = "";
  if (validTrees.length > 0) {
    let maxDepth = -1;
    for (const t of validTrees) {
      if (
        t.depth > maxDepth ||
        (t.depth === maxDepth && t.root < largestTreeRoot)
      ) {
        maxDepth = t.depth;
        largestTreeRoot = t.root;
      }
    }
  }

  return {
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: [...duplicateEdgesSet].sort(),
    summary: {
      total_trees: validTrees.length,
      total_cycles: totalCycles,
      largest_tree_root: largestTreeRoot,
    },
  };
}

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------

/**
 * DFS cycle detection using a 3‑color (white/gray/black) scheme.
 * Only considers nodes within `componentSet`.
 */
function detectCycle(start, childrenMap, componentSet) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map();

  for (const node of componentSet) {
    color.set(node, WHITE);
  }

  function dfs(node) {
    color.set(node, GRAY);

    for (const kid of childrenMap.get(node) || []) {
      if (!componentSet.has(kid)) continue;

      const c = color.get(kid);
      if (c === GRAY) return true;  // back edge → cycle
      if (c === WHITE && dfs(kid)) return true;
    }

    color.set(node, BLACK);
    return false;
  }

  // Start DFS from every unvisited node in the component
  // (handles cases where root can't reach all nodes, e.g. pure cycles)
  for (const node of componentSet) {
    if (color.get(node) === WHITE) {
      if (dfs(node)) return true;
    }
  }

  return false;
}

/**
 * Recursively builds a nested‑object tree starting from `node`.
 */
function buildTreeObj(node, childrenMap) {
  const kids = childrenMap.get(node) || [];
  const subtree = {};

  for (const kid of kids) {
    subtree[kid] = buildTreeObj(kid, childrenMap);
  }

  return subtree;
}

/**
 * Returns the depth (number of nodes on the longest root‑to‑leaf path).
 * The input `tree` is a single‑key object like { A: { B: {}, C: {} } }.
 */
function computeDepth(tree) {
  const rootKey = Object.keys(tree)[0];
  const childObj = tree[rootKey];
  const childKeys = Object.keys(childObj);

  if (childKeys.length === 0) return 1;

  let maxChildDepth = 0;
  for (const key of childKeys) {
    const d = computeDepth({ [key]: childObj[key] });
    if (d > maxChildDepth) maxChildDepth = d;
  }

  return 1 + maxChildDepth;
}

module.exports = { processHierarchy };
