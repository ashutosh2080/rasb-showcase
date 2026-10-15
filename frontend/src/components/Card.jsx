export function Card({ id, title, tag, tagClass, children, onOpen }) {
  return (
    <div className="card" data-section={id}>
      <div className="card-head">
        <div className="card-title">{title}</div>
        {tag && <span className={"card-tag " + tagClass}>{tag}</span>}
      </div>
      {children}
      <button className="card-cta" onClick={onOpen}>
        Open →
      </button>
    </div>
  );
}

export function Bar({ pct }) {
  return (
    <div className="bar-track">
      <div className="bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Row({ k, v }) {
  return (
    <div className="card-row">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}
