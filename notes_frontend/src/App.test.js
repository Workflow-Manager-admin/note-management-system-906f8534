import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

// PUBLIC_INTERFACE
describe('Notes App UI', () => {
  test('renders main sections and header', () => {
    render(<App />);
    expect(screen.getByText(/notes/i)).toBeInTheDocument(); // Header
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome to notes!/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "+" })).toBeInTheDocument();
  });
  test('search filters notes', () => {
    render(<App />);
    const searchEl = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchEl, { target: { value: "React" } });
    expect(screen.getByText(/react minimal design/i)).toBeInTheDocument();
    expect(screen.queryByText(/welcome to notes/i)).not.toBeInTheDocument();
  });
  test('can open note editor for creating', () => {
    render(<App />);
    const fab = screen.getByRole('button', { name: "+" });
    fireEvent.click(fab);
    expect(screen.getByText(/new note/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: /title/i }), { target: { value: 'A New Note' } });
    fireEvent.change(screen.getByRole('textbox', { name: /note content/i }), { target: { value: 'Content of new note' } });
    fireEvent.click(screen.getByRole('button', { name: /create note/i }));
    expect(screen.getByText(/a new note/i)).toBeInTheDocument();
  });
  test('can edit a note and see changes', () => {
    render(<App />);
    const editBtn = screen.getAllByTitle(/edit note/i)[0];
    fireEvent.click(editBtn);
    const editor = screen.getByText(/edit note/i);
    const titleInput = screen.getByRole('textbox', { name: /title/i });
    fireEvent.change(titleInput, { target: { value: "Welcome MOD" } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(screen.getByText(/welcome mod/i)).toBeInTheDocument();
  });
  test('can delete a note', () => {
    render(<App />);
    const firstNote = screen.getByText(/welcome to notes!/i);
    const deleteBtn = within(firstNote.parentElement).getByTitle('Delete note');
    fireEvent.click(deleteBtn);
    expect(screen.queryByText(/welcome to notes!/i)).not.toBeInTheDocument();
  });
});
