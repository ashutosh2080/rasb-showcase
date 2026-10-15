import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getNotes } from "./noteService";
import "./Notes.css";

export default function Notes() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      setLoading(true);
      setError("");

      const data = await getNotes();

      setNotes(data.notes);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const encryptedCount = notes.filter(
    (note) => note.encrypted
  ).length;

  return (
    <section className="section-page notes-page">

      <div className="page-actions">

        <div>
          <div className="section-label">
            ENCRYPTED STORE
          </div>

          <h2 className="section-heading">
            Your Notes
          </h2>
        </div>

        <button
          className="primary-action"
          onClick={() => navigate("/notes/new")}
        >
          + New Note
        </button>

      </div>


      <div className="section-grid">

        <div className="panel">

          <div className="panel-head">
            <span>Recent Notes</span>

            <span className="panel-meta">
              {encryptedCount} encrypted
            </span>
          </div>


          {loading && (
            <div className="note-item">
              Loading notes...
            </div>
          )}


          {error && (
            <div className="note-item">
              {error}
            </div>
          )}


          {!loading &&
            !error &&
            notes.length === 0 && (
              <div className="note-item">
                <div>
                  <strong>No notes yet</strong>
                  <span>
                    Create your first note.
                  </span>
                </div>
              </div>
            )}


          {!loading &&
            !error &&
            notes.map((note) => (
              <div
                key={note.id}
                className="note-item"
                onClick={() =>
                  navigate(`/notes/${note.id}/edit`)
                }
              >

                <div>
                  <strong>
                    {note.name}
                  </strong>

                  <span>
                    Edited{" "}
                    {new Date(
                      note.updated_at
                    ).toLocaleString()}
                  </span>
                </div>


                <span className="note-lock">
                  {note.encrypted
                    ? "Encrypted"
                    : "Unencrypted"}
                </span>

              </div>
            ))}

        </div>


        <div className="panel">

          <div className="panel-head">
            <span>Note Storage</span>

            <span className="panel-meta">
              —
            </span>
          </div>

          <div className="card-stat">
            {notes.length}
          </div>

          <div className="card-stat-label">
            TOTAL NOTES
          </div>

          <div className="chip-row">
            <span className="chip">
              Encrypted
            </span>

            <span className="chip">
              Indexed
            </span>

            <span className="chip">
              Synced
            </span>
          </div>

        </div>

      </div>

    </section>
  );
}