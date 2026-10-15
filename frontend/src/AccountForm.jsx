import { useState, useEffect, useRef } from "react";
import "./AccountForm.css";

/* ============================================================
   SHARED CONSTANTS — reuse these anywhere you list/filter accounts
   ============================================================ */

export const CATEGORIES = [
  { id: "social", label: "Social Media & Networking" },
  { id: "work", label: "Work & Professional" },
  { id: "education", label: "Education & Learning" },
  { id: "devinfra", label: "Development & Infrastructure" },
  { id: "storage", label: "Cloud Storage & Productivity" },
  { id: "finance", label: "Finance & Subscriptions" },
  { id: "community", label: "Communities & Forums" },
  { id: "entertainment", label: "Entertainment & Media" },
  { id: "other", label: "Other Sites & Misc" },
];

export const ACCOUNT_TYPES = [
  { id: "personal", label: "Personal" },
  { id: "work", label: "Work" },
  { id: "professional", label: "Professional" },
  { id: "other", label: "Other" },
];

export const PAYMENT_MODES = [
  "Credit Card",
  "Debit Card",
  "UPI",
  "PayPal",
  "Bank Transfer",
  "Other",
];

export const BILLING_CYCLES = ["Monthly", "Yearly", "One-time", "Free"];

export const SWATCHES = [
  "#6366f1", "#22c55e", "#eab308", "#ef4444",
  "#06b6d4", "#ec4899", "#8b5cf6", "#f97316",
];

// Finance & Subscriptions gets an extra billing block. Add more category
// ids here if another section later needs its own conditional fields.
const CATEGORIES_WITH_BILLING = ["finance"];

function emptyForm(defaultCategory) {
  return {
    name: "",
    username: "",
    link: "",
    description: "",
    category: defaultCategory || CATEGORIES[0].id,
    type: "personal",
    status: "connected",
    dateAdded: new Date().toISOString().slice(0, 10),
    tags: "",
    notes: "",
    twoFactor: false,
    color: SWATCHES[0],
    paymentMode: "",
    billingCycle: "",
    renewalDate: "",
    amount: "",
    currency: "USD",
  };
}

/* ============================================================
   ACCOUNT FORM — used for both Add and Edit.
   mode: "add" | "edit"
   initialData: existing account object, required when mode === "edit"
   defaultCategory: pre-select a category when adding from inside a
                     specific section (e.g. opened from the Finance page)
   ============================================================ */

export default function AccountForm({
  mode = "add",
  initialData = null,
  defaultCategory = null,
  open,
  onClose,
  onSubmit,
  onDelete,
}) {
  const [form, setForm] = useState(() =>
    mode === "edit" && initialData
      ? { ...emptyForm(defaultCategory), ...initialData }
      : emptyForm(defaultCategory)
  );

  // Reset the form whenever it's opened fresh (new account, or a
  // different account is being edited).
  useEffect(() => {
    if (!open) return;
    setForm(
      mode === "edit" && initialData
        ? { ...emptyForm(defaultCategory), ...initialData }
        : emptyForm(defaultCategory)
    );
  }, [open, mode, initialData, defaultCategory]);

  if (!open) return null;

  const showBilling = CATEGORIES_WITH_BILLING.includes(form.category);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return; // minimal guard — name is required
    onSubmit({
      ...form,
      id: initialData?.id ?? crypto.randomUUID(),
    });
  }

  return (
    <div className="af-overlay" onMouseDown={onClose}>
      <div
        className="af-panel"
        role="dialog"
        aria-modal="true"
        aria-label={mode === "edit" ? "Edit account" : "Add account"}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="af-head">
          <div>
            <div className="af-eyebrow">DIGITAL IDENTITY</div>
            <h2 className="af-title">
              {mode === "edit" ? "Edit Account" : "Add Account"}
            </h2>
          </div>
          <button type="button" className="af-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form className="af-form" onSubmit={handleSubmit}>
          <div className="af-scroll">
            {/* ---------- Identity ---------- */}
            <div className="af-row-2">
              <div className="af-field">
                <label>Account name</label>
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Instagram"
                  autoFocus
                  required
                />
              </div>
              <div className="af-field">
                <label>Username / handle</label>
                <input
                  value={form.username}
                  onChange={(e) => update("username", e.target.value)}
                  placeholder="@yourusername"
                />
              </div>
            </div>

            <div className="af-field">
              <label>Link to site</label>
              <input
                type="url"
                value={form.link}
                onChange={(e) => update("link", e.target.value)}
                placeholder="https://instagram.com/yourusername"
              />
            </div>

            <div className="af-field">
              <label>Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What this account is for…"
              />
            </div>

            {/* ---------- Classification ---------- */}
            <div className="af-row-2">
              <div className="af-field">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="af-field">
                <label>Date added</label>
                <input
                  type="date"
                  value={form.dateAdded}
                  onChange={(e) => update("dateAdded", e.target.value)}
                />
              </div>
            </div>

            <div className="af-field">
              <label>Type</label>
              <div className="af-segmented">
                {ACCOUNT_TYPES.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    className={"af-seg-btn" + (form.type === t.id ? " active" : "")}
                    onClick={() => update("type", t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ---------- Billing — only for Finance & Subscriptions ---------- */}
            {showBilling && (
              <div className="af-subsection">
                <div className="af-subsection-title">Billing details</div>
                <div className="af-row-2">
                  <div className="af-field">
                    <label>Mode of payment</label>
                    <select
                      value={form.paymentMode}
                      onChange={(e) => update("paymentMode", e.target.value)}
                    >
                      <option value="">Select…</option>
                      {PAYMENT_MODES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="af-field">
                    <label>Billing cycle</label>
                    <select
                      value={form.billingCycle}
                      onChange={(e) => update("billingCycle", e.target.value)}
                    >
                      <option value="">Select…</option>
                      {BILLING_CYCLES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="af-row-2">
                  <div className="af-field">
                    <label>Renewal date</label>
                    <input
                      type="date"
                      value={form.renewalDate}
                      onChange={(e) => update("renewalDate", e.target.value)}
                    />
                  </div>
                  <div className="af-field">
                    <label>Amount</label>
                    <div className="af-amount">
                      <select
                        value={form.currency}
                        onChange={(e) => update("currency", e.target.value)}
                      >
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>INR</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.amount}
                        onChange={(e) => update("amount", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------- Extra metadata ---------- */}
            <div className="af-field">
              <label>Tags <span className="af-hint">comma separated</span></label>
              <input
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                placeholder="design, client-work"
              />
            </div>

            <div className="af-field">
              <label>Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Anything worth remembering about this account…"
              />
            </div>

            <div className="af-row-2 af-align-center">
              <label className="af-toggle-row">
                <span>Two-factor enabled</span>
                <span
                  className={"af-toggle" + (form.twoFactor ? " on" : "")}
                  onClick={() => update("twoFactor", !form.twoFactor)}
                >
                  <span className="af-toggle-knob" />
                </span>
              </label>

              <div className="af-field af-field-inline">
                <label>Color</label>
                <div className="af-swatches">
                  {SWATCHES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      className={"af-swatch" + (form.color === c ? " active" : "")}
                      style={{ background: c }}
                      onClick={() => update("color", c)}
                      aria-label={`Use color ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="af-footer">
            {mode === "edit" && onDelete && (
              <button
                type="button"
                className="af-btn af-btn-danger"
                onClick={() => onDelete(initialData)}
              >
                Delete
              </button>
            )}
            <div className="af-footer-right">
              <button type="button" className="af-btn af-btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="af-btn af-btn-primary">
                {mode === "edit" ? "Save Changes" : "Add Account"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   OPTIONS MENU — the "•••" button on each account row.
   To add a new option: add one object to `items` below. That's it —
   label, an onClick handler, and optionally `danger: true` for red text.
   ============================================================ */

export function OptionsMenu({ account, onEdit, onOpenLink, onToggleStatus, onCopyUsername, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  // ---- Add / remove menu options here ----
  const items = [
    { label: "Edit", onClick: () => onEdit(account) },
    { label: "Open link", onClick: () => onOpenLink(account) },
    {
      label: account.status === "connected" ? "Mark as disconnected" : "Mark as connected",
      onClick: () => onToggleStatus(account),
    },
    { label: "Copy username", onClick: () => onCopyUsername(account) },
    { label: "Delete", danger: true, onClick: () => onDelete(account) },
  ];

  return (
    <div className="om-wrap" ref={ref}>
      <button
        type="button"
        className="om-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label="More options"
      >
        •••
      </button>

      {open && (
        <div className="om-menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className={"om-item" + (item.danger ? " danger" : "")}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   BUTTON CONNECTOR — copy this pattern into your Digital Life page.
   Shown here as a reference, not rendered by this file.

   function DigitalLifePage() {
     const [accounts, setAccounts] = useState(initialAccounts);
     const [formState, setFormState] = useState({ open: false, mode: "add", data: null });

     function openAdd() {
       setFormState({ open: true, mode: "add", data: null });
     }
     function openEdit(account) {
       setFormState({ open: true, mode: "edit", data: account });
     }
     function closeForm() {
       setFormState((s) => ({ ...s, open: false }));
     }
     function handleSubmit(account) {
       setAccounts((list) => {
         const exists = list.some((a) => a.id === account.id);
         return exists
           ? list.map((a) => (a.id === account.id ? account : a))
           : [...list, account];
       });
       closeForm();
     }
     function handleDelete(account) {
       setAccounts((list) => list.filter((a) => a.id !== account.id));
       closeForm();
     }

     return (
       <>
         <button className="af-btn af-btn-primary" onClick={openAdd}>
           + Add Account
         </button>

         {accounts.map((account) => (
           <OptionsMenu
             key={account.id}
             account={account}
             onEdit={openEdit}
             onOpenLink={(a) => window.open(a.link, "_blank")}
             onToggleStatus={(a) =>
               handleSubmit({ ...a, status: a.status === "connected" ? "disconnected" : "connected" })
             }
             onCopyUsername={(a) => navigator.clipboard.writeText(a.username)}
             onDelete={handleDelete}
           />
         ))}

         <AccountForm
           open={formState.open}
           mode={formState.mode}
           initialData={formState.data}
           onClose={closeForm}
           onSubmit={handleSubmit}
           onDelete={handleDelete}
         />
       </>
     );
   }
   ============================================================ */
