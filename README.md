# ReachInbox Email Scheduler

**Developed by Aryan Srivastava** **USN:1CR23CI010**


A full-stack email scheduling application that allows users to authenticate, create email campaigns, schedule emails, and process scheduled email jobs using Redis and BullMQ.


---

## Features

- Google OAuth authentication
- User session management
- Create and manage email campaigns
- Add multiple recipients to campaigns
- Schedule emails for a future date and time
- View scheduled emails
- View sent emails
- Campaign status tracking
- PostgreSQL database persistence
- Redis-based job queue
- BullMQ email job processing
- Background email worker
- Email sending using Nodemailer
- Dashboard for campaign and email activity

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- Passport.js
- Google OAuth
- Nodemailer
- Zod

### Infrastructure

- PostgreSQL
- Redis
- BullMQ
- Docker
- Docker Compose

---

## Architecture

```text
                         ┌─────────────────────┐
                         │      Frontend       │
                         │ React + TypeScript  │
                         │       Vite          │
                         └──────────┬──────────┘
                                    │
                                    │ HTTP API
                                    ▼
                         ┌─────────────────────┐
                         │     Backend API     │
                         │   Node.js + Express │
                         └──────────┬──────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                  ┌──────────────┐      ┌──────────────┐
                  │  PostgreSQL  │      │    Redis     │
                  │    Prisma    │      │    BullMQ    │
                  └──────────────┘      └──────┬───────┘
                                               │
                                               │ Jobs
                                               ▼
                                        ┌──────────────┐
                                        │ Email Worker │
                                        │    BullMQ    │
                                        └──────┬───────┘
                                               │
                                               │ Send Email
                                               ▼
                                        ┌──────────────┐
                                        │  Nodemailer  │
                                        │ Email Server │
                                        └──────────────┘
```

### Architecture Flow

1. The user interacts with the React frontend.
2. The frontend communicates with the Express backend through HTTP APIs.
3. The backend stores application data in PostgreSQL using Prisma.
4. Scheduled email jobs are placed into a BullMQ queue backed by Redis.
5. The background email worker monitors the queue.
6. When a scheduled job becomes ready, the worker processes it.
7. Nodemailer sends the email through the configured email provider.
8. Email and campaign status information is persisted in PostgreSQL.

---

## Project Structure

```text
reachinbox-email-scheduler/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── queues/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── workers/
│   │   ├── server.ts
│   │   └── worker.ts
│   │
│   ├── package.json
│   └── docker-compose.yml
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

# Prerequisites

Before running the project, install the following:

- Node.js
- npm
- Git
- Docker Desktop

### Verify Node.js and npm

```powershell
node --version
npm --version
```

### Verify Git

```powershell
git --version
```

### Verify Docker

```powershell
docker --version
docker compose version
```

---

# Installation

## 1. Clone the Repository

```powershell
git clone https://github.com/AryanSrivastava28/reachinbox-email-scheduler.git
```

Move into the project:

```powershell
cd reachinbox-email-scheduler
```

Checkout the scheduler branch:

```powershell
git checkout phase-2-scheduler
```

---

## 2. Install Backend Dependencies

```powershell
cd backend
npm install
```

---

## 3. Install Frontend Dependencies

Open another PowerShell terminal:

```powershell
cd "C:\Users\kapil\OneDrive\Desktop\reachinbox-email-scheduler\frontend"
npm install
```

---

# Environment Variables

The backend requires environment variables for database access, Redis, authentication, sessions, and email configuration.

Create the following file:

```text
backend/.env
```

The required variables depend on the project's environment configuration.

Typical configuration includes:

```text
DATABASE_URL
REDIS_URL
SESSION_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASSWORD
```

Use the project's existing environment configuration as the reference for the exact values.

### Important

Never commit real credentials to GitHub.

Do not commit:

- `.env`
- Database passwords
- Redis credentials
- Google OAuth secrets
- Email passwords
- API keys

The repository should only contain safe example configuration such as `.env.example`.

---

# Running the Application Locally

The application consists of the following components:

1. PostgreSQL
2. Redis
3. Backend API
4. Email Worker
5. Frontend

All required components should be running for the complete application to work.

---

## Startup Order

Every time you want to run the project locally, follow this order:

### Step 1 — Open Docker Desktop

Start **Docker Desktop** first.

Wait until Docker Desktop is fully running.

---

## Step 2 — Start PostgreSQL and Redis

Open PowerShell.

Go to the backend directory:

```powershell
cd "C:\Users\kapil\OneDrive\Desktop\reachinbox-email-scheduler\backend"
```

Start Docker containers:

```powershell
docker compose up -d
```

Check the containers:

```powershell
docker ps
```

PostgreSQL and Redis should be running.

The application uses:

```text
PostgreSQL → Port 5432
Redis      → Port 6379
```

Keep Docker Desktop running while using the application.

---

# Step 3 — Start the Frontend

Open a **new PowerShell terminal**.

Run:

```powershell
cd "C:\Users\kapil\OneDrive\Desktop\reachinbox-email-scheduler\frontend"
```

Start the frontend:

```powershell
npm run dev
```

Vite will display a local URL in the terminal.

Usually it will look similar to:

```text
http://localhost:5173
```

Open the URL shown by Vite in your browser.

---

# Step 4 — Start the Backend API

Open another **new PowerShell terminal**.

Run:

```powershell
cd "C:\Users\kapil\OneDrive\Desktop\reachinbox-email-scheduler\backend"
```

Start the backend:

```powershell
npm run dev:server
```

A successful startup should show:

```text
[server] PostgreSQL connected
[server] Redis connected
[server] API listening on http://localhost:5000
```

The backend API runs on:

```text
http://localhost:5000
```

Keep this terminal running.

---

# Step 5 — Start the Email Worker

Open another **new PowerShell terminal**.

Run:

```powershell
cd "C:\Users\kapil\OneDrive\Desktop\reachinbox-email-scheduler\backend"
```

Start the worker:

```powershell
npm run dev:worker
```

A successful startup should show:

```text
[worker] PostgreSQL connected
[worker] Redis connected
[worker] email worker started
```

The worker is responsible for processing scheduled email jobs.

Keep this terminal running.

---

# Complete Local Startup

You should have the following running:

```text
Docker Desktop
    │
    ├── PostgreSQL : 5432
    └── Redis      : 6379

PowerShell Terminal 1
    └── Docker Compose

PowerShell Terminal 2
    └── Frontend → Vite

PowerShell Terminal 3
    └── Backend → Express API : 5000

PowerShell Terminal 4
    └── Email Worker → BullMQ
```

The normal startup sequence is:

```text
1. Open Docker Desktop
2. docker compose up -d
3. npm run dev
4. npm run dev:server
5. npm run dev:worker
```

---

# Database

The project uses PostgreSQL as the primary persistent database.

Prisma is used as the ORM.

## Generate Prisma Client

From the backend directory:

```powershell
npm run db:generate
```

## Run Database Migration

```powershell
npm run db:migrate
```

## Open Prisma Studio

```powershell
npm run db:studio
```

Prisma Studio provides a graphical interface for inspecting database records.

---

# Redis and BullMQ

Redis is used as the backing store for the BullMQ job queue.

When a user schedules an email, the flow is:

```text
User
 ↓
Frontend
 ↓
Backend API
 ↓
BullMQ Queue
 ↓
Redis
 ↓
Email Worker
 ↓
Nodemailer
 ↓
Recipient
```

BullMQ handles the scheduling and processing of background email jobs.

---

# Feature Implementation

## 1. Authentication

The application uses Passport.js and Google OAuth for authentication.

Users authenticate through Google and the backend manages their authenticated session.

---

## 2. Campaign Management

Users can create and manage email campaigns.

Campaign information is persisted in PostgreSQL using Prisma.

A campaign can contain multiple recipients and scheduled email information.

---

## 3. Email Scheduling

Users can schedule emails for a future date and time.

The backend creates a BullMQ job containing the required email information.

The job is stored in Redis until it becomes ready for processing.

---

## 4. Background Email Worker

The email worker continuously monitors the BullMQ queue.

When a scheduled job becomes available, the worker processes it.

The worker uses the configured email service to send the email.

This allows email processing to happen independently from the main HTTP API.

---

## 5. Email Sending

Nodemailer is used for sending emails.

The email transport is configured through environment variables.

Credentials are never stored directly in source code.

---

## 6. Scheduled Emails

The frontend provides a view for scheduled email jobs.

Users can monitor scheduled emails and their associated campaign information.

---

## 7. Sent Emails

After an email has been successfully processed, the application tracks the email status.

The frontend provides a sent-email view for monitoring completed email jobs.

---

## 8. Dashboard

The dashboard provides an overview of campaigns and email activity.

It allows users to navigate between campaigns, scheduled emails, sent emails, and other application functionality.

---

# Backend Scripts

Run these commands from the `backend` directory.

### Development Server

```powershell
npm run dev:server
```

Starts the Express API in development mode.

### Development Worker

```powershell
npm run dev:worker
```

Starts the background email worker.

### Build

```powershell
npm run build
```

Compiles the TypeScript backend.

### Type Check

```powershell
npm run typecheck
```

Runs TypeScript type checking without generating output files.

### Prisma Generate

```powershell
npm run db:generate
```

Generates the Prisma Client.

### Prisma Migration

```powershell
npm run db:migrate
```

Creates and applies Prisma database migrations.

### Prisma Studio

```powershell
npm run db:studio
```

Opens Prisma Studio.

---

# Frontend Scripts

Run these commands from the `frontend` directory.

### Development

```powershell
npm run dev
```

Starts the Vite development server.

### Build

```powershell
npm run build
```

Creates the production frontend build.

### Preview

```powershell
npm run preview
```

Previews the production build locally.

---

# Error Handling

The backend includes middleware for handling API errors and validating incoming requests.

The frontend includes loading and error states for API operations.

---

# Security

The application follows these basic security practices:

- Real credentials are stored in environment variables.
- `.env` files are excluded from Git.
- `node_modules` are excluded from Git.
- Generated `dist` files are excluded from Git.
- OAuth secrets are not committed to source control.
- Email credentials are not committed to source control.
- Database credentials are not committed to source control.

---

# Troubleshooting

## PostgreSQL or Redis Is Not Connecting

Make sure Docker Desktop is running.

Then check the containers:

```powershell
docker ps
```

Verify that PostgreSQL and Redis containers are running.

If they are stopped, run:

```powershell
cd "C:\Users\kapil\OneDrive\Desktop\reachinbox-email-scheduler\backend"

docker compose up -d
```

Then check again:

```powershell
docker ps
```

---

## Backend Port 5000 Already in Use

If the backend shows:

```text
Error: listen EADDRINUSE: address already in use :::5000
```

another process is already using port 5000.

Find the process:

```powershell
netstat -ano | findstr :5000
```

You may see something similar to:

```text
TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    17180
```

The last number is the PID.

Check the process:

```powershell
tasklist /FI "PID eq 17180"
```

If it is an old Node.js backend process, terminate it:

```powershell
taskkill /PID 17180 /F
```

Then verify that port 5000 is free:

```powershell
netstat -ano | findstr :5000
```

If nothing is returned, start the backend again:

```powershell
npm run dev:server
```

A successful result should be:

```text
[server] PostgreSQL connected
[server] Redis connected
[server] API listening on http://localhost:5000
```

---

## Backend Starts but PostgreSQL Does Not Connect

Check Docker:

```powershell
docker ps
```

Then verify the PostgreSQL container is running.

Also verify that `DATABASE_URL` in:

```text
backend/.env
```

matches the PostgreSQL configuration used by Docker Compose.

---

## Backend Starts but Redis Does Not Connect

Check:

```powershell
docker ps
```

Make sure the Redis container is running.

Also verify:

```text
REDIS_URL
```

inside `backend/.env`.

---

## Worker Does Not Start

Make sure:

1. Docker Desktop is running.
2. PostgreSQL is running.
3. Redis is running.
4. The backend environment variables are configured.
5. The backend dependencies have been installed.

Then run:

```powershell
cd "C:\Users\kapil\OneDrive\Desktop\reachinbox-email-scheduler\backend"

npm run dev:worker
```

A successful worker startup should show:

```text
[worker] PostgreSQL connected
[worker] Redis connected
[worker] email worker started
```

---

# Deployment

The application consists of multiple services:

- Frontend
- Backend API
- PostgreSQL
- Redis
- Email Worker

For production deployment, each service must be configured with production environment variables and appropriate publicly accessible service URLs.

The frontend must communicate with the deployed backend API rather than `localhost`.

The backend and email worker must have access to the production PostgreSQL and Redis instances.

---

# Hosted Application

After deploying the application, add the deployed frontend URL here:

```text
Hosted URL: ADD_DEPLOYED_FRONTEND_URL_HERE
```

This section should be updated once the application has been deployed to a hosting platform.

---

# GitHub Repository

Repository:

```text
https://github.com/AryanSrivastava28/reachinbox-email-scheduler
```

Development branch:

```text
phase-2-scheduler
```

---

# Development Notes

The project is currently developed and tested locally using:

- Windows
- PowerShell
- Docker Desktop
- PostgreSQL
- Redis
- Node.js
- npm

The local development environment requires Docker Desktop to be running before starting PostgreSQL and Redis.

---

# License

This project was developed as a full-stack email scheduling application.

---

# Author

**Aryan Srivastava**  **USN:1CR23CI010**

BE CSE-AIML  
CMR Institute of Technology, Bangalore

GitHub: https://github.com/AryanSrivastava28