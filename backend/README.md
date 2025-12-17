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

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the `env.example` file to `.env` and configure the following variables:

```bash
cp env.example .env
```

### 3. Environment Variables

Edit `.env` file with your configuration:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=rms
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=3600s
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d
```

**Important**: 
- Replace `JWT_SECRET` and `JWT_REFRESH_SECRET` with strong, random strings in production
- Update `MONGODB_URI` if your MongoDB instance is not running on localhost:27017
- Ensure MongoDB is running before starting the application

### 4. Run the Application

**Development mode:**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

### 5. API Documentation

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

### Security Features

- **Password Hashing**: Bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Dynamic permissions stored in database
- **Input Validation**: DTO-based validation with class-validator
- **Password Exclusion**: Passwords are automatically excluded from JSON responses

### MongoDB Indexing

All schemas include proper indexes for optimal query performance:
- User: email (unique), isActive, roles
- Role: name (unique), isActive
- Permission: name (unique), isActive
- Client: assignedEmployee, isActive, name
- Job Template: client, isActive, name

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
