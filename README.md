# lldbeauty

Technical skeleton for `lldbeauty` with Angular 20, NestJS 11, Prisma, AdminJS, PostgreSQL 17, and Docker.

## Structure

```text
lldbeauty/
├── frontend/
├── backend/
├── docker-compose.yml
├── .env
└── docs/
```

## Prerequisites

- Node.js 22 LTS
- npm
- Docker
- Docker Compose

## Run with Docker

```bash
docker compose up --build
```

## Local URLs

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- AdminJS: `http://localhost:3000/admin`

## Notes

- This repository currently contains only the technical skeleton.
- No business logic, reservation feature, or user model is included.
