# Listador

A simple, multilingual to-do list app for managing multiple task lists. Built with plain HTML, CSS, and JavaScript — no frameworks, no build step, no backend.

## Features

- **Multiple lists** — create, open, and delete as many task lists as you need
- **New-list form** — hidden behind a "+ New List" button to keep the home screen clean
- **Bulk task adding** — paste or type multiple lines at once; each line becomes a task
- **Pending / Completed sections** — click a task to toggle it, × to delete it
- **Multilingual UI** — English, Português (BR), and Español, auto-detected from your browser
- **Offline persistence** — everything is stored in your browser's `localStorage`, so your lists survive page reloads

## Running

No installation required. Just serve the folder and open it in a browser, for example:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000. Opening `index.html` directly in a browser also works.

## Usage

1. Click **+ New List**, type a name, and press Enter (or click Create)
2. Click a list to open it
3. Type or paste tasks into the text area and click **Add items** (Ctrl/Cmd+Enter also works)
4. Click a task to toggle it between pending and completed

## Project structure

```
index.html   # Page markup and views (home + list detail)
style.css    # Styling
app.js       # App logic, i18n translations, and localStorage handling
```

## Data storage

Lists are saved to `localStorage` under the `todo_lists` key. Clearing your browser data will delete them.
