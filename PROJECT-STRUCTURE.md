# Project Structure

This document explains the organization of the SimpleGains Calculator project.

## Directory Structure

```
simpcalcu/
│
├── frontend/                    # Client-side files
│   ├── index.html              # Main HTML file
│   ├── css/
│   │   └── styles.css          # Stylesheet with dark/light mode
│   └── js/
│       └── script.js           # Client-side JavaScript logic
│
├── backend/                     # Server-side files
│   └── server.cpp              # C++ HTTP server
│
├── assets/                      # Static assets
│   ├── images/
│   │   └── finallogoforsimplegains.png    # Application logo
│   └── videos/
│       └── bg.mp4              # Loading screen video
│
├── docs/                        # Documentation
│   ├── UPDATES.md              # Changelog
│   └── VALIDATION-FEATURES.md  # Validation documentation
│
├── .git/                        # Git repository
├── server.exe                   # Compiled server executable
├── build.bat                    # Build script for Windows
├── README.md                    # Main documentation
└── PROJECT-STRUCTURE.md         # This file

```

## Folder Purpose

### `/frontend`

Contains all client-side web files that are served to the browser.

- **index.html** - Main application interface
- **css/** - Stylesheets
- **js/** - Client-side JavaScript

### `/backend`

Contains the C++ server source code.

- **server.cpp** - HTTP server with API endpoints

### `/assets`

Static files used by the application.

- **images/** - Logo and graphics
- **videos/** - Loading animations

### `/docs`

Project documentation and development notes.

- Update logs
- Feature documentation

## Build Instructions

### Windows (Using build.bat)

```batch
build.bat
```

### Manual Compilation

```powershell
g++ backend\server.cpp -o server.exe -lws2_32
```

## Running the Server

After building:

```powershell
.\server.exe
```

Then open your browser to: `http://localhost:8080`

## File Paths in Code

The server serves files from the `frontend/` directory as the root:

- `http://localhost:8080/` → `frontend/index.html`
- `http://localhost:8080/css/styles.css` → `frontend/css/styles.css`
- `http://localhost:8080/js/script.js` → `frontend/js/script.js`

Assets are accessed relative to the frontend:

- `../assets/images/logo.png` → `assets/images/logo.png`
- `../assets/videos/bg.mp4` → `assets/videos/bg.mp4`

## Benefits of This Structure

1. **Organized** - Easy to find files by purpose
2. **Scalable** - Easy to add new files in appropriate folders
3. **Professional** - Follows industry standard practices
4. **Maintainable** - Clear separation of concerns
5. **Version Control** - Better Git history tracking
