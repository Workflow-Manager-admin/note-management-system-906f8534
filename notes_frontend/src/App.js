import React, { useState, useMemo } from 'react';
import './App.css';

// Constants for color palette from requirements
const COLORS = {
  primary: '#1976d2',
  secondary: '#90caf9',
  accent: '#ff9800'
};

// PUBLIC_INTERFACE
function App() {
  // Mocked note data (replace with backend integration in future)
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Welcome to Notes!',
      content: 'This is your first note. Edit, create, or delete notes as you wish.',
      createdAt: '2024-06-11T09:20:00Z',
      updatedAt: '2024-06-11T09:20:00Z'
    },
    {
      id: 2,
      title: 'React Minimal Design',
      content: 'This is an example note showing the modern, minimalistic UI.',
      createdAt: '2024-06-11T10:00:00Z',
      updatedAt: '2024-06-11T10:00:00Z'
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeNoteId, setActiveNoteId] = useState(null); // For right-side detail
  const [showEditor, setShowEditor] = useState(false);
  const [editorNote, setEditorNote] = useState(null); // null for create, note object for edit
  const [sidebarOpen, setSidebarOpen] = useState(true); // Minimal logic for future filter/collection

  // Derived filtered note list
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) return notes;
    const lcterm = searchTerm.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(lcterm) ||
        n.content.toLowerCase().includes(lcterm)
    );
  }, [notes, searchTerm]);

  // Note selection
  const handleSelectNote = (id) => {
    setActiveNoteId(id);
  };

  // Modal editor: Save new or edited note
  const handleSaveNote = (note) => {
    if (note.id == null) {
      // Creating new note
      const now = new Date().toISOString();
      const newNote = {
        ...note,
        id: notes.length ? Math.max(...notes.map((n) => n.id)) + 1 : 1,
        createdAt: now,
        updatedAt: now
      };
      setNotes([newNote, ...notes]);
      setActiveNoteId(newNote.id);
    } else {
      // Editing existing note
      const now = new Date().toISOString();
      setNotes((prev) =>
        prev.map((n) =>
          n.id === note.id ? { ...n, ...note, updatedAt: now } : n
        )
      );
    }
    setShowEditor(false);
    setEditorNote(null);
  };

  // Note deletion
  const handleDeleteNote = (id) => {
    let idx = notes.findIndex((n) => n.id === id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) {
      // Select neighbor or none
      const newActive =
        filteredNotes.length > 1
          ? filteredNotes[
              idx === 0 ? 1 : idx - 1
            ]?.id
          : null;
      setActiveNoteId(newActive);
    }
  };

  // Open note editor to create or edit
  const handleOpenEditor = (note = null) => {
    setShowEditor(true);
    setEditorNote(note);
  };

  // Get current (detail) note
  const activeNote = notes.find((n) => n.id === activeNoteId);

  // UI
  return (
    <div className="notes-app-root" style={{background: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
      <Header />
      <div className="main-content">
        <Sidebar open={sidebarOpen} />
        <div className="content-container">
          <div className="note-list-toolbar">
            <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
          <NotesList
            notes={filteredNotes}
            activeNoteId={activeNoteId}
            selectNote={handleSelectNote}
            onEdit={handleOpenEditor}
            onDelete={handleDeleteNote}
          />
        </div>
        <div className="note-detail-container">
          {activeNote ? (
            <NoteDetail
              note={activeNote}
              onEdit={() => handleOpenEditor(activeNote)}
              onDelete={() => handleDeleteNote(activeNote.id)}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      <FloatingActionButton onClick={() => handleOpenEditor()} color={COLORS.accent} />
      {showEditor && (
        <NoteEditorModal
          note={editorNote}
          onSave={handleSaveNote}
          onClose={() => {
            setShowEditor(false);
            setEditorNote(null);
          }}
        />
      )}
    </div>
  );
}

// Header Bar
function Header() {
  return (
    <header className="app-header-bar">
      <span className="app-title">notes</span>
    </header>
  );
}

// Side Navigation skeleton, for future extension.
function Sidebar({ open }) {
  return (
    <aside className={`sidebar${open ? '' : ' closed'}`}>
      <nav>
        <div className="sidebar-section">
          <span className="sidebar-title">Collections</span>
          <ul>
            <li className="sidebar-link selected">All Notes</li>
            {/* Add filter views/categories as future extension */}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

// Search input
function SearchInput({ searchTerm, setSearchTerm }) {
  return (
    <input
      className="search-input"
      type="text"
      placeholder="Search notes…"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      aria-label="Search notes"
    />
  );
}

// Notes List
function NotesList({ notes, activeNoteId, selectNote, onEdit, onDelete }) {
  return (
    <div className="note-list">
      {notes.length === 0 && (
        <div className="empty-list-msg">No notes found.</div>
      )}
      {notes.map((note) => (
        <div
          key={note.id}
          className={`note-list-item${activeNoteId === note.id ? ' active' : ''}`}
          onClick={() => selectNote(note.id)}
          tabIndex={0}
          role="button"
          aria-label={`Open ${note.title}`}
        >
          <div className="note-list-title">{note.title}</div>
          <div className="note-list-snippet">
            {note.content.slice(0, 64) + (note.content.length > 64 ? '…' : '')}
          </div>
          <div className="note-list-actions">
            <button className="note-action edit" onClick={(e) => {e.stopPropagation(); onEdit(note);}} title="Edit note">✏️</button>
            <button className="note-action delete" onClick={(e) => {e.stopPropagation(); onDelete(note.id);}} title="Delete note">🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Note detail view
function NoteDetail({ note, onEdit, onDelete }) {
  return (
    <section className="note-detail">
      <div className="note-detail-header">
        <h2>{note.title}</h2>
        <div className="note-detail-actions">
          <button className="note-action edit" onClick={onEdit} title="Edit Note">✏️ Edit</button>
          <button className="note-action delete" onClick={onDelete} title="Delete Note">🗑️ Delete</button>
        </div>
      </div>
      <div className="note-detail-body">{note.content}</div>
      <div className="note-detail-date">
        <span>
          Created: {new Date(note.createdAt).toLocaleString()}
        </span>
        {note.updatedAt !== note.createdAt && (
          <span>
            {' — '}Updated: {new Date(note.updatedAt).toLocaleString()}
          </span>
        )}
      </div>
    </section>
  );
}

// Empty state UI
function EmptyState() {
  return (
    <div className="empty-note-detail">
      <p className="empty-title">No note selected</p>
      <p className="empty-desc">Select a note or create a new one.</p>
    </div>
  );
}

// Floating action button (FAB)
function FloatingActionButton({ onClick, color }) {
  return (
    <button
      className="fab"
      type="button"
      style={{background: color}}
      aria-label="Create note"
      onClick={onClick}
    >
      +
    </button>
  );
}

// Note editor modal component (create/edit)
function NoteEditorModal({ note, onSave, onClose }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

  // Focus management for accessibility (auto-focus title)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (title.trim() === "") return;
    onSave({
      ...note,
      title: title.trim(),
      content: content.trim()
    });
  };
  return (
    <div className="modal-backdrop" tabIndex={-1} role="dialog" aria-modal="true">
      <div className="modal">
        <form className="note-editor-form" onSubmit={handleFormSubmit}>
          <div className="modal-header">
            <span>{note ? 'Edit Note' : 'New Note'}</span>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close editor">×</button>
          </div>
          <div className="editor-fields">
            <input
              autoFocus
              className="editor-title"
              type="text"
              placeholder="Title"
              value={title}
              maxLength={60}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="editor-content"
              placeholder="Note content…"
              value={content}
              rows={7}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div className="editor-actions">
            <button type="submit" className="save-btn" disabled={title.trim() === ""}>
              {note ? "Save Changes" : "Create Note"}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
