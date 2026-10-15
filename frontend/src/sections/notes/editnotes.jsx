import {
    getNote,
    updateNote,
    deleteNote,
} from "./noteService";

import {
    getNoteMedia,
    uploadNoteMedia,
    deleteNoteMedia,
    getMediaOpenUrl,
    getMediaDownloadUrl,
} from "./mediaService";

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./noteeditor.css";

export default function EditNote() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [media, setMedia] = useState([]);
    const [files, setFiles] = useState([]);
    useEffect(() => {
        loadNote();
    }, [id]);

    async function loadNote() {
        try {
            setLoading(true);

            const data = await getNote(id);

            setNote(data.note);

            const mediaData = await getNoteMedia(id);

            setMedia(mediaData);

        } catch (error) {
            console.error(error);

            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        setNote((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleDeleteMedia = async (mediaId) => {
        try {
            await deleteNoteMedia(id, mediaId);

            setMedia((prev) =>
                prev.filter((item) => item.id !== mediaId)
            );

        } catch (error) {
            console.error(error);

            setError(error.message);
        }
    };
    const handleOpenMedia = (mediaId) => {
        window.open(
            getMediaOpenUrl(id, mediaId),
            "_blank"
        );
    };

    const handleDownloadMedia = (mediaId) => {
        const url = getMediaDownloadUrl(id, mediaId);

        const link = document.createElement("a");
        link.href = url;
        link.download = "";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const saveChanges = async () => {
        try {
            // 1. Update note
            await updateNote(id, note);

            // 2. Upload newly selected files
            for (const file of files) {
                await uploadNoteMedia(id, file);
            }

            // 3. Return to notes
            navigate("/notes");

        } catch (error) {
            console.error("Save note error:", error);
            setError(error.message);
        }
    };
    const handleDeleteNote = async () => {
        const confirmed = window.confirm(
            "Delete this note?"
        );

        if (!confirmed) return;

        try {
            await deleteNote(id);

            navigate("/notes");
        } catch (error) {
            console.error(error);

            setError(error.message);
        }
    };


    if (loading) {
        return (
            <div className="note-editor-page">
                <div className="note-editor">
                    <div className="editor-body">
                        Loading note...
                    </div>
                </div>
            </div>
        );
    }
    if (!note) {
        return (
            <div className="note-editor-page">
                <div className="note-editor">
                    <div className="editor-body">
                        {error || "Note not found."}
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="note-editor-page">

            <div className="note-editor">

                <div className="editor-header">

                    <div>
                        <span className="editor-eyebrow">
                            RASB / NOTES / EDIT
                        </span>

                        <h1>Edit Note</h1>

                        <p>
                            Modify your existing note.
                        </p>
                    </div>

                    <div className="header-actions">

                        <button
                            className="delete-btn"
                            onClick={handleDeleteNote}
                        >
                            Delete
                        </button>

                        <button
                            className="close-btn"
                            onClick={() => navigate("/notes")}
                        >
                            ×
                        </button>

                    </div>

                </div>


                <div className="editor-body">

                    <div className="form-group">
                        <label>Name</label>

                        <input
                            type="text"
                            name="name"
                            value={note.name}
                            onChange={handleChange}
                        />
                    </div>


                    <div className="form-group">
                        <label>Description</label>

                        <textarea
                            name="description"
                            value={note.description}
                            onChange={handleChange}
                        />
                    </div>


                    <div className="form-group">

                        <label>Priority</label>

                        <select
                            name="priority"
                            value={note.priority}
                            onChange={handleChange}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">
                                Critical
                            </option>
                        </select>

                    </div>


                    <div className="setting-row">

                        <div>
                            <span className="setting-title">
                                Encryption
                            </span>

                            <span className="setting-description">
                                Encrypt this note
                            </span>
                        </div>

                        <button
                            className={`toggle ${note.encrypted ? "active" : ""
                                }`}
                            onClick={() =>
                                setNote((prev) => ({
                                    ...prev,
                                    encrypted: !prev.encrypted,
                                }))
                            }
                        >
                            <span />
                        </button>

                    </div>


                    <div className="form-group">

                        <label>Media</label>

                        {/* Existing uploaded media */}
                        <div className="existing-media">

                            {media.length === 0 ? (
                                <p>No media attached.</p>
                            ) : (
                                media.map((item) => (
                                    <div
                                        className="media-file"
                                        key={item.id}
                                    >
                                        <span>
                                            {item.mime_type?.startsWith("image/")
                                                ? "IMG"
                                                : "FILE"}
                                        </span>

                                        <strong>
                                            {item.original_name}
                                        </strong>

                                        <button
                                            type="button"
                                            onClick={() => handleOpenMedia(item.id)}
                                        >
                                            Open
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDownloadMedia(item.id)}
                                        >
                                            Download
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteMedia(item.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            )}

                        </div>

                        {/* Upload new media */}
                        <label className="media-upload">

                            <div className="upload-icon">
                                +
                            </div>

                            <div>
                                <strong>Add media</strong>
                                <span>
                                    Images, documents or files
                                </span>
                            </div>

                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                            />

                        </label>

                        {/* Newly selected files */}
                        {files.length > 0 && (
                            <div className="selected-media">

                                {files.map((file, index) => (
                                    <div
                                        className="media-file"
                                        key={`${file.name}-${index}`}
                                    >
                                        <span>FILE</span>

                                        <strong>
                                            {file.name}
                                        </strong>
                                    </div>
                                ))}

                            </div>
                        )}

                    </div>

                </div>


                <div className="editor-footer">

                    <button
                        className="secondary-btn"
                        onClick={() => navigate("/notes")}
                    >
                        Cancel
                    </button>

                    <button
                        className="primary-btn"
                        onClick={saveChanges}
                    >
                        Save Changes
                    </button>

                </div>

            </div>

        </div>
    );
}