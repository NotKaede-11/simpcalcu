# SimpleGains - Simple & Compound Interest Calculator

**Group 4 - BSCSIT 2104**

## 📋 Project Description

A modern web-based Simple & Compound Interest Calculator with a **C++ backend server** and sleek HTML/CSS/JavaScript frontend. The application runs on localhost and features a beautiful dark/light mode interface with advanced calculation capabilities.

### Formulas Used

**Simple Interest:**

```
A = P(1 + rt)
```

**Compound Interest:**

```
A = P(1 + r/n)^(nt)
```

Where:

- **A** = Final Amount
- **P** = Principal (initial amount)
- **r** = Interest Rate (as decimal)
- **t** = Time (in years)
- **n** = Number of compounding periods per year

## ✨ Features

### Backend (C++)

- ✅ HTTP server running on localhost:8080
- ✅ RESTful API endpoint for calculations
- ✅ Both Simple and Compound Interest calculations
- ✅ Input validation (no negative values)
- ✅ Modular functions:
  - `getInput()` - Parse and validate inputs
  - `calculateInterest()` - Apply interest formulas
  - `createJsonResponse()` - Format results as JSON
- ✅ JSON response format for easy frontend integration

### Frontend (HTML/CSS/JavaScript)

- ✅ Modern, responsive design with bento-box layout
- ✅ **Dark/Light Mode Toggle** 🌙☀️
- ✅ Real-time input validation with error messages
- ✅ Beautiful gradient UI with smooth animations
- ✅ Percentage/Decimal mode for interest rate input
- ✅ Month/Year mode for time period input
- ✅ **Multiple Result Tabs:**
  - 📊 Summary - Quick overview of results
  - 📅 Schedule - Detailed amortization schedule
  - 📈 Chart - Visual representation with Chart.js
- ✅ **Principal vs Interest** visual bar chart
- ✅ **Calculation History** with localStorage
- ✅ **Quick Presets** (Student Loan, Car Loan, Home Mortgage, etc.)
- ✅ **Settings Panel** with customization options
- ✅ Interactive tutorial for first-time users
- ✅ Loading animations and smooth transitions
- ✅ Fully responsive for mobile and desktop

## 🚀 How to Compile and Run

### Step 1: Compile the C++ Server

**Using g++ (MinGW on Windows):**

```powershell
g++ server.cpp -o server.exe -lws2_32
```

**Using Visual Studio:**

1. Create a new "Console Application" project
2. Add `server.cpp` to the project
3. Build the solution

### Step 2: Run the Server

```powershell
.\server.exe
```

You should see:

```
========================================
SimpleGains Calculator Server
========================================
Server running on http://localhost:8080
Open your browser and navigate to the URL above
Press Ctrl+C to stop the server
========================================
```

### Step 3: Access the Application

Open your web browser and navigate to:

```
http://localhost:8080
```

## 📁 Project Files

```
simpcalcu/
│
├── server.cpp                # C++ HTTP server with calculation logic
├── index.html               # Web interface (served by C++ server)
├── styles.css               # Styling with dark/light mode support
├── script.js                # Client-side logic and interactions
├── README.md                # This file
├── UPDATES.md               # Changelog and update history
└── VALIDATION-FEATURES.md   # Input validation documentation
```

## 🎯 How to Use

1. **Start the Server**: Run `server.exe`
2. **Open Browser**: Navigate to `http://localhost:8080`
3. **Enter Values**:
   - Principal Amount (e.g., 25000)
   - Interest Rate - Toggle between % mode or decimal (e.g., 7%)
   - Time Period - Choose years or months (e.g., 3 years)
   - Compounding Period - Select from Simple, Annual, Semi-Annual, Quarterly, or Monthly
4. **Click Calculate**: See comprehensive results with visual charts
5. **View Results**: Switch between Summary, Schedule, and Chart tabs
6. **History**: Access previous calculations from the history button
7. **Presets**: Use quick preset scenarios for common calculations
8. **Theme**: Toggle between dark and light mode with the theme button

## 🔒 Input Validation

The application validates:

- ✅ No negative values allowed
- ✅ All required fields must be filled
- ✅ Values must be valid numbers
- ✅ Decimal precision supported
- ✅ Real-time error feedback
- ✅ Clear error messages for user guidance

## 🛠 Technical Details

### Backend Architecture

- **Language**: C++ (Standard C++11 or higher)
- **Networking**: Winsock2 (Windows Sockets API)
- **Server Type**: HTTP/1.1
- **Port**: 8080
- **API Endpoint**: `/api/calculate` (POST)
- **Response Format**: JSON

### Frontend Technologies

- **HTML5**: Semantic structure
- **CSS3**: Advanced styling with CSS Grid, Flexbox, animations
- **JavaScript (ES6+)**: Modular client-side logic
- **Chart.js**: Data visualization library
- **Fetch API**: Asynchronous server communication
- **LocalStorage API**: Persistent data storage for history and settings

### Communication Flow

```
Browser (HTML/JS) → POST /api/calculate → C++ Server
                                          ↓
                                    Parse & Validate
                                          ↓
                                Calculate Interest (Simple/Compound)
                                          ↓
Browser ← JSON Response ← Format Results with Schedule
```

## 🎨 Design Features

- **Bento-box Layout**: Modern grid-based design
- **Dark/Light Mode**: Automatic theme switching
- **Smooth Animations**: Fade-in, slide-in effects
- **Responsive Design**: Mobile-first approach
- **Color Scheme**:
  - Primary: Blue (#2878eb)
  - Secondary: Green (#227c3d, #10b981)
- **Custom Loading Screen**: Branded video animation
- **Visual Charts**: Interactive bar and line charts
- **Clean Typography**: Segoe UI font family
- **Glassmorphism Effects**: Modern blur and transparency

## 🔧 Troubleshooting

### Server won't start

- **Issue**: Port 8080 already in use
- **Solution**: Close any application using port 8080, or modify `PORT` constant in `server.cpp`

### Can't access in browser

- **Issue**: Browser can't connect
- **Solution**: Ensure server is running and try `http://127.0.0.1:8080`

### Compilation errors

- **Issue**: Missing libraries
- **Solution**: Ensure you link against `ws2_32.lib` (`-lws2_32` flag)

### Chart not displaying

- **Issue**: Chart.js not loaded
- **Solution**: Check internet connection (Chart.js is loaded via CDN)

## 🚧 Future Plans

- [ ] AI Assistant for financial advice
- [ ] Currency Conversion support
- [ ] CSV file uploads for batch calculations
- [ ] Support multiple computations simultaneously
- [ ] Download processed data as PDF/Excel

## 📝 Notes

- The server must be running for the web interface to work
- The server will continue running until you press Ctrl+C
- Each request is logged to the console
- The application works on localhost only (not accessible from other devices by default)
- History is stored in browser's localStorage (persists across sessions)
- Theme preference is saved automatically

## 🎓 Educational Purpose

This project demonstrates:

- HTTP server implementation in C++
- RESTful API design
- Client-server architecture
- Advanced input validation
- Modular programming
- Full-stack development with C++ backend
- Modern web design principles
- Data visualization
- State management with localStorage
- Responsive design techniques

---

**Developed by:** Group 4  
**Date:** October 2025  
**Course:** BSCS - DS  
**Section:** BSCSIT 2104
