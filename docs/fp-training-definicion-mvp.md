# FP-Training — definición consolidada MVP

## Resumen
FP-Training va a ser una web app para que un **trainer** organice y asigne rutinas a sus alumnos, y para que el **student** vea desde el celular qué tiene que hacer, cargue resultados y reciba seguimiento.

La app debe contemplar varios universos de trabajo:

- **FP-Training** — gimnasio
- **FP-Stretching** — estiramientos
- **FP-Running** — running/cardio
- **FP-Home** — entrenamientos en casa

## Objetivo del MVP
Resolver este flujo:

1. el trainer crea o reutiliza ejercicios
2. arma una plantilla
3. asigna una rutina/bloque a un alumno en una fecha y hora
4. el alumno entra desde el celular
5. ve sus bloques del día, separados
6. abre cada ejercicio, mira el video si hace falta y carga resultados
7. el trainer revisa cumplimiento y deja feedback

## Roles

### Admin
- gestiona usuarios
- mantiene programas
- mantiene catálogo general

### Trainer
- crea ejercicios
- arma plantillas
- asigna rutinas
- revisa resultados
- deja feedback

### Student
- ve bloques del día
- consulta ejercicios y videos
- carga resultados
- completa entrenamientos

## Reglas de negocio principales
- Un alumno puede pertenecer a **múltiples programas** al mismo tiempo.
- **FP-Home** puede convivir con cualquiera de los otros programas.
- Los entrenamientos del mismo día **no se fusionan**: se muestran como bloques separados.
- La relación trainer ↔ student queda **ligada a un programa**.
- Un mismo alumno puede tener **más de un trainer**, por ejemplo uno para fuerza y otro para cardio.
- La prescripción del trainer y el resultado del alumno son entidades distintas.
- No habrá versionado formal de plantillas en el MVP.
- Sí habrá **snapshot al asignar**, para que los cambios futuros en la plantilla no rompan el historial.

## Stack acordado
- **Next.js**
- **PostgreSQL**
- **Prisma**
- **Auth.js**

## Arquitectura recomendada
Una sola app con rutas/shells por rol:

- **student** → mobile-first
- **trainer** → desktop-first
- **admin** → desktop-first

## Módulos del MVP
- Auth y roles
- Usuarios y asignaciones trainer-student
- Programas y membresías
- Biblioteca de ejercicios
- Media/video por ejercicio
- Plantillas reutilizables
- Rutinas asignadas por fecha y hora
- Resultados del alumno
- Feedback del trainer

## Modelo funcional
El dominio real quedó así:

**Alumno → Fecha/Hora → Rutina asignada → Secciones internas → Ejercicios → Prescripción → Resultado**

Esto surge tanto de la definición del producto como del Excel operativo actual.

## Métricas del MVP

### STRENGTH
Para ejercicios de fuerza. Puede soportar:
- solo repeticiones
- solo peso
- repeticiones + peso
- secuencias más complejas por aproximación o escalado

### DURATION
Para ejercicios medidos por tiempo.

### DISTANCE
Para running y similares.

### CUSTOM
Para casos controlados que no entren en las anteriores.

## Qué validó el Excel actual
Se inspeccionó `excel.xlsx` y se detectaron estas hojas principales:

- `Calentamiento`
- `Entrenamiento`
- `EN CASA!`

### La estructura real hoy incluye:
- semana
- día
- alumno
- rutina
- secciones internas
- ejercicio
- series
- reps
- pausa
- pesos (kg)
- método
- video
- tiempo
- complemento

### También aparecieron secciones concretas como:
- calentamiento
- fuerza preparatoria
- circuit training
- trabajo accesorio
- bloque 1 / 2 / 3 / 4

### Conclusiones del Excel
- la rutina necesita **secciones internas**, no una simple lista plana
- `pause/rest` es un dato real y importante
- `method` es una parte real de la prescripción
- el video ya forma parte del flujo actual
- existen payloads complejos de fuerza como:
  - `LIBRE//8//3//1//1//1`
  - `BARRA//60//80//100//110//115`

## Decisiones de modelado
- separar `Program` de `RoutineTemplate`
- usar tablas intermedias explícitas para membresías y asignaciones trainer-student
- modelar **secciones** dentro de template y rutina asignada
- guardar `metricType` explícito
- usar payloads `Json` para prescripción y resultado
- guardar `rest`, `method` y `complement` como labels explícitos por ejercicio asignado/prescripto
- usar `scheduledAt` con fecha y hora
- soportar feedback general y por ejercicio

## Roadmap por fases

### Fase 0 — definición
- validar reglas de negocio
- validar schema
- validar Figma + Excel

### Fase 1 — base técnica
- bootstrap Next.js
- Auth.js
- Prisma + PostgreSQL
- roles y shells por rol

### Fase 2 — operación base
- CRUD alumnos
- memberships por programa
- trainer-student assignment por programa
- biblioteca de ejercicios

### Fase 3 — plantillas
- crear templates
- secciones de template
- ejercicios prescriptos

### Fase 4 — asignación
- crear rutinas asignadas
- snapshot desde template
- agenda por fecha/hora

### Fase 5 — ejecución alumno
- vista mobile del día
- detalle del bloque
- carga de resultados

### Fase 6 — seguimiento
- dashboard trainer
- cumplimiento
- feedback general y por ejercicio

## Fuera de alcance del MVP
- pagos
- chat
- notificaciones push
- integraciones con wearables
- analytics avanzados
- multi-tenant complejo
- versionado formal de templates

## Schema Prisma v2 propuesto
Se creó una propuesta inicial en:

`prisma/schema.prisma`

### Entidades principales del schema
- `User`
- `Program`
- `StudentProgramMembership`
- `TrainerStudentAssignment`
- `Exercise`
- `ExerciseMedia`
- `RoutineTemplate`
- `RoutineTemplateSection`
- `RoutineTemplateExercise`
- `AssignedRoutine`
- `AssignedRoutineSection`
- `AssignedRoutineExercise`
- `WorkoutSubmission`
- `WorkoutResultEntry`
- `TrainerFeedback`

## Dudas abiertas todavía
1. si algunos ejercicios deberían soportar más de un arquetipo de métrica a futuro
2. si el feedback del trainer necesita estado de revisión además del comentario
3. cómo mapear exactamente los payloads complejos del Excel a formularios amigables mobile
4. si los videos se subirán directamente a la plataforma o quedarán como URLs al principio
5. si habrá importación inicial desde Excel para migrar plantillas existentes

## Recomendación siguiente
El siguiente paso correcto es:

1. revisar y ajustar `prisma/schema.prisma`
2. bootstrapear la app Next.js
3. correr migración inicial
4. seedear programas base, usuarios demo y algunos ejercicios reales del Excel
