# EventZen - Event Management Platform

> A full-stack multi-service event management system built with React, Spring Boot, .NET 10, and Node.js.

[![Java](https://img.shields.io/badge/Java-17-orange)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-brightgreen)](https://spring.io/projects/spring-boot)
[![.NET](https://img.shields.io/badge/.NET-10-purple)](https://dotnet.microsoft.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)](https://www.docker.com/)

---

## Overview

EventZen solves four core challenges faced by event planning companies:

| Challenge | Solution |
|---|---|
| Manual Event Scheduling | Automated event creation linked to venues with real-time capacity management |
| Inefficient Attendee Management | Digital booking flow ,ticket selection ,mock payment , instant confirmation |
| Complex Budget Tracking | Vendor dashboard with earned revenue, expenses, and break-even analysis |
| Limited Customer Engagement | Role-based platform for browsing, booking, and reviewing events |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend :3000                   │
└──────┬──────────────┬──────────────┬──────────────┬─────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────────┐  ┌────────┐  ┌──────────┐
│   Auth   │  │    Event     │  │ Venue  │  │ Booking  │
│  :8080   │  │   :8081      │  │ :5193  │  │  :3001   │
│Spring    │  │ Spring Boot  │  │ .NET   │  │ Node.js  │
│ Boot     │  │              │  │  10    │  │ Express  │
└────┬─────┘  └──────┬───────┘  └───┬────┘  └────┬─────┘
     │               │              │             │
     └───────────────┴──────────────┴─────────────┘
                              │
                    ┌─────────▼────────┐
                    │   MySQL :3306    │
                    │  eventmanagerdb  │
                    └──────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Axios, React Toastify, Lucide React |
| Auth Service | Spring Boot 4.0, Spring Security, JWT, JPA, Lombok, MySQL |
| Event Service | Spring Boot 4.0, Spring Security, JWT validation, JPA, MySQL |
| Venue Service | .NET 10, ASP.NET Core Web API, EF Core + Pomelo, JWT Bearer |
| Booking Service | Node.js + Express 5, Sequelize 6, MySQL2, jsonwebtoken, axios |
| Database | MySQL 8.0 |
| Testing | JUnit 5 + Mockito, xUnit + Moq, Jest + Supertest, React Testing Library |
| DevOps | Docker + Docker Compose |
| API Docs | Swagger / OpenAPI on all 3 backends |

---

## Project Structure

```
EventZen/
├── Authentication_Module/    # Spring Boot — JWT auth, user management
├── Event_Management_Module/  # Spring Boot — Events
├── Venue_Management_Module/  # .NET 10     — Venue registration, budget tracking
├── Booking_Module/           # Node.js     — Bookings, feedback
├── frontend/                 # React 19    — Role-based Access
├── docker-compose.yml
└── Dockerfile
```

---

## Roles & Permissions

| Feature | USER | VENDOR | ADMIN |
|---|:---:|:---:|:---:|
| Browse & book events | Yes | Yes | Yes |
| Leave feedback on confirmed bookings only | Yes | Yes | Yes |
| Register venues | No | Yes | Yes |
| Create & manage events | No | Yes (own) | Yes |
| Budget & revenue dashboard | No | Yes | Yes |
| Manage all users | No | No | Yes |
| Manage all bookings | No | No | Yes |

---

## Running with Docker

### Start all services

```bash
git clone https://github.com/Deblina31/EventZen.git
cd EventZen
docker-compose up --build
```

All services will start automatically.

### Service URLs (after Docker start)

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Auth API + Swagger | http://localhost:8080/swagger-ui.html |
| Event API + Swagger | http://localhost:8081/swagger-ui.html |
| Venue API + Swagger | http://localhost:5193/swagger |
| Booking API | http://localhost:3001/api/v1 |
| MySQL | localhost:3306 |

### To stop all services

```bash
docker-compose down
```

---

## Running Locally (without Docker)

### Prerequisites

- Java 17
- .NET 10 SDK
- Node.js 22
- MySQL 8.0
- Maven

### 1. Start MySQL and create database

```sql
CREATE DATABASE eventmanagerdb;
```

### 2. Auth Service

```bash
cd Authentication_Module
# create .env with DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET
mvn spring-boot:run
# runs on http://localhost:8080
```

### 3. Event Service

```bash
cd Event_Management_Module
# create .env with same DB + JWT config
mvn spring-boot:run
# runs on http://localhost:8081
```

### 4. Venue Service

```bash
cd Venue_Management_Module/VenueService
# edit appsettings.Development.json with DB connection string + JWT secret
dotnet run
# runs on http://localhost:5193
```

### 5. Booking Service

```bash
cd Booking_Module
cp .env.example .env
# fill in DB_HOST, DB_USER, DB_PASS, JWT_SECRET
npm install
npm run dev
# runs on http://localhost:3001
```

### 6. Frontend

```bash
cd frontend
npm install
npm start
# runs on http://localhost:3000
```

---
## Author

**Deblina Singha Roy**
---

*Capstone Project for CloudThat / Deloitte Training Program, 2026*
