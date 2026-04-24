const { validateEdge } = require("../utils/validate");

function processHierarchy(data) {
  const invalidEntries = [];
  const validParsed = [];

  for (const raw of data) {
    const result = validateEdge(raw);
    if (!result.valid) {
      invalidEntries.push(result.trimmed);
    } else {
      validParsed.push(result);
    }
  }

  const seenEdges = new Set();
  const duplicateEdgesSet = new Set();
  const uniqueEdges = [];

  for (const { parent, child, trimmed } of validParsed) {
    const key = `${parent}->${child}`;
    if (seenEdges.has(key)) {
      duplicateEdgesSet.add(key);
    } else {
      seenEdges.add(key);
      uniqueEdges.push({ parent, child });
    }
  }

  const childParentMap = new Map(); 
  const retainedEdges = [];         

  for (const { parent, child } of uniqueEdges) {
    if (!childParentMap.has(child)) {
      childParentMap.set(child, parent);
      retainedEdges.push({ parent, child });
    }
    
  }

  const children = new Map();   
  const allNodes = new Set();
  const childNodes = new Set(); 

  for (const { parent, child } of retainedEdges) {
    allNodes.add(parent);
    allNodes.add(child);
    childNodes.add(child);

    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(child);
  }

  for (const [, kids] of children) {
    kids.sort();
  }

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

  for (const node of allNodes) {
    if (!undirected.has(node)) undirected.set(node, new Set());
  }

  const visited = new Set();
  const components = []; 

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

  const hierarchies = [];

  for (const component of components) {
    const roots = component.filter((n) => !childNodes.has(n));

    let root;
    if (roots.length === 0) {
      root = component[0]; // already sorted
    } else {
      root = roots.sort()[0];
    }

    const hasCycle = detectCycle(root, children, new Set(component));

    if (hasCycle) {
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      const tree = { [root]: buildTreeObj(root, children) };
      const depth = computeDepth(tree);
      hierarchies.push({ root, tree, depth });
    }
  }

  hierarchies.sort((a, b) => a.root.localeCompare(b.root));

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

  for (const node of componentSet) {
    if (color.get(node) === WHITE) {
      if (dfs(node)) return true;
    }
  }

  return false;
}

function buildTreeObj(node, childrenMap) {
  const kids = childrenMap.get(node) || [];
  const subtree = {};

  for (const kid of kids) {
    subtree[kid] = buildTreeObj(kid, childrenMap);
  }

  return subtree;
}

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
