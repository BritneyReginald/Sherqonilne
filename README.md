# OHS Online Backend API

## Overview

The OHS Online Backend API is the server-side application for the OHS Online Health, Safety, Environment, Risk, and Quality (SHERQ) management platform.

The API provides endpoints that allow the frontend application to manage employees, training records, risk assessments, incidents, inspections, and other SHERQ-related information stored in a PostgreSQL database.

The application is built using:

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- pg (PostgreSQL client)
- CORS

---

# Technology Stack

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| TypeScript | Strongly typed JavaScript |
| PostgreSQL | Relational database |
| pg | PostgreSQL database driver |
| CORS | Cross-Origin Resource Sharing |
| npm | Package manager |

---

# Project Structure

```
backend/
│
├── src/
│   ├── index.ts
│   ├── db.ts
│   ├── types.ts
│   └── ...
│
├── package.json
├── package-lock.json
├── tsconfig.json
├── .env
└── README.md
```

---

# Features

Current API functionality includes:

- Employee Management
- Add Employees
- Update Employee Information
- Delete Employees
- Employee Search
- PostgreSQL Database Integration
- RESTful API Endpoints
- CORS Configuration
- JSON Request Parsing

Future modules will include:

- Training Management
- Incident Reporting
- Risk Assessment Register
- Equipment Register
- Inspection Management
- User Authentication
- Role-Based Permissions

---

# Prerequisites

Before running the project, install the following:

- Node.js (v18 or later recommended)
- npm
- PostgreSQL
- Git

Verify installation:

```
node -v
npm -v
psql --version
```

---

# Installation

Clone the repository:

```
git clone <repository-url>
```

Navigate into the project:

```
cd backend
```

Install dependencies:

```
npm install
```

---

# Environment Variables

Create a `.env` file in the project root.

Example:

```
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ohs_online
DB_USER=postgres
DB_PASSWORD=your_password
```

Adjust these values according to your PostgreSQL installation.

---

# Database Setup

Create the PostgreSQL database.

Example:

```
CREATE DATABASE ohs_online;
```

Run the SQL scripts to create the required tables.

Ensure the database credentials in the `.env` file match your PostgreSQL configuration.

---

# Running the Project

Development mode:

```
npm run dev
```

Production build:

```
npm run build
```

Run production server:

```
npm start
```

The API will be available at:

```
http://localhost:3000
```

---

# API Endpoints

Current endpoints include:

### Employees

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /employees | Retrieve all employees |
| GET | /employees/:id | Retrieve a single employee |
| POST | /employees | Create a new employee |
| PUT | /employees/:id | Update an employee |
| DELETE | /employees/:id | Delete an employee |

Additional endpoints will be added as new modules are developed.

---

# Entry Point

The backend entry point is:

```
src/index.ts
```

This file is responsible for:

- Creating the Express application
- Connecting to PostgreSQL
- Registering middleware
- Registering API routes
- Starting the HTTP server

---

# Dependencies

Project dependencies are managed through:

```
package.json
```

Unlike Python applications, this project **does not use** a `requirements.txt` file.

Node.js automatically installs all required packages using:

```
npm install
```

---

# Build Process

Compile the TypeScript project:

```
npm run build
```

Compiled JavaScript files are generated inside the `dist/` folder.

---

# Azure Deployment

This backend is intended to be deployed as a **Node.js Azure App Service**.

Deployment requirements include:

- package.json committed
- package-lock.json committed
- tsconfig.json committed
- Source code committed to GitHub
- Azure configured for Node.js
- Environment variables configured in Azure App Service



---

# Development Workflow

1. Create a feature branch.
2. Make code changes.
3. Test locally.
4. Commit changes.
5. Push to GitHub.
6. Deploy through GitHub Actions/Azure.

---

# Error Handling

The API returns appropriate HTTP status codes.

Examples:

- 200 OK
- 201 Created
- 400 Bad Request
- 404 Not Found
- 500 Internal Server Error

---

# CORS

The backend currently allows requests from the frontend development server.

Example:

```
http://localhost:5173
```

This should be updated for production deployment.

---

# Contributors

Resego, Britney
Frontend Development

Resego
Backend Development



---

# License

Internal company project.

Developed for Reginald SHERQ Services.

Not intended for public distribution.