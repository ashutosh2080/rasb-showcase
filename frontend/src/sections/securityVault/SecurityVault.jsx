export default function SecurityVault() {

  return (
    <section className="section-page">

      <div className="page-actions">

        <div>
          <div className="section-label">
            RESTRICTED AREA
          </div>

          <h2 className="section-heading">
            Security Vault
          </h2>
        </div>

        <span className="tag-danger">
          Locked
        </span>

      </div>


      <div className="section-grid">

        <div className="panel vault-panel">

          <div className="panel-head">
            <span>Vault Status</span>
            <span className="tag-danger">Locked</span>
          </div>

          <div className="card-stat">
            42
          </div>

          <div className="card-stat-label">
            CREDENTIALS SECURED
          </div>

          <div className="chip-row">
            <span className="chip">AES-256-GCM</span>
            <span className="chip">Argon2id</span>
            <span className="chip">Zero-knowledge</span>
          </div>

          <button className="primary-action">
            Unlock Vault
          </button>

        </div>


        <div className="panel">

          <div className="panel-head">
            <span>Security</span>
            <span className="panel-meta">Protected</span>
          </div>

          <div className="metric-row">
            <span>Encryption</span>
            <strong>AES-256-GCM</strong>
          </div>

          <div className="metric-row">
            <span>Password hashing</span>
            <strong>Argon2id</strong>
          </div>

          <div className="metric-row">
            <span>Vault state</span>
            <strong className="status-danger">
              Locked
            </strong>
          </div>

        </div>

      </div>

    </section>
  );
}