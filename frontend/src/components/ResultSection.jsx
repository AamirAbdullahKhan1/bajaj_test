export default function ResultSection({ result }) {
  if (!result) return null;

  const {
    user_id,
    email_id,
    college_roll_number,
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary
  } = result;

  return (
    <div className="results-container">
      {/* Identity Info */}
      <div className="card" style={{ padding: '1rem', background: 'rgba(79, 70, 229, 0.1)', borderColor: 'rgba(79, 70, 229, 0.2)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.875rem' }}>
          <div><span style={{ color: 'var(--text-muted)' }}>User ID:</span> <strong>{user_id}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <strong>{email_id}</strong></div>
          <div><span style={{ color: 'var(--text-muted)' }}>Roll No:</span> <strong>{college_roll_number}</strong></div>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h2>Summary</h2>
        <div className="summary-stats">
          <div className="stat-box">
            <div className="stat-value">{summary.total_trees}</div>
            <div className="stat-label">Valid Trees</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{summary.total_cycles}</div>
            <div className="stat-label">Cycles Detected</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{summary.largest_tree_root || 'N/A'}</div>
            <div className="stat-label">Largest Root</div>
          </div>
        </div>
      </div>

      <div className="results-grid">
        {/* Hierarchies */}
        <div className="card">
          <h2>Hierarchies</h2>
          {hierarchies.length === 0 ? (
            <p className="subtitle">No valid hierarchies found.</p>
          ) : (
            <div className="hierarchy-list">
              {hierarchies.map((h, i) => (
                <div key={i} className="tree-card">
                  <div className="tree-header">
                    <span className="tree-root">Root: {h.root}</span>
                    {h.has_cycle ? (
                      <span className="badge cycle">Cycle Detected</span>
                    ) : (
                      <span className="badge depth">Depth: {h.depth}</span>
                    )}
                  </div>
                  <div className="tree-body">
                    <pre>
                      {JSON.stringify(h.tree, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Issues Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <h2>Invalid Entries</h2>
            {invalid_entries.length === 0 ? (
              <p className="subtitle">None found.</p>
            ) : (
              <div className="tag-list">
                {invalid_entries.map((entry, i) => (
                  <span key={i} className="tag invalid">{entry || '(empty)'}</span>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <h2>Duplicate Edges</h2>
            {duplicate_edges.length === 0 ? (
              <p className="subtitle">None found.</p>
            ) : (
              <div className="tag-list">
                {duplicate_edges.map((edge, i) => (
                  <span key={i} className="tag duplicate">{edge}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
