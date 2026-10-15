export default function Storage() {

  return (
    <section className="section-page">

      <div className="page-actions">

        <div>
          <div className="section-label">
            STORAGE
          </div>

          <h2 className="section-heading">
            Storage
          </h2>
        </div>

        <span className="tag-warn">
          68% used
        </span>

      </div>


      <div className="section-grid">

        <div className="panel">

          <div className="panel-head">
            <span>Capacity</span>
            <span className="panel-meta">
              2.7 GB / 4 GB
            </span>
          </div>

          <div className="storage-number">
            68%
          </div>

          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: "68%" }}
            />
          </div>

        </div>


        <div className="panel">

          <div className="panel-head">
            <span>Usage</span>
            <span className="panel-meta">4 GB total</span>
          </div>

          <div className="metric-row">
            <span>Notes</span>
            <strong>0.4 GB</strong>
          </div>

          <div className="metric-row">
            <span>Files</span>
            <strong>1.8 GB</strong>
          </div>

          <div className="metric-row">
            <span>Backups</span>
            <strong>0.5 GB</strong>
          </div>

        </div>

      </div>

    </section>
  );
}