# Notes API

A RESTful backend API for a notes application.
Built with Node.js, Express, and SQLite.

## Tech stack
- Node.js + Express
- SQLite (via better-sqlite3)
- JWT authentication (jsonwebtoken + bcryptjs)

## Setup
```bash
npm install
cp .env.example .env   # add your JWT_SECRET
node server.js
```

## API endpoints
| Method | Endpoint        | Description        | Auth required |
|--------|-----------------|--------------------|---------------|
| POST   | /auth/register  | Create account     | No            |
| POST   | /auth/login     | Login, get token   | No            |
| GET    | /notes          | Get all notes      | Yes           |
| GET    | /notes/:id      | Get one note       | Yes           |
| POST   | /notes          | Create note        | Yes           |
| PUT    | /notes/:id      | Update note        | Yes           |
| DELETE | /notes/:id      | Delete note        | Yes           |