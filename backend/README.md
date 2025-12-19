# RMS Backend - Recruitment Management System

A secure, scalable backend API built with NestJS, MongoDB, and JWT authentication for an internal recruitment platform.

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT
- **Validation**: class-validator / class-transformer

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Quick Start Guide

### Option 1: Using Docker (Recommended)

The easiest way to run the project is using Docker Compose:

```bash
docker-compose up -d
```

This will:
- Start MongoDB container
- Build and start the application
- Make API available at `http://localhost:3000`

**After starting with Docker, run the seed script:**
```bash
npm run seed
```

To stop:
```bash
docker-compose down
```

### Option 2: Local Development Setup

#### Step 1: Install Dependencies

```bash
npm install
```

#### Step 2: Setup Environment Variables

Copy the example environment file:

```bash
# On Windows
copy env.example .env

# On Linux/Mac
cp env.example .env
```

Edit `.env` file with your configuration:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=rms
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=3600s
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

**Important**: 
- Replace `JWT_SECRET` and `JWT_REFRESH_SECRET` with strong, random strings
- Ensure MongoDB is installed and running on your system
- Update `MONGODB_URI` if MongoDB is running on a different host/port

#### Step 3: Start MongoDB

Make sure MongoDB is running:

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Or start MongoDB service
# Windows: net start MongoDB
# Linux: sudo systemctl start mongod
# Mac: brew services start mongodb-community
```

#### Step 4: Seed Database (REQUIRED - Run This First!)

**⚠️ IMPORTANT**: You must run the seed script before starting the application to create initial users and data. Without this, you won't be able to login.

Populate the database with sample data:

```bash
npm run seed
```

This creates:
- Sample users (Admin, Employee, Agency) with default credentials
- Sample clients, job templates, job vacancies, and candidates
- Default roles and permissions

**Note**: The seed script is idempotent - it will skip creating data that already exists.

#### Step 5: Run the Application

**Development mode (with hot reload - Recommended for first run):**
```bash
npm run dev
```
This command automatically compiles TypeScript and watches for changes. No build step required.

**Production mode:**
```bash
# First, build the project
npm run build

# Then start the production server
npm run start:prod
# OR simply
npm run start
```

**Note**: The `npm run start` command requires the project to be built first. For development, always use `npm run dev`.

The API will be available at `http://localhost:3000`

## Getting Started - First Login

**Before you can use the API, you must run the seed script** (`npm run seed`) to create initial users.

### Test Credentials

After running the seed script, use these credentials to login:

- **Admin User**: 
  - Email: `admin@rms.com`
  - Password: `password123`
  - Access: Full system access

- **Employee User**: 
  - Email: `employee@rms.com`
  - Password: `password123`
  - Access: Manage clients and job vacancies

- **Agency User**: 
  - Email: `agency@rms.com`
  - Password: `password123`
  - Access: Manage candidates for assigned jobs

### First API Call

1. **Login** to get your access token:
   ```
   POST http://localhost:3000/api/v1/auth/login
   Content-Type: application/json
   
   {
     "email": "admin@rms.com",
     "password": "password123"
   }
   ```

2. **Copy the `accessToken`** from the response

3. **Use the token** in subsequent API calls:
   ```
   Authorization: Bearer <your-access-token>
   ```

## API Documentation

Once the application is running, you can access:

- **Swagger UI**: `http://localhost:3000/api-docs` - Interactive API documentation with all endpoints
- **Postman Collection**: `RMS_API_Collection.postman_collection.json` - Import into Postman for API testing

## Architecture Overview

### Module Structure

- **Auth Module**: Handles JWT authentication and login
- **Users Module**: User management and password hashing
- **Roles & Permissions Module**: RBAC implementation with dynamic permissions
- **Clients Module**: Client management
- **Job Templates Module**: Job template definitions
- **Job Vacancies Module**: Job vacancy management
- **Agencies Module**: Agency management
- **Candidates Module**: Candidate management
- **Audit Module**: Audit logging

### Database Schema

#### User
- Email (unique, indexed)
- Password (hashed with bcrypt)
- Full Name
- Roles (array of ObjectIds referencing Role)
- isActive flag
- lastLoginAt timestamp

#### Role
- Name (unique, indexed)
- Description
- Permissions (array of ObjectIds referencing Permission)
- isActive flag

#### Permission
- Name (unique, indexed)
- Description
- isActive flag

#### Client
- Name
- Description
- Contact information (email, phone, address)
- Assigned Employee (reference to User)
- isActive flag

#### Job Template
- Name
- Description
- Client (reference to Client)
- Candidate Data Schema (dynamic fields array)
- isActive flag

#### Job Vacancy
- Name
- Description
- Client (reference to Client)
- Job Template (reference to JobTemplate)
- Candidate Data Schema (snapshot from template, editable)
- Assigned Agencies (array of references to Agency)
- Created By (reference to User)
- isActive flag

#### Candidate
- Job Vacancy (reference to JobVacancy)
- Created By (reference to User - Agency user)
- Data (dynamic object following job vacancy schema)
- isActive flag

### Security Features

- **Password Hashing**: Bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based authentication with access and refresh tokens
- **JWT Expiration & Refresh**: Access tokens expire (configurable), refresh tokens for token renewal
- **Role-Based Access Control**: Dynamic permissions stored in database
- **Input Validation**: DTO-based validation with class-validator
- **Password Exclusion**: Passwords are automatically excluded from JSON responses
- **IDOR Prevention**: Object-level authorization checks prevent unauthorized access
- **Route-level Security**: Role & permission checks at route level using guards and decorators

### MongoDB Indexing

All schemas include proper indexes for optimal query performance:
- User: email (unique), isActive, roles
- Role: name (unique), isActive
- Permission: name (unique), isActive
- Client: assignedEmployee, isActive, name
- Job Template: client, isActive, name
- Job Vacancy: client, jobTemplate, assignedAgencies, createdBy, isActive, name
- Candidate: jobVacancy, createdBy, isActive, (jobVacancy, createdBy)

### Performance Optimizations

- **Pagination**: All listing endpoints support pagination (page, limit query parameters)
- **Lean Queries**: Read operations use `.lean()` for better performance
- **Proper Projections**: Only necessary fields are populated and selected
- **Parallel Queries**: Count and data queries run in parallel using Promise.all
- **Indexed Fields**: All frequently queried fields are properly indexed

## Development

### Code Quality

```bash
npm run lint
```

### Testing

```bash
npm test
npm run test:e2e
```

## Available Commands

- `npm run dev` - Start in development mode (with hot reload)
- `npm run build` - Build for production
- `npm run start` - Start in production mode (requires build first)
- `npm run start:prod` - Start in production mode (requires build first)
- `npm run seed` - Populate database with sample data
- `npm run lint` - Run code linting
- `npm test` - Run tests
- `npm run test:e2e` - Run end-to-end tests
