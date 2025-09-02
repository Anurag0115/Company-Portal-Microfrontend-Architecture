# Enterprise Microfrontend Platform

A comprehensive microfrontend demonstration platform with role-based authentication, inter-service communication, and multiple application modules including HR, IT, Finance, and a browser extension.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Portal Host   │    │   HR App        │    │   IT App        │    │  Finance App    │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 3002)   │    │   (Port 3003)   │
│                 │    │                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Admin     │ │    │ │   HR User   │ │    │ │   IT User   │ │    │ │ Finance User│ │
│ │   View Only │ │    │ │   Full CRUD │ │    │ │   Full CRUD │ │    │ │   Full CRUD │ │
│ │   Requests  │ │    │ │   Access    │ │    │ │   Access    │ │    │ │   Access    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         └───────────────────────┼───────────────────────┼───────────────────────┘
                                 │                       │
                    ┌─────────────────┐    ┌─────────────────┐
                    │   Backend API   │    │   Services      │
                    │   (Port 5000)   │    │                 │
                    │                 │    │ ┌─────────────┐ │
                    │ ┌─────────────┐ │    │ │ Python RAG │ │
                    │ │   Express   │ │    │ │ Node API   │ │
                    │ │   Server    │ │    │ │ Extension  │ │
                    │ └─────────────┘ │    │ └─────────────┘ │
                    └─────────────────┘    └─────────────────┘
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
   - **Portal Host:** http://localhost:3000
   - **HR App:** http://localhost:3001
   - **IT App:** http://localhost:3002
   - **Finance App:** http://localhost:3003
   - **Backend API:** http://localhost:5000

## 🔐 Authentication

### Demo Credentials

| Role | Username | Password | Access |
|------|----------|----------|---------|
| **Admin** | `admin` | `admin123` | View all data, send change requests |
| **HR** | `hr` | `hr123` | Full HR department access |
| **IT** | `it` | `it123` | Full IT department access |
| **Finance** | `finance` | `finance123` | Full Finance department access |

### Role-Based Access Control

- **Admin**: Can view data from all departments, send change requests, but cannot make direct changes
- **HR User**: Can only access HR department and make changes to employees, policies, and reports
- **IT User**: Can only access IT department and make changes to tickets, systems, and maintenance
- **Finance User**: Can only access Finance department and make changes to budgets, expenses, and reports

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

### 💰 Finance Department Features
- **Budget Management**: Track and manage department budgets
- **Expense Tracking**: Monitor and categorize expenses
- **Financial Reports**: Generate financial statements
- **Change Requests**: Receive and complete admin requests

### 👨‍💼 Admin Features
- **Cross-Department View**: View data from all departments
- **Change Request System**: Send requests to departments
- **Request Tracking**: Monitor request status and completion
- **Real-time Notifications**: Get notified of all activities

### 🌐 Browser Extension
- **Cross-Platform Integration**: Works across all microfrontends
- **Enhanced Functionality**: Additional features and shortcuts
- **Background Processing**: Handles tasks in the background

### 🤖 AI Services
- **Python RAG**: Retrieval-Augmented Generation for intelligent responses
- **Node API**: Additional API endpoints and services

## 📡 API Endpoints

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
1. **Admin sends change request** via the portal host
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
- **Browser Extension**: Enhanced cross-app functionality

## 🛠️ Tech Stack

### Frontend Technologies
- **React**: Main frontend framework for most apps
- **Vue.js**: Used in HR app for variety
- **Angular**: Used in IT app for framework diversity
- **Vite**: Build tool for fast development

### Backend Technologies
- **Node.js**: Express server for API
- **Python**: RAG service for AI capabilities
- **SQLite**: Database for data persistence

### Infrastructure
- **Docker**: Containerization support
- **npm Workspaces**: Monorepo management

## 📁 Project Structure

```
├── portal-host/          # Main portal (Admin interface)
│   ├── src/
│   │   └── App.jsx      # Admin dashboard with role-based access
│   └── package.json
├── mf-hr/               # HR microfrontend (Vue.js)
│   ├── src/
│   │   └── App.vue      # HR department interface
│   └── package.json
├── mf-it/               # IT microfrontend (Angular)
│   ├── src/
│   │   └── main.ts      # IT department interface
│   └── package.json
├── mf-finance/          # Finance microfrontend (React)
│   ├── src/
│   │   └── App.jsx      # Finance department interface
│   └── package.json
├── backend/             # Express API server
│   ├── server.js        # API endpoints
│   └── package.json
├── services/            # Additional services
│   ├── python-rag/      # Python RAG service
│   └── node-api/        # Additional Node.js API
├── extension/           # Browser extension
│   ├── manifest.json    # Extension configuration
│   ├── background.js    # Background scripts
│   └── options.html     # Extension options
├── infrastructure/      # Infrastructure configs
│   └── docker-compose.yml
└── package.json         # Root workspace config
```

## 🎯 How It Works

1. **Login**: Users authenticate with role-specific credentials
2. **Role-Based Access**: UI adapts based on user role
3. **Microfrontend Isolation**: Each department runs independently
4. **Cross-Communication**: Admin can view and request changes
5. **Real-time Updates**: All changes are reflected immediately
6. **Extension Integration**: Browser extension enhances functionality

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Build for production
npm run build
```

### Individual App Development

```bash
# Start specific apps
npm run -w portal-host dev
npm run -w mf-hr dev
npm run -w mf-it dev
npm run -w mf-finance dev
npm run -w backend dev
```

## 🐳 Docker Support

```bash
# Start with Docker
cd infrastructure
docker-compose up -d
```

## 🌐 Browser Extension

The browser extension provides:
- **Cross-app functionality**: Works across all microfrontends
- **Enhanced features**: Additional shortcuts and capabilities
- **Background processing**: Handles tasks without user interaction

### Installation
1. Load the `extension/` folder as an unpacked extension in Chrome
2. Enable the extension for your development domains
3. Access additional features across all apps

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile
- **Role-Based Colors**: Different color schemes per role
- **Real-time Notifications**: Live activity feed
- **Interactive Forms**: Add, edit, and manage data
- **Status Indicators**: Visual feedback for all actions
- **Multi-Framework**: Experience different frontend frameworks

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
docker-compose -f infrastructure/docker-compose.yml up -d
```

## 🤝 Contributing

This is a demonstration project showcasing:
- **Microfrontend Architecture**: Independent, deployable frontend applications
- **Multi-Framework Approach**: React, Vue.js, and Angular working together
- **Role-Based Access Control**: Secure, role-specific interfaces
- **Real-time Communication**: Live updates across applications
- **Browser Extension Integration**: Enhanced cross-app functionality

## 📝 License

This project is for demonstration purposes and showcases modern web development patterns and microfrontend architecture.

---

This demo showcases a complete enterprise microfrontend platform with authentication, role-based access control, inter-service communication, and multiple frontend frameworks! 🚀 