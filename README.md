# Inventory & Order Management System

## Overview
Full-stack Inventory Management System built using FastAPI, React, PostgreSQL, and Docker.

## Features
- Product management (CRUD)
- Customer management
- Order creation
- Stock validation
- Automatic stock reduction on order
- Prevent order if stock is insufficient

## Tech Stack
- Backend: FastAPI (Python)
- Frontend: React (Vite)
- Database: PostgreSQL
- Containerization: Docker & Docker Compose

## Setup Instructions

### Backend
```bash
cd backend
uvicorn app.main:app --reload