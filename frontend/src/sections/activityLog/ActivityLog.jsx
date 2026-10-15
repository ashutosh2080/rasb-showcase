export default function ActivityLog() {

  return (
    <section className="section-page">

      <div className="page-actions">

        <div>
          <div className="section-label">
            SYSTEM EVENTS
          </div>

          <h2 className="section-heading">
            Activity Log
          </h2>
        </div>

        <span className="tag-ok live-tag">
          Live
        </span>

      </div>


      <div className="panel">

        <div className="panel-head">
          <span>Recent Activity</span>
          <span className="panel-meta">Last 24 hours</span>
        </div>

        <div className="log-item">
          <div>
            <strong>Vault access</strong>
            <span>GET /api/vault/unlock</span>
          </div>

          <span className="log-status">200 · 41ms</span>
        </div>

        <div className="log-item">
          <div>
            <strong>Dashboard access</strong>
            <span>GET /api/dashboard</span>
          </div>

          <span className="log-status">200 · 28ms</span>
        </div>

        <div className="log-item">
          <div>
            <strong>Authentication</strong>
            <span>Successful login</span>
          </div>

          <span className="log-status">200</span>
        </div>

        <div className="log-item">
          <div>
            <strong>Failed attempts</strong>
            <span>Last 24 hours</span>
          </div>

          <span className="status-ok">0</span>
        </div>

      </div>

    </section>
  );
}