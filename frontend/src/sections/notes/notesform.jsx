import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./noteeditor.css";
import { createNote } from "./noteService";
import { uploadNoteMedia } from "./mediaService";

export default function NewNote() {
    const navigate = useNavigate();

    const [note, setNote] = useState({
        name: "",
        description: "",
        priority: "",
        encrypted: true,
    });
    const [files, setFiles] = useState([]);
    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setNote((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateNote = async () => {
        try {
            if (!note.name.trim()) {
                alert("Please enter a note name.");
                return;
            }

            // Create the note first
            const response = await createNote(note);

            console.log("Create note response:", response);

            const createdNote = response.note;

            if (!createdNote?.id) {
                throw new Error(
                    "Note was created, but no note ID was returned."
                );
            }

            // Upload every selected file
            for (const file of files) {
                console.log("Uploading:", file.name);

                await uploadNoteMedia(
                    createdNote.id,
                    file
                );
            }

            navigate("/notes");

        } catch (error) {
            console.error("Create note error:", error);
            alert(error.message);
        }
    };
    return (
        <div className="note-editor-page">

            <div className="note-editor">

                <div className="editor-header">
                    <div>
                        <span className="editor-eyebrow">RASB / NOTES</span>
                        <h1>New Note</h1>
                        <p>Create a new secure note.</p>
                    </div>

                    <button
                        className="close-btn"
                        onClick={() => navigate("/notes")}
                    >
                        ×
                    </button>
                </div>


                <div className="editor-body">

                    {/* Name */}
                    <div className="form-group">
                        <label>Name</label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter note title"
                            value={note.name}
                            onChange={handleChange}
                        />
                    </div>


                    {/* Description */}
                    <div className="form-group">
                        <label>Description</label>

                        <textarea
                            name="description"
                            placeholder="Write your note..."
                            value={note.description}
                            onChange={handleChange}
                        />
                    </div>


                    {/* Priority */}
                    <div className="form-group">
                        <label>Priority</label>

                        <select
                            name="priority"
                            value={note.priority}
                            onChange={handleChange}
                        >
                            <option value="">Choose priority</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>


                    {/* Encryption */}
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


                    {/* Media */}
                    <div className="form-group">
                        <label>Media</label>

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
                        {files.length > 0 && (
                            <div className="selected-media">
                                {files.map((file, index) => (
                                    <div
                                        className="media-file"
                                        key={`${file.name}-${index}`}
                                    >
                                        <span>FILE</span>
                                        <strong>{file.name}</strong>
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
                    onClick={handleCreateNote}
                >
                    Create Note
                </button>

            </div>

            </div>


            {/* Footer */}


        </div>

       
    );
}