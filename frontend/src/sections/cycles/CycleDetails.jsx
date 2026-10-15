// src/sections/cycles/CycleDetails.jsx

import React from "react";

import {
  formatPriority,
  formatRecurrence,
  formatTime,
} from "./cycleUtils";

function CycleDetails({
  cycle,
  onClose,
  onEdit,
  onPause,
  onResume,
  onDelete,
}) {
  if (!cycle) return null;

  return (
    <div className="cycle-details-overlay">
      <aside className="cycle-details-panel">
        <div className="cycle-details-header">
          <div>
            <span className="section-eyebrow">
              Cycle details
            </span>

            <h2>{cycle.name}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="details-close"
          >
            ×
          </button>
        </div>

        <div className="cycle-details-body">
          <div className="cycle-detail-priority">
            <span>{cycle.category}</span>

            <span
              className={`priority-badge priority-${cycle.priority}`}
            >
              {formatPriority(cycle.priority)}
            </span>
          </div>

          {cycle.description && (
            <p className="cycle-description">
              {cycle.description}
            </p>
          )}

          <div className="detail-section">
            <span className="detail-label">
              Recurrence
            </span>

            <strong>
              {formatRecurrence(cycle)}
            </strong>

            {cycle.recurrence_rule?.time && (
              <span>
                {formatTime(
                  cycle.recurrence_rule.time
                )}
              </span>
            )}
          </div>

          <div className="detail-section">
            <span className="detail-label">
              Next occurrence
            </span>

            <strong>
              {cycle.next_occurrence
                ? new Date(
                    cycle.next_occurrence
                  ).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "No upcoming occurrence"}
            </strong>
          </div>

          <div className="detail-section">
            <span className="detail-label">
              Timezone
            </span>

            <strong>
              {cycle.timezone || "Asia/Kolkata"}
            </strong>
          </div>

          <div className="detail-section">
            <span className="detail-label">
              Notifications
            </span>

            {cycle.notifications?.length ? (
              <div className="notification-detail-list">
                {cycle.notifications.map(
                  (notification, index) => (
                    <span key={index}>
                      {notification.label ||
                        `${notification.value} ${notification.unit} before`}
                    </span>
                  )
                )}
              </div>
            ) : (
              <span>
                Notifications disabled
              </span>
            )}
          </div>

          <div className="detail-section">
            <span className="detail-label">
              Channels
            </span>

            <div className="channel-list">
              {cycle.notification_channels?.map(
                (channel) => (
                  <span key={channel}>
                    {channel}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="detail-section">
            <span className="detail-label">
              History
            </span>

            <div className="cycle-history">
              {cycle.history?.length ? (
                cycle.history
                  .slice(0, 5)
                  .map((item) => (
                    <div
                      className="history-row"
                      key={item.id}
                    >
                      <span>
                        {new Date(
                          item.scheduled_at
                        ).toLocaleDateString()}
                      </span>

                      <span
                        className={`history-status status-${item.status}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))
              ) : (
                <span>No history yet.</span>
              )}
            </div>
          </div>
        </div>

        <div className="cycle-details-footer">
          <button
            type="button"
            className="button-secondary"
            onClick={onEdit}
          >
            Edit
          </button>

          <button
            type="button"
            className="button-secondary"
            onClick={cycle.status === "paused" ? onResume : onPause}
          >
            {cycle.status === "paused"
              ? "Resume"
              : "Pause"}
          </button>

          <button
            type="button"
            className="button-danger"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </aside>
    </div>
  );
}

export default CycleDetails;