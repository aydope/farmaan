# Farmaan Todo-App

A beautifully designed Persian (RTL) To-Do application featuring drag-and-drop task management, session management, dual themes, and backup & restore functionality.

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- Add tasks with title, description, and category tags
- Categorize tasks (Personal, Work, Urgent)
- Mark tasks as completed with animation
- Pin important tasks to top
- Subtasks support (add, complete, delete)
- Drag & drop to reorder tasks
- Live search and filter (All, Active, Completed)
- Dark and Achaemenid themes with harmonious colors
- Daily Persian quotes from famous poets
- Session storage info panel (size + item count)
- Clear all tasks with confirmation modal
- Backup tasks as JSON file
- Restore tasks from backup file
- Undo delete with 5-second timeout
- Smooth GSAP animations throughout
- Fully responsive design
- RTL Persian layout with Vazirmatn font
- Custom scrollbar styling

---

## Tech Stack

| Tech                         | Usage                 |
| ---------------------------- | --------------------- |
| HTML5                        | Structure             |
| TailwindCSS                  | Utility-first styling |
| jQuery 3.7.1                 | DOM manipulation      |
| GSAP 3.12.5                  | Smooth animations     |
| Bootstrap Icons 1.11.3       | Icon set              |
| Vazirmatn (Google Fonts)     | Persian typography    |
| sessionStorage               | Data persistence      |

---

## How to Run

Clone or download, then open `index.html` in any modern browser. No build tools or installation required.

```bash
git clone https://github.com/aydope/farmaan.git
cd farmaan
```

then

```bash
npx serve .
```

> Or simply double-click `index.html` after downloading.

---

## Themes

### Dark Theme
Deep navy-purple background with gold accents, cream text for eye comfort.

### Achaemenid Theme
Warm paper-like background with imperial blue and persian gold, inspired by ancient Persia.

---

## Browser Support

| Browser         |	Support        |
| --------------- | -------------- |
| Chrome          |	Latest         |
| Firefox         |	Latest         |
| Safari          |	Latest         |
| Edge            |	Latest         |
| Mobile Browsers |	Responsive     |

---

## Notes

- Tasks are saved in `sessionStorage` and persist only while the browser tab is open.
- Use the backup feature to save tasks permanently as a JSON file.
- The app is fully client-side with no server dependencies.

## License
MIT © farmaan
