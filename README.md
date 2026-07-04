# FP-Training

Base inicial de la web app para gestión de rutinas de FP-Training.

## Stack

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma

## Primeros pasos

1. Instalar dependencias con `npm install`
2. Copiar `.env.example` a `.env`
3. Levantar PostgreSQL local con `npm run db:up`
4. Generar Prisma Client con `npm run prisma:generate`
5. Ejecutar migraciones con `npm run prisma:migrate`
6. Seedear programas base con `npm run prisma:seed`
7. Levantar el proyecto con `npm run dev`

## Credenciales demo

- admin: `admin@fptraining.local` / `admin1234`
- trainer: `trainer@fptraining.local` / `trainer1234`
- student: `student@fptraining.local` / `student1234`

## Estructura

- `src/app` — rutas y layouts por rol
- `src/components` — componentes reutilizables
- `src/modules` — módulos por dominio
- `src/lib` — utilidades, helpers y configuración
- `prisma/schema.prisma` — modelo de datos inicial
- `prisma/seed.ts` — seed mínimo de programas base
- `docs/fp-training-definicion-mvp.md` — definición consolidada del MVP

## Estado actual

Este bootstrap deja:

- layout raíz
- landings básicas por rol
- estilos globales
- estructura inicial para continuar con Auth.js, Prisma y dominio

## Base local de PostgreSQL

Hay un `docker-compose.yml` listo para levantar una base local con:

- host: `localhost`
- port: `5432`
- db: `fp_training`
- user: `postgres`
- password: `postgres`

## Nota

Auth.js ya quedó integrado con credenciales y roles, pero para iniciar sesión de verdad necesitás que la base tenga:

- migraciones aplicadas
- seed ejecutado
- usuarios demo creados con `passwordHash`

## Estado actual

Además del bootstrap inicial, ahora el proyecto ya tiene:

- configuración local de PostgreSQL
- runtime base de Prisma listo para conectar
- seed mínimo de programas
- módulos iniciales con tipos y servicios placeholder
- scaffolding base para auth futura
