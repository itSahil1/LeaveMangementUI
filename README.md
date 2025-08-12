Mini Leave Management System
A clean, modern, and efficient application designed to streamline the process of managing employee leaves.
This project provides a full-stack solution with a reactive frontend and a robust backend API — perfect for small to medium-sized teams looking to move away from manual leave tracking.

🚀 Live Demo
Frontend UI (Netlify): https://leavemanagementui.netlify.app

Backend API (Render): https://leavemangementapi.onrender.com

Note: The live backend API uses an in-memory data store, so data resets periodically.

✨ Features
Employee Management: Easily add and view employee details.

Leave Application: Simple modal for applying for leave.

Approval Workflow: Approve/reject pending leave requests with one click.

Leave Balance Tracking: Automatic deduction upon approval.

Interactive Dashboard: Quick overview of employees, pending requests, upcoming leaves.

Robust Validation: Handles overlapping leaves, insufficient balance, invalid dates.

🛠️ Tech Stack
Tier	Technology	Purpose
Frontend	React, Vite	Fast, interactive user interface
Tailwind CSS	Modern, utility-first styling
Lucide React	Clean, beautiful icons
Backend	Node.js, Express.js	REST API with business logic
CORS	Handle cross-origin requests
Database	In-Memory Array (Demo)	Simple persistence for demo (supports PostgreSQL in prod)

🏛️ Architecture
The app follows a 3-Tier Architecture:

Frontend (Client) – React UI in the browser.

Backend (Server) – Node.js/Express API with business logic.

Database (Persistence) – Stores application data.

⚙️ API Endpoints
Method	Endpoint	Description
GET	/api/employees	Get all employees
POST	/api/employees	Add a new employee
GET	/api/employees/:id/balance	Get leave balance for an employee
GET	/api/leaves	Get all leave requests
POST	/api/leaves	Submit a leave application
PUT	/api/leaves/:id/status	Approve or reject a leave request

📸 Screenshots
Dashboard with insights

Employee list table

Apply leave modal

📜 License
Licensed under the MIT License.
