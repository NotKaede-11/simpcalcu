/*
 * Simple Interest Calculator - Web Server Backend
 *
 * PROGRAMMERS: [Member 1 Name], [Member 2 Name]
 *
 * Features:
 * - HTTP server for localhost
 * - Input validation (no negative values)
 * - Simple Interest Formula: A = P(1 + rt)
 * - Modular design with separate functions
 * - JSON API endpoints
 */

#include <winsock2.h>
#include <ws2tcpip.h>
#include <iostream>
#include <string>
#include <sstream>
#include <fstream>
#include <iomanip>
#include <cmath>

#pragma comment(lib, "ws2_32.lib")

// Function declarations
bool getInput(const std::string &data, double &principal, double &rate, double &time, int &compoundingPeriod);
double calculateSimpleInterest(double principal, double rate, double time);
double calculateCompoundInterest(double principal, double rate, double time, int compoundingPeriod);
std::string createJsonResponse(bool success, double principal, double rate, double time, double amount, double interest, int compoundingPeriod, const std::string &error = "");
std::string getContentType(const std::string &path);
std::string readFile(const std::string &filename);
void handleRequest(SOCKET clientSocket, const std::string &request);
std::string urlDecode(const std::string &str);

const int START_PORT = 5500;
const int END_PORT = 8080;

int main()
{
  WSADATA wsaData;
  SOCKET serverSocket, clientSocket;
  struct sockaddr_in serverAddr, clientAddr;
  int clientAddrLen = sizeof(clientAddr);
  int actualPort = -1;

  // Initialize Winsock
  if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
  {
    std::cerr << "WSAStartup failed\n";
    return 1;
  }

  // Create socket
  serverSocket = socket(AF_INET, SOCK_STREAM, 0);
  if (serverSocket == INVALID_SOCKET)
  {
    std::cerr << "Socket creation failed\n";
    WSACleanup();
    return 1;
  }

  // Setup server address
  serverAddr.sin_family = AF_INET;
  serverAddr.sin_addr.s_addr = INADDR_ANY;

  // Try to bind to a port in the range
  bool bound = false;
  for (int port = START_PORT; port <= END_PORT; port++)
  {
    serverAddr.sin_port = htons(port);
    if (bind(serverSocket, (struct sockaddr *)&serverAddr, sizeof(serverAddr)) != SOCKET_ERROR)
    {
      actualPort = port;
      bound = true;
      break;
    }
  }

  if (!bound)
  {
    std::cerr << "Failed to bind to any port in range " << START_PORT << "-" << END_PORT << "\n";
    std::cerr << "All ports may be in use. Please close other applications and try again.\n";
    closesocket(serverSocket);
    WSACleanup();
    return 1;
  }

  // Listen
  if (listen(serverSocket, 10) == SOCKET_ERROR)
  {
    std::cerr << "Listen failed\n";
    closesocket(serverSocket);
    WSACleanup();
    return 1;
  }

  std::cout << "========================================\n";
  std::cout << "Simple Interest Calculator Server\n";
  std::cout << "========================================\n";
  std::cout << "Server running on http://localhost:" << actualPort << "\n";
  std::cout << "Open your browser and navigate to the URL above\n";
  std::cout << "Press Ctrl+C to stop the server\n";
  std::cout << "========================================\n\n";

  // Accept connections
  while (true)
  {
    clientSocket = accept(serverSocket, (struct sockaddr *)&clientAddr, &clientAddrLen);
    if (clientSocket == INVALID_SOCKET)
    {
      std::cerr << "Accept failed\n";
      continue;
    }

    // Receive request
    char buffer[4096] = {0};
    int bytesReceived = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
    if (bytesReceived > 0)
    {
      std::string request(buffer);
      handleRequest(clientSocket, request);
    }

    closesocket(clientSocket);
  }

  closesocket(serverSocket);
  WSACleanup();
  return 0;
}

/**
 * Function: handleRequest
 * Purpose: Process HTTP requests and send appropriate responses
 */
void handleRequest(SOCKET clientSocket, const std::string &request)
{
  std::istringstream requestStream(request);
  std::string method, path, version;
  requestStream >> method >> path >> version;

  std::cout << method << " " << path << std::endl;

  std::string response;

  // Handle API endpoint for calculation
  if (path.find("/api/calculate") == 0)
  {
    // Extract POST data
    size_t bodyPos = request.find("\r\n\r\n");
    std::string body = (bodyPos != std::string::npos) ? request.substr(bodyPos + 4) : "";

    double principal, rate, time;
    int compoundingPeriod;

    if (getInput(body, principal, rate, time, compoundingPeriod))
    {
      double amount;
      if (compoundingPeriod == 0)
      {
        // Simple interest
        amount = calculateSimpleInterest(principal, rate, time);
      }
      else
      {
        // Compound interest
        amount = calculateCompoundInterest(principal, rate, time, compoundingPeriod);
      }
      double interest = amount - principal;

      std::string jsonResponse = createJsonResponse(true, principal, rate, time, amount, interest, compoundingPeriod);

      response = "HTTP/1.1 200 OK\r\n";
      response += "Content-Type: application/json\r\n";
      response += "Access-Control-Allow-Origin: *\r\n";
      response += "Content-Length: " + std::to_string(jsonResponse.length()) + "\r\n";
      response += "\r\n";
      response += jsonResponse;
    }
    else
    {
      std::string jsonResponse = createJsonResponse(false, 0, 0, 0, 0, 0, 0, "Invalid input: Please ensure all values are non-negative numbers");

      response = "HTTP/1.1 400 Bad Request\r\n";
      response += "Content-Type: application/json\r\n";
      response += "Access-Control-Allow-Origin: *\r\n";
      response += "Content-Length: " + std::to_string(jsonResponse.length()) + "\r\n";
      response += "\r\n";
      response += jsonResponse;
    }
  }
  // Serve HTML file
  else if (path == "/" || path == "/index.html")
  {
    std::string content = readFile("frontend/index.html");

    if (!content.empty())
    {
      response = "HTTP/1.1 200 OK\r\n";
      response += "Content-Type: text/html\r\n";
      response += "Content-Length: " + std::to_string(content.length()) + "\r\n";
      response += "\r\n";
      response += content;
    }
    else
    {
      response = "HTTP/1.1 404 Not Found\r\n\r\n";
    }
  }
  // Serve static files (CSS, JS, images, videos)
  else
  {
    // Remove leading slash from path
    std::string requestedPath = path.substr(1);
    std::string filename;

    // Handle different file locations
    if (requestedPath.find("css/") == 0 || requestedPath.find("js/") == 0)
    {
      // Files in frontend folder
      filename = "frontend/" + requestedPath;
    }
    else if (requestedPath.find("../assets/") == 0)
    {
      // Assets referenced with ../assets/ from HTML
      filename = requestedPath.substr(3); // Remove "../" prefix
    }
    else if (requestedPath.find("assets/") == 0)
    {
      // Direct assets references
      filename = requestedPath;
    }
    else
    {
      // Default to frontend folder
      filename = "frontend/" + requestedPath;
    }

    std::string content = readFile(filename);

    if (!content.empty())
    {
      std::string contentType = getContentType(path);
      response = "HTTP/1.1 200 OK\r\n";
      response += "Content-Type: " + contentType + "\r\n";
      response += "Content-Length: " + std::to_string(content.length()) + "\r\n";
      response += "\r\n";
      response += content;
    }
    else
    {
      response = "HTTP/1.1 404 Not Found\r\n\r\n";
    }
  }

  send(clientSocket, response.c_str(), response.length(), 0);
}

/**
 * Function: getInput
 * Purpose: Parse and validate input from POST data
 * Parameters:
 *   - data: POST data string
 *   - principal: Reference to store principal amount
 *   - rate: Reference to store interest rate
 *   - time: Reference to store time period
 * Returns: true if all inputs are valid, false otherwise
 */
bool getInput(const std::string &data, double &principal, double &rate, double &time, int &compoundingPeriod)
{
  // Parse form data (format: principal=1000&rate=0.05&time=2&compounding=12)
  std::istringstream dataStream(data);
  std::string token;

  bool foundPrincipal = false, foundRate = false, foundTime = false, foundCompounding = false;

  while (std::getline(dataStream, token, '&'))
  {
    size_t pos = token.find('=');
    if (pos != std::string::npos)
    {
      std::string key = token.substr(0, pos);
      std::string value = urlDecode(token.substr(pos + 1));

      try
      {
        if (key == "principal")
        {
          principal = std::stod(value);
          if (principal < 0)
            return false;
          foundPrincipal = true;
        }
        else if (key == "rate")
        {
          rate = std::stod(value);
          if (rate < 0)
            return false;
          foundRate = true;
        }
        else if (key == "time")
        {
          time = std::stod(value);
          if (time < 0)
            return false;
          foundTime = true;
        }
        else if (key == "compounding")
        {
          compoundingPeriod = std::stoi(value);
          if (compoundingPeriod < 0)
            return false;
          foundCompounding = true;
        }
      }
      catch (...)
      {
        return false;
      }
    }
  }

  return foundPrincipal && foundRate && foundTime && foundCompounding;
}

/**
 * Function: calculateSimpleInterest
 * Purpose: Calculate the final amount using simple interest formula
 * Formula: A = P(1 + rt)
 * Parameters:
 *   - principal: Initial principal amount (P)
 *   - rate: Interest rate in decimal form (r)
 *   - time: Time period in years (t)
 * Returns: Final amount (A)
 */
double calculateSimpleInterest(double principal, double rate, double time)
{
  // A = P(1 + rt)
  double amount = principal * (1.0 + rate * time);
  return amount;
}

/**
 * Function: calculateCompoundInterest
 * Purpose: Calculate the final amount using compound interest formula
 * Formula: A = P(1 + r/n)^(nt)
 * Parameters:
 *   - principal: Initial principal amount (P)
 *   - rate: Interest rate in decimal form (r)
 *   - time: Time period in years (t)
 *   - compoundingPeriod: Number of times interest is compounded per year (n)
 *                        0 = Simple, 1 = Annual, 2 = Semi-Annual, 4 = Quarterly, 12 = Monthly
 * Returns: Final amount (A)
 */
double calculateCompoundInterest(double principal, double rate, double time, int compoundingPeriod)
{
  // A = P(1 + r/n)^(nt)
  double amount = principal * pow((1.0 + rate / compoundingPeriod), compoundingPeriod * time);
  return amount;
}

/**
 * Function: createJsonResponse
 * Purpose: Create JSON response with calculation results
 */
std::string createJsonResponse(bool success, double principal, double rate, double time,
                               double amount, double interest, int compoundingPeriod, const std::string &error)
{
  std::ostringstream json;
  json << std::fixed << std::setprecision(2);

  json << "{";
  json << "\"success\":" << (success ? "true" : "false");

  if (success)
  {
    json << ",\"principal\":" << principal;
    json << ",\"rate\":" << rate;
    json << ",\"time\":" << time;
    json << ",\"amount\":" << amount;
    json << ",\"interest\":" << interest;
    json << ",\"compoundingPeriod\":" << compoundingPeriod;
  }
  else
  {
    json << ",\"error\":\"" << error << "\"";
  }

  json << "}";
  return json.str();
} /**
   * Function: getContentType
   * Purpose: Get MIME type based on file extension
   */
std::string getContentType(const std::string &path)
{
  if (path.find(".html") != std::string::npos)
    return "text/html";
  if (path.find(".css") != std::string::npos)
    return "text/css";
  if (path.find(".js") != std::string::npos)
    return "application/javascript";
  if (path.find(".json") != std::string::npos)
    return "application/json";
  if (path.find(".png") != std::string::npos)
    return "image/png";
  if (path.find(".jpg") != std::string::npos || path.find(".jpeg") != std::string::npos)
    return "image/jpeg";
  if (path.find(".mp4") != std::string::npos)
    return "video/mp4";
  if (path.find(".webm") != std::string::npos)
    return "video/webm";
  return "text/plain";
}

/**
 * Function: readFile
 * Purpose: Read file contents into string (handles both text and binary files)
 */
std::string readFile(const std::string &filename)
{
  std::ifstream file(filename, std::ios::binary);
  if (!file.is_open())
  {
    return "";
  }

  std::stringstream buffer;
  buffer << file.rdbuf();
  return buffer.str();
}

/**
 * Function: urlDecode
 * Purpose: Decode URL-encoded strings
 */
std::string urlDecode(const std::string &str)
{
  std::string result;
  char ch;
  int i, ii;
  for (i = 0; i < str.length(); i++)
  {
    if (str[i] == '+')
    {
      result += ' ';
    }
    else if (str[i] == '%')
    {
      sscanf(str.substr(i + 1, 2).c_str(), "%x", &ii);
      ch = static_cast<char>(ii);
      result += ch;
      i = i + 2;
    }
    else
    {
      result += str[i];
    }
  }
  return result;
}
