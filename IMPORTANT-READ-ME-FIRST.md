# Important: Server Update Required!

## ⚠️ Action Required

The project structure has been reorganized into folders. **You MUST update the server.cpp file** to serve files from the new `frontend/` directory.

## What Changed

**Old Structure:**

```
simpcalcu/
├── server.cpp
├── index.html
├── styles.css
└── script.js
```

**New Structure:**

```
simpcalcu/
├── backend/
│   └── server.cpp
├── frontend/
│   ├── index.html
│   ├── css/styles.css
│   └── js/script.js
└── assets/
    ├── images/
    └── videos/
```

## Server Code Changes Needed

You need to update `backend/server.cpp` to:

1. Serve `frontend/index.html` as the root page
2. Serve files from `frontend/` directory
3. Serve static assets from `assets/` directory

## Quick Fix

Update the file path handling in server.cpp:

- Change `index.html` → `frontend/index.html`
- When serving files, prepend `frontend/` to the requested path
- Handle assets folder properly

## Building

After updating server.cpp, rebuild with:

```powershell
.\build.bat
```

Or manually:

```powershell
g++ backend\server.cpp -o server.exe -lws2_32
```

---

**Note:** Until you update and recompile server.cpp, the server won't work with the new structure!
