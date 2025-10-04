# Simple Interest Calculator - Web Application

**PROGRAMMERS:** [Member 1 Name], [Member 2 Name]

## 📋 Project Description

A web-based Simple Interest Calculator with a **C++ backend server** and modern HTML/CSS/JavaScript frontend. The application runs on localhost and can be accessed through any web browser.

### Formula Used

```
A = P(1 + rt)
```

Where:

- **A** = Final Amount
- **P** = Principal (initial amount)
- **r** = Interest Rate (as decimal)
- **t** = Time (in years)

## ✨ Features

### Backend (C++)

- ✅ HTTP server running on localhost:8080
- ✅ RESTful API endpoint for calculations
- ✅ Input validation (no negative values)
- ✅ Modular functions:
  - `getInput()` - Parse and validate inputs
  - `calculateInterest()` - Apply the simple interest formula
  - `createJsonResponse()` - Format results as JSON
- ✅ JSON response format for easy frontend integration

### Frontend (HTML/CSS/JavaScript)

- ✅ Modern, responsive design
- ✅ Real-time input validation
- ✅ Beautiful gradient UI
- ✅ Animated results display
- ✅ Error handling with user-friendly messages
- ✅ Multiple calculations support (Clear button)
- ✅ Loading indicators

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
Simple Interest Calculator Server
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
MAAM.FE.EXAM/
│
├── server.cpp                    # C++ HTTP server with calculation logic
├── index.html                    # Web interface (served by C++ server)
├── simple_interest_calculator.cpp # Original Windows GUI version
└── README.md                     # This file
```

## 🎯 How to Use

1. **Start the Server**: Run `server.exe`
2. **Open Browser**: Navigate to `http://localhost:8080`
3. **Enter Values**:
   - Principal Amount (e.g., 1000)
   - Interest Rate as decimal (e.g., 0.05 for 5%)
   - Time in years (e.g., 2)
4. **Click Calculate**: See the results instantly
5. **Multiple Calculations**: Click "Clear" to reset and calculate again

## 🔒 Input Validation

The application validates:

- ✅ No negative values allowed
- ✅ All fields must be filled
- ✅ Values must be valid numbers
- ✅ Decimal precision supported

## 🛠 Technical Details

### Backend Architecture

- **Language**: C++ (Standard C++11 or higher)
- **Networking**: Winsock2 (Windows Sockets API)
- **Server Type**: HTTP/1.1
- **Port**: 8080
- **API Endpoint**: `/api/calculate` (POST)
- **Response Format**: JSON

### Frontend Technologies

- **HTML5**: Structure
- **CSS3**: Styling with gradients, animations
- **JavaScript (ES6+)**: Client-side logic and API communication
- **Fetch API**: Asynchronous server communication

### Communication Flow

```
Browser (HTML/JS) → POST /api/calculate → C++ Server
                                          ↓
                                    Parse & Validate
                                          ↓
                                    Calculate Interest
                                          ↓
Browser ← JSON Response ← Format Results
```

## 🎨 Design Features

- Gradient background (purple theme)
- Smooth animations
- Responsive layout
- Clear visual hierarchy
- User-friendly error messages
- Professional typography

## 📊 Example Calculation

**Input:**

- Principal: $1000
- Rate: 0.05 (5%)
- Time: 2 years

**Output:**

- Interest Earned: $100.00
- Total Amount: $1100.00

**Calculation:**

```
A = P(1 + rt)
A = 1000(1 + 0.05 × 2)
A = 1000(1 + 0.1)
A = 1000(1.1)
A = $1100.00
```

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

## 📝 Notes

- The server must be running for the web interface to work
- The server will continue running until you press Ctrl+C
- Each request is logged to the console
- The application works on localhost only (not accessible from other devices by default)

## 🎓 Educational Purpose

This project demonstrates:

- HTTP server implementation in C++
- RESTful API design
- Client-server architecture
- Input validation
- Modular programming
- Full-stack development with C++ backend

---

**Developed by:** [Member 1 Name] & [Member 2 Name]  
**Date:** October 2025  
**Course:** [Your Course Name]
