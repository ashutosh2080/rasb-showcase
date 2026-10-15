import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./DigitalLife.css";

import {
  getDigitalLife,
  createAccount,
  updateAccount,
  deleteAccount,
  bulkDeleteAccounts,
  createEmailAccount,
} from "./digitalLifeService";

const EMPTY_ACCOUNT = {
  categoryId: "",
  platformName: "",
  username: "",
  url: "",
  accountType: "personal",
  status: "connected",
  notes: "",
  emailAccountIds: [],
  useOtherEmail: false,
  otherEmail: "",
};

const EMPTY_EMAIL = {
  email: "",
  provider: "custom",
  displayName: "",
  isPrimary: false,
};

const STATUS_OPTIONS = [
  {
    value: "connected",
    label: "Connected",
  },
  {
    value: "inactive",
    label: "Not connected",
  },
  {
    value: "attention",
    label: "Needs attention",
  },
  {
    value: "temporary",
    label: "Temporary",
  },
];

const TYPE_OPTIONS = [
  {
    value: "personal",
    label: "Personal",
  },
  {
    value: "work",
    label: "Work",
  },
  {
    value: "professional",
    label: "Professional",
  },
  {
    value: "other",
    label: "Others",
  },
];

function getEmailIds(account) {
  return Array.isArray(account.email_accounts)
    ? account.email_accounts.map(
      (email) => email.id
    )
    : [];
}

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default function DigitalLife() {
  const [data, setData] = useState({
    categories: [],
    accounts: [],
    emailAccounts: [],
    platforms: [],
    relationships: [],
  });

  const [search, setSearch] = useState("");

  const [dateFilter, setDateFilter] =
    useState("latest");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [sectionFilter, setSectionFilter] =
    useState("all");

  const [emailOpen, setEmailOpen] =
    useState(false);

  const [selectedEmailIds, setSelectedEmailIds] =
    useState([]);

  const [showOtherAccounts, setShowOtherAccounts] =
    useState(false);

  const [selected, setSelected] =
    useState([]);

  const [accountForm, setAccountForm] =
    useState(null);

  const [emailFormOpen, setEmailFormOpen] =
    useState(false);

  const [emailForm, setEmailForm] =
    useState(EMPTY_EMAIL);

  const [platformView, setPlatformView] =
    useState(null);

  const [menuId, setMenuId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getDigitalLife();

      setData(result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load Digital Life."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* ==========================================================
     FILTERING
     ========================================================== */

  const filteredAccounts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    let result = [
      ...data.accounts,
    ];

    if (query) {
      result = result.filter(
        (account) =>
          `${account.platform_name}
            ${account.username}
            ${account.category_name}
            ${account.url}`
            .toLowerCase()
            .includes(query)
      );
    }

    if (sectionFilter !== "all") {
      result = result.filter(
        (account) =>
          account.category_id ===
          sectionFilter
      );
    }

    if (typeFilter !== "all") {
      result = result.filter(
        (account) =>
          account.account_type ===
          typeFilter
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (account) =>
          account.status ===
          statusFilter
      );
    }

    result.sort((a, b) => {
      const first =
        new Date(a.created_at).getTime();

      const second =
        new Date(b.created_at).getTime();

      return dateFilter === "latest"
        ? second - first
        : first - second;
    });

    return result;
  }, [
    data.accounts,
    search,
    sectionFilter,
    typeFilter,
    statusFilter,
    dateFilter,
  ]);

  /* ==========================================================
     UNIQUE PLATFORM CARDS
     ========================================================== */

  const visiblePlatforms = useMemo(() => {
    const platformMap = new Map();

    filteredAccounts.forEach(
      (account) => {
        if (!platformMap.has(account.platform_id)) {
          platformMap.set(
            account.platform_id,
            {
              id: account.platform_id,
              name: account.platform_name,
              categoryId:
                account.category_id,
              categoryName:
                account.category_name,
              accounts: [],
            }
          );
        }

        platformMap
          .get(account.platform_id)
          .accounts.push(account);
      }
    );

    return [
      ...platformMap.values(),
    ];
  }, [filteredAccounts]);

  /* ==========================================================
     RECENT ACCOUNTS
     ========================================================== */

  const recentAccounts = useMemo(
    () =>
      [...data.accounts]
        .sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        )
        .slice(0, 5),
    [data.accounts]
  );

  /* ==========================================================
     STATUS COUNTS
     ========================================================== */

  const statusCounts = useMemo(() => {
    return {
      connected:
        data.accounts.filter(
          (a) =>
            a.status === "connected"
        ).length,

      inactive:
        data.accounts.filter(
          (a) =>
            a.status === "inactive"
        ).length,

      attention:
        data.accounts.filter(
          (a) =>
            a.status === "attention"
        ).length,

      temporary:
        data.accounts.filter(
          (a) =>
            a.status === "temporary"
        ).length,
    };
  }, [data.accounts]);

  /* ==========================================================
     CATEGORY PLATFORMS
     ========================================================== */

  const categoryPlatformGroups =
    useMemo(() => {
      return data.categories
        .map((category) => {
          const platforms =
            visiblePlatforms.filter(
              (platform) =>
                platform.categoryId ===
                category.id
            );

          return {
            ...category,
            platforms: platforms.map(
              (platform) => ({
                ...platform,
                account_count:
                  platform.accounts.length,
              })
            ),
          };
        })
        .filter(
          (category) =>
            category.platforms.length > 0
        );
    }, [
      data.categories,
      visiblePlatforms,
    ]);

  /* ==========================================================
     ACCOUNT FORM
     ========================================================== */

  function openAdd(categoryId = "") {
    setAccountForm({
      mode: "add",
      data: {
        ...EMPTY_ACCOUNT,
        categoryId,
      },
    });
  }

  function openEdit(account) {
    setAccountForm({
      mode: "edit",
      data: {
        id: account.id,
        categoryId:
          account.category_id,
        platformName:
          account.platform_name,
        username:
          account.username || "",
        url:
          account.url || "",
        accountType:
          account.account_type ||
          "personal",
        status:
          account.status ||
          "connected",
        notes:
          account.notes || "",
        emailAccountIds:
          getEmailIds(account),
        useOtherEmail: false,
        otherEmail: "",
      },
    });
  }

  function toggleFormEmail(id) {
    setAccountForm(
      (current) => {
        const ids =
          current.data.emailAccountIds;

        const next = ids.includes(id)
          ? ids.filter(
            (item) => item !== id
          )
          : [...ids, id];

        return {
          ...current,
          data: {
            ...current.data,
            emailAccountIds: next,
          },
        };
      }
    );
  }

  async function submitAccount(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      let emailIds = [
        ...(accountForm.data.emailAccountIds ||
          []),
      ];

      /*
       * If user supplied an email that isn't
       * already in Digital Life, create/reuse it.
       */
      if (
        accountForm.data.useOtherEmail &&
        accountForm.data.otherEmail.trim()
      ) {
        const email =
          await createEmailAccount({
            email:
              accountForm.data.otherEmail.trim(),
            provider: "custom",
            displayName:
              accountForm.data.otherEmail.trim(),
            isPrimary: false,
          });

        if (
          email?.id &&
          !emailIds.includes(email.id)
        ) {
          emailIds.push(email.id);
        }
      }

      const payload = {
        categoryId:
          accountForm.data.categoryId,

        platformName:
          accountForm.data.platformName,

        username:
          accountForm.data.username,

        url:
          accountForm.data.url,

        accountType:
          accountForm.data.accountType,

        status:
          accountForm.data.status,

        notes:
          accountForm.data.notes,

        emailAccountIds:
          emailIds,
      };

      if (
        accountForm.mode === "add"
      ) {
        await createAccount(
          payload
        );
      } else {
        await updateAccount(
          accountForm.data.id,
          payload
        );
      }

      setAccountForm(null);

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save account."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     DELETE
     ========================================================== */

  async function removeAccount(id) {
    if (
      !window.confirm(
        "Delete this account from Digital Life?"
      )
    ) {
      return;
    }

    try {
      await deleteAccount(id);

      setSelected(
        (current) =>
          current.filter(
            (item) => item !== id
          )
      );

      setMenuId(null);

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete account."
      );
    }
  }

  async function removeSelected() {
    if (!selected.length) return;

    if (
      !window.confirm(
        `Delete ${selected.length} selected account(s)?`
      )
    ) {
      return;
    }

    try {
      await bulkDeleteAccounts(
        selected
      );

      setSelected([]);

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete selected accounts."
      );
    }
  }

  /* ==========================================================
     EMAIL ACCOUNT CREATION
     ========================================================== */

  async function submitEmail(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const createdEmail =
        await createEmailAccount(
          emailForm
        );

      if (
        accountForm &&
        createdEmail?.id
      ) {
        setAccountForm((current) => ({
          ...current,
          data: {
            ...current.data,
            emailAccountIds: [
              ...(current.data.emailAccountIds || []),
              createdEmail.id,
            ],
          },
        }));
      }

      setEmailForm(
        EMPTY_EMAIL
      );

      setEmailFormOpen(false);

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to add email account."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     PLATFORM PAGE
     ========================================================== */

  function openPlatform(platform) {
    setPlatformView(platform);

    setSelectedEmailIds([]);

    setShowOtherAccounts(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function togglePlatformEmail(id) {
    setSelectedEmailIds(
      (current) =>
        current.includes(id)
          ? current.filter(
            (item) => item !== id
          )
          : [...current, id]
    );
  }

  const platformAccounts =
    platformView
      ? data.accounts.filter(
        (account) =>
          account.platform_id ===
          platformView.id
      )
      : [];

  const visiblePlatformAccounts =
    platformAccounts.filter(
      (account) => {
        /*
         * No email selection:
         * show everything.
         */
        if (
          selectedEmailIds.length === 0
        ) {
          return true;
        }

        const accountEmailIds =
          getEmailIds(account);

        const matches =
          accountEmailIds.some(
            (id) =>
              selectedEmailIds.includes(
                id
              )
          );

        /*
         * "Other":
         * account is not associated
         * with ANY selected email.
         */
        if (showOtherAccounts) {
          return (
            matches ||
            !accountEmailIds.some(
              (id) =>
                selectedEmailIds.includes(
                  id
                )
            )
          );
        }

        return matches;
      }
    );

  /* ==========================================================
     RENDER
     ========================================================== */

  if (loading) {
    return (
      <section className="digital-life-page">
        <div className="digital-loading">
          Loading Digital Life…
        </div>
      </section>
    );
  }

  /* ==========================================================
     PLATFORM DETAIL PAGE
     ========================================================== */

  if (platformView) {
    return (
      <section className="digital-life-page">
        <div className="digital-life-header">
          <div>
            <div className="section-label">
              DIGITAL IDENTITY
            </div>

            <h2 className="section-heading">
              Your Digital Life
            </h2>

            <p className="digital-life-subtitle">
              One organized view of your online presence.
            </p>
          </div>

          <div className="email-identity-selector">
            <span>
              EMAIL ACCOUNT
            </span>

            <strong>
              {data.emailAccounts[0]?.email ||
                "No email accounts"}

            </strong>
          </div>
        </div>

        <button
          className="platform-back-button"
          onClick={() =>
            setPlatformView(null)
          }
        >
          ← Back to Digital Life
        </button>

        <div className="platform-detail-heading">
          <div>
            <span className="overview-label">
              PLATFORM
            </span>

            <h2>
              {platformView.name}
            </h2>

            <p>
              {platformView.categoryName} ·{" "}
              {platformAccounts.length} account
              {platformAccounts.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          <button
            className="primary-action"
            onClick={() =>
              openAdd(
                platformView.categoryId
              )
            }
          >
            + Add {platformView.name} Account
          </button>
        </div>

        <div className="platform-email-filter">
          <div>
            <span className="overview-label">
              EMAIL ACCOUNTS
            </span>

            <strong>
              {selectedEmailIds.length
                ? `${selectedEmailIds.length} selected`
                : "All email identities"}
            </strong>
          </div>

          <details className="email-multi-select">
            <summary>
              Select email accounts
            </summary>

            <div className="email-multi-select-menu">
              {data.emailAccounts.map(
                (email) => (
                  <label
                    className="email-option"
                    key={email.id}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmailIds.includes(
                        email.id
                      )}
                      onChange={() =>
                        togglePlatformEmail(
                          email.id
                        )
                      }
                    />

                    <span>
                      <strong>
                        {email.display_name ||
                          email.email}
                      </strong>

                      <small>
                        {email.email}
                      </small>
                    </span>
                  </label>
                )
              )}

              <div className="email-other-divider" />

              <label className="email-option email-other-option">
                <input
                  type="checkbox"
                  checked={showOtherAccounts}
                  onChange={(e) =>
                    setShowOtherAccounts(
                      e.target.checked
                    )
                  }
                />

                <span>
                  <strong>
                    Other
                  </strong>

                  <small>
                    Accounts not connected to selected emails
                  </small>
                </span>
              </label>
            </div>
          </details>
        </div>

        <div className="platform-account-list">
          {visiblePlatformAccounts.length >
            0 ? (
            visiblePlatformAccounts.map(
              (account) => (
                <div
                  className="platform-account-card"
                  key={account.id}
                  onClick={() =>
                    openEdit(account)
                  }
                >
                  <div className="platform-account-main">
                    <div className="account-avatar">
                      {account.platform_name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {account.username ||
                          "Unnamed account"}
                      </strong>

                      <span>
                        {account.url ||
                          account.platform_name}
                      </span>
                    </div>
                  </div>

                  <div className="platform-connected-emails">
                    <span className="overview-label">
                      CONNECTED EMAILS
                    </span>

                    {account.email_accounts?.length >
                      0 ? (
                      <div className="connected-email-chips">
                        {account.email_accounts.map(
                          (email) => (
                            <span
                              className="email-chip"
                              key={email.id}
                            >
                              {email.email}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <span className="platform-muted">
                        No email connected
                      </span>
                    )}
                  </div>

                  <div className="platform-account-meta">
                    <span
                      className={`account-status ${account.status}`}
                    >
                      {account.status ===
                        "inactive"
                        ? "Not connected"
                        : account.status ===
                          "attention"
                          ? "Needs attention"
                          : account.status}
                    </span>

                    <span>
                      {formatDate(
                        account.created_at
                      )}
                    </span>
                  </div>
                </div>
              )
            )
          ) : (
            <div className="platform-empty">
              No accounts match the selected
              email filters.
            </div>
          )}
        </div>

        {accountForm && (
          <AccountForm
            accountForm={accountForm}
            setAccountForm={setAccountForm}
            data={data}
            saving={saving}
            onSubmit={submitAccount}
            onClose={() =>
              setAccountForm(null)
            }
            toggleFormEmail={
              toggleFormEmail
            }
            onAddEmail={() =>
              setEmailFormOpen(true)
            }
          />
        )}
      </section>
    );
  }

  /* ==========================================================
     MAIN PAGE
     ========================================================== */

  return (
    <section className="digital-life-page">
      <div className="digital-life-header">
        <div>
          <div className="section-label">
            DIGITAL IDENTITY
          </div>

          <h2 className="section-heading">
            Your Digital Life
          </h2>

          <p className="digital-life-subtitle">
            One organized view of your online presence.
          </p>
        </div>

        <div className="email-identity-selector">
          <span>
            EMAIL ACCOUNT
          </span>

          <strong>
            {data.emailAccounts[0]?.email ||
              "No email accounts"}
          </strong>

          <button
            type="button"
            onClick={() =>
              setEmailOpen(
                !emailOpen
              )
            }
          >
            ↓
          </button>

          {emailOpen && (
            <div className="email-identity-menu">
              {data.emailAccounts.map((email) => (
                <div
                  key={email.id}
                  className="email-identity-option"
                >
                  <span>
                    {email.email}
                  </span>

                  {email.is_primary && (
                    <small>
                      Primary
                    </small>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="email-empty-action"
                onClick={() => {
                  setEmailFormOpen(true);
                  setEmailOpen(false);
                }}
              >
                + Add email account
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="digital-error">
          {error}
        </div>
      )}

      <div className="digital-overview">
        <div className="overview-card">
          <span className="overview-label">
            TOTAL ACCOUNTS
          </span>

          <strong>
            {data.accounts.length}
          </strong>
        </div>

        <div className="overview-card">
          <span className="overview-label">
            PLATFORMS
          </span>

          <strong>
            {new Set(data.accounts.map((account) => account.platform_id)).size}
          </strong>
        </div>

        <div className="overview-card status-overview-card">
          <span className="overview-label">
            STATUS
          </span>

          <button
            onClick={() =>
              setStatusFilter(
                statusFilter === "connected"
                  ? "all"
                  : "connected"
              )
            }
          >
            Connected
            <strong>
              {statusCounts.connected}
            </strong>
          </button>

          <button
            onClick={() =>
              setStatusFilter(
                statusFilter ===
                  "inactive"
                  ? "all"
                  : "inactive"
              )
            }
          >
            Not connected
            <strong>
              {statusCounts.inactive}
            </strong>
          </button>

          <button
            onClick={() =>
              setStatusFilter(
                statusFilter ===
                  "attention"
                  ? "all"
                  : "attention"
              )
            }
          >
            Needs attention
            <strong>
              {statusCounts.attention}
            </strong>
          </button>

          <button
            onClick={() =>
              setStatusFilter(
                statusFilter ===
                  "temporary"
                  ? "all"
                  : "temporary"
              )
            }
          >
            Temporary
            <strong>
              {statusCounts.temporary}
            </strong>
          </button>
        </div>
      </div >

      <div className="digital-search">
        <span className="search-icon">
          /
        </span>

        <input
          placeholder="Search platforms..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      <div className="digital-filter-row">
        <div className="filter-group">
          <span>FILTER</span>

          <select
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(
                e.target.value
              )
            }
          >
            <option value="latest">
              Date: Latest
            </option>

            <option value="earliest">
              Date: Earliest
            </option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(
                e.target.value
              )
            }
          >
            <option value="all">
              Type: All
            </option>

            <option value="personal">
              Personal
            </option>

            <option value="work">
              Work
            </option>

            <option value="professional">
              Professional
            </option>

            <option value="other">
              Others
            </option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >
            <option value="all">
              Status: All
            </option>

            <option value="connected">
              Connected
            </option>

            <option value="inactive">
              Not connected
            </option>

            <option value="attention">
              Needs attention
            </option>

            <option value="temporary">
              Temporary
            </option>
          </select>

          <select
            value={sectionFilter}
            onChange={(e) =>
              setSectionFilter(
                e.target.value
              )
            }
          >
            <option value="all">
              Section: All
            </option>

            {data.categories.map(
              (category) => (
                <option
                  value={category.id}
                  key={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>
        </div>

        <button
          className="primary-action"
          onClick={() => openAdd()}
        >
          + Add Account
        </button>
      </div>

      <div className="recent-accounts">
        <div className="recent-heading">
          <div>
            <span className="overview-label">
              RECENT ACTIVITY
            </span>

            <h3>
              Recently Added
            </h3>
          </div>
        </div>

        <div className="recent-account-list">
          {recentAccounts.map(
            (account) => (
              <button
                key={account.id}
                className="recent-account-item"
                onClick={() =>
                  openPlatform({
                    id: account.platform_id,
                    name:
                      account.platform_name,
                    categoryId:
                      account.category_id,
                    categoryName:
                      account.category_name,
                  })
                }
              >
                <span className="account-avatar">
                  {account.platform_name
                    .charAt(0)
                    .toUpperCase()}
                </span>

                <span>
                  <strong>
                    {account.platform_name}
                  </strong>

                  <small>
                    {account.username ||
                      "Unnamed account"}
                  </small>
                </span>

                <time>
                  {formatDate(
                    account.created_at
                  )}
                </time>
              </button>
            )
          )}
        </div>
      </div>

      <div className="digital-categories">
        {categoryPlatformGroups.map(
          (category) => (
            <div
              className="digital-category"
              key={category.id}
            >
              <div className="category-header">
                <div className="category-title">
                  <div className="category-icon">
                    {category.icon}
                  </div>

                  <div>
                    <h3>
                      {category.name}
                    </h3>

                    <p>
                      {category.description}
                    </p>
                  </div>
                </div>

                <button
                  className="add-category-btn"
                  onClick={() =>
                    openAdd(
                      category.id
                    )
                  }
                >
                  + Add
                </button>
              </div>

              <div className="platform-card-grid">
                {category.platforms.map(
                  (platform) => (
                    <button
                      className="platform-card"
                      key={platform.id}
                      onClick={() =>
                        openPlatform(
                          platform
                        )
                      }
                    >
                      <div className="platform-card-icon">
                        {platform.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {platform.name}
                        </strong>

                        <span>
                          {platform.account_count}{" "}
                          account
                          {platform.account_count ===
                            1
                            ? ""
                            : "s"}
                        </span>
                      </div>

                      <span className="platform-card-arrow">
                        →
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* ======================================================
          ACCOUNT MODAL
      ====================================================== */}

      {
        accountForm && (
          <AccountForm
            accountForm={accountForm}
            setAccountForm={
              setAccountForm
            }
            data={data}
            saving={saving}
            onSubmit={
              submitAccount
            }
            onClose={() =>
              setAccountForm(null)
            }
            toggleFormEmail={
              toggleFormEmail
            }
            onAddEmail={() =>
              setEmailFormOpen(true)
            }
          />
        )
      }

      {/* ======================================================
          EMAIL MODAL
      ====================================================== */}

      {
        emailFormOpen && (
          <div
            className="digital-modal-backdrop"
            onClick={() =>
              setEmailFormOpen(false)
            }
          >
            <form
              className="digital-modal email-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
              onSubmit={
                submitEmail
              }
            >
              <div className="modal-header">
                <div>
                  <span className="overview-label">
                    EMAIL IDENTITY
                  </span>

                  <h3>
                    Add Email Account
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEmailFormOpen(
                      false
                    )
                  }
                >
                  ×
                </button>
              </div>

              <label>
                Email

                <input
                  type="email"
                  value={
                    emailForm.email
                  }
                  onChange={(e) =>
                    setEmailForm({
                      ...emailForm,
                      email:
                        e.target.value,
                    })
                  }
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                Provider

                <select
                  value={
                    emailForm.provider
                  }
                  onChange={(e) =>
                    setEmailForm({
                      ...emailForm,
                      provider:
                        e.target.value,
                    })
                  }
                >
                  <option value="gmail">
                    Gmail
                  </option>

                  <option value="outlook">
                    Outlook
                  </option>

                  <option value="icloud">
                    iCloud
                  </option>

                  <option value="yahoo">
                    Yahoo
                  </option>

                  <option value="custom">
                    Custom
                  </option>
                </select>
              </label>

              <label>
                Display name

                <input
                  value={
                    emailForm.displayName
                  }
                  onChange={(e) =>
                    setEmailForm({
                      ...emailForm,
                      displayName:
                        e.target.value,
                    })
                  }
                  placeholder="Personal Gmail"
                />
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={
                    emailForm.isPrimary
                  }
                  onChange={(e) =>
                    setEmailForm({
                      ...emailForm,
                      isPrimary:
                        e.target.checked,
                    })
                  }
                />

                Primary email account
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() =>
                    setEmailFormOpen(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-action"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : "Add Email"}
                </button>
              </div>
            </form>
          </div>
        )
      }
    </section>
  );
}

/* ============================================================
   ACCOUNT FORM COMPONENT
   ============================================================ */

function AccountForm({
  accountForm,
  setAccountForm,
  data,
  saving,
  onSubmit,
  onClose,
  toggleFormEmail,
  onAddEmail,
}) {
  const form = accountForm.data;
  const platformOptions =
    data.platforms.filter(
      (platform) =>
        !form.categoryId ||
        platform.category_id === form.categoryId
    );

  function update(field, value) {
    setAccountForm(
      (current) => ({
        ...current,
        data: {
          ...current.data,
          [field]: value,
        },
      })
    );
  }

  return (
    <div
      className="digital-modal-backdrop"
      onClick={onClose}
    >
      <form
        className="digital-modal account-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
        onSubmit={onSubmit}
      >
        <div className="modal-header">
          <div>
            <span className="overview-label">
              DIGITAL ACCOUNT
            </span>

            <h3>
              {accountForm.mode ===
                "add"
                ? "Add Account"
                : "Edit Account"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-scroll-area">
          <label>
          Category

          <select
            value={form.categoryId}
            onChange={(e) =>
              update(
                "categoryId",
                e.target.value
              )
            }
            required
          >
            <option value="">
              Select category
            </option>

            {data.categories.map(
              (category) => (
                <option
                  value={category.id}
                  key={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>
        </label>

          <label>
            Platform

            <input
              list="digital-life-platform-options"
              value={form.platformName}
              onChange={(e) =>
                update(
                  "platformName",
                  e.target.value
                )
              }
              placeholder="e.g. Facebook"
              required
            />

            <datalist id="digital-life-platform-options">
              {platformOptions.map(
                (platform) => (
                  <option
                    key={platform.id}
                    value={platform.name}
                  />
                )
              )}
            </datalist>

            <small className="form-help">
              If this platform already exists,
              it will reuse the existing platform
              instead of creating a duplicate.
            </small>
          </label>

          <label>
            Username / handle

            <input
              value={form.username}
              onChange={(e) =>
                update(
                  "username",
                  e.target.value
                )
              }
            />
          </label>

          <label>
            URL

            <input
              type="url"
              value={form.url}
              onChange={(e) =>
                update(
                  "url",
                  e.target.value
                )
              }
              placeholder="https://..."
            />
          </label>

          <label>
            Type

            <select
              value={form.accountType}
              onChange={(e) =>
                update(
                  "accountType",
                  e.target.value
                )
              }
            >
              <option value="personal">
                Personal
              </option>

              <option value="work">
                Work
              </option>

              <option value="professional">
                Professional
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </label>

          <div className="form-section-label">
            CONNECTED EMAIL ACCOUNTS
          </div>

          <details className="account-email-dropdown">
            <summary>
              <span>
                {form.emailAccountIds?.length
                  ? `${form.emailAccountIds.length} email${form.emailAccountIds.length === 1 ? "" : "s"} selected`
                  : "Select email accounts"}
              </span>
            </summary>

            <div className="account-email-dropdown-menu">
              {data.emailAccounts.map(
                (email) => (
                  <label
                    className="account-email-option"
                    key={email.id}
                  >
                    <input
                      type="checkbox"
                      checked={form.emailAccountIds.includes(
                        email.id
                      )}
                      onChange={() =>
                        toggleFormEmail(
                          email.id
                        )
                      }
                    />

                    <span>
                      <strong>
                        {email.display_name ||
                          email.email}
                      </strong>

                      <small>
                        {email.email}
                      </small>
                    </span>
                  </label>
                )
              )}

              <button
                type="button"
                className="account-add-email"
                onClick={onAddEmail}
              >
                + Add email account
              </button>
            </div>
          </details>

          <label>
            Status

            <select
              value={form.status}
              onChange={(e) =>
                update(
                  "status",
                  e.target.value
                )
              }
            >
              <option value="connected">
                Connected
              </option>

              <option value="inactive">
                Not connected
              </option>

              <option value="attention">
                Needs attention
              </option>

              <option value="temporary">
                Temporary
              </option>
            </select>
          </label>

          <label>
            Notes

            <textarea
              value={form.notes}
              onChange={(e) =>
                update(
                  "notes",
                  e.target.value
                )
              }
            />
          </label>

        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-action"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-action"
            disabled={saving}
          >
            {saving
              ? "Saving…"
              : "Save Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
