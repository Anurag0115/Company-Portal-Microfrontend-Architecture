# Simple Microfrontend Demo

A minimal microfrontend demonstration with role-based authentication and inter-service communication.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Host App      │    │   HR App        │    │   IT App        │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 3002)   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Admin     │ │    │ │   HR User   │ │    │ │   IT User   │ │
│ │   View Only │ │    │ │   Full CRUD │ │    │ │   Full CRUD │ │
│ │   Requests  │ │    │ │   Access    │ │    │ │   Access    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Backend API   │
                    │   (Port 5000)   │
                    │                 │
                    │ ┌─────────────┐ │
                    │ │   Express   │ │
                    │ │   Server    │ │
                    │ └─────────────┘ │
                    └─────────────────┘
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start all services:**
   ```bash
   npm run dev
   ```

3. **Access the applications:**
   - **Main Portal:** http://localhost:3000
   - **HR App:** http://localhost:3001
   - **IT App:** http://localhost:3002
   - **Backend API:** http://localhost:5000

## 🔐 Authentication

### Demo Credentials

| Role | Username | Password | Access |
|------|----------|----------|---------|
| **Admin** | `admin` | `admin123` | View all data, send change requests |
| **HR** | `hr` | `hr123` | Full HR department access |
| **IT** | `it` | `it123` | Full IT department access |

### Role-Based Access Control

- **Admin**: Can view data from both departments, send change requests, but cannot make direct changes
- **HR User**: Can only access HR department and make changes to employees, policies, and reports
- **IT User**: Can only access IT department and make changes to tickets, systems, and maintenance

## 📋 Features

### 🔐 Authentication & Authorization
- **Login System**: Secure login with role-based access
- **Role-Based UI**: Different interfaces based on user role
- **Session Management**: Persistent login state

### 👥 HR Department Features
- **Employee Management**: Add, view employees with details
- **Policy Management**: Create and manage company policies
- **Report Generation**: Generate HR reports
- **Change Requests**: Receive and complete admin requests

### 💻 IT Department Features
- **System Monitoring**: Add and monitor system status
- **Ticket Management**: Create and track support tickets
- **Maintenance Scheduling**: Schedule system maintenance
- **Change Requests**: Receive and complete admin requests

### 👨‍💼 Admin Features
- **Cross-Department View**: View data from both HR and IT
- **Change Request System**: Send requests to departments
- **Request Tracking**: Monitor request status and completion
- **Real-time Notifications**: Get notified of all activities

### 📡 API Endpoints

```bash
# Health check
GET http://localhost:5000/api/health

# Get all messages
GET http://localhost:5000/api/messages

# Send a message
POST http://localhost:5000/api/message
Content-Type: application/json

{
  "message": "Hello from admin",
  "department": "hr"
}
```

## 🔄 Communication Flow

### Admin → Department Communication
1. **Admin sends change request** via the main portal
2. **Request appears** in the target department's interface
3. **Department completes** the request
4. **Admin gets notified** of completion

### Department → Admin Communication
1. **Department makes changes** (add employee, create ticket, etc.)
2. **Admin receives notification** in real-time
3. **Stats update automatically** in admin dashboard

### Inter-Service Communication
- **Iframe Communication**: Using `postMessage` API
- **REST API**: Backend communication via Express server
- **Real-time Updates**: Live notifications and stats

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Communication**: Iframes + REST API
- **Build Tool**: Vite
- **Package Manager**: npm workspaces

## 📁 Project Structure

```
├── host/                 # Main portal (Admin interface)
│   ├── src/
│   │   └── App.jsx      # Admin dashboard with role-based access
│   └── package.json
├── mf-hr/               # HR microfrontend
│   ├── src/
│   │   └── App.jsx      # HR department interface
│   └── package.json
├── mf-it/               # IT microfrontend
│   ├── src/
│   │   └── App.jsx      # IT department interface
│   └── package.json
├── backend/             # Express API server
│   ├── server.js        # API endpoints
│   └── package.json
└── package.json         # Root workspace config
```

## 🎯 How It Works

1. **Login**: Users authenticate with role-specific credentials
2. **Role-Based Access**: UI adapts based on user role
3. **Microfrontend Isolation**: Each department runs independently
4. **Cross-Communication**: Admin can view and request changes
5. **Real-time Updates**: All changes are reflected immediately

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Build for production
npm run build
```

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile
- **Role-Based Colors**: Different color schemes per role
- **Real-time Notifications**: Live activity feed
- **Interactive Forms**: Add, edit, and manage data
- **Status Indicators**: Visual feedback for all actions

This demo showcases a complete microfrontend architecture with authentication, role-based access control, and inter-service communication! 🚀 