# Smart Campus Resource Sharing — Backend

Node.js/Express + MongoDB backend implementing the full spec: Student, Faculty,
Library Staff, Lab Staff and Admin dashboards, resource sharing, booking/return
flows, notifications (with realtime pop-up via Socket.io) and the daily deadline
engine.

## Tech stack
- Express 4, Mongoose 8 (MongoDB)
- JWT auth (`jsonwebtoken`, `bcryptjs`)
- Multer for photo / resource file uploads (served from `/uploads`)
- Socket.io for realtime notification pop-ups
- node-cron for the daily 00:00 deadline engine

## Setup

```bash
cd smart-campus-backend
npm install
cp .env.example .env      # then edit MONGO_URI, JWT_SECRET, etc.
npm run dev                # nodemon, or: npm start
```

Requires a running MongoDB instance (local `mongod` or Atlas connection string
in `MONGO_URI`).

On first boot, if no admin account exists yet, one is auto-created from
`BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` in `.env` — log in with
that, then create every other account (student/faculty/staff) from the Admin
dashboard, since there is no public registration.

## Auth
Every route except `POST /api/auth/login` requires:
`Authorization: Bearer <token>` (token returned from login).

Realtime notifications: connect Socket.io client with
`io(url, { auth: { token: '<jwt>' } })`; listen for the `notification:new` event.

## Route map

### Auth — `/api/auth`
| Method | Path | Access |
|---|---|---|
| POST | /login | Public |
| GET | /me | Any logged-in role |
| PUT | /profile | Any (multipart `photo`) |
| PUT | /change-password | Any |

### Student — `/api/student` (role: student)
- `GET /departments`, `GET /departments/:deptId/classrooms`
- `POST /classrooms/:id/join`, `GET /classrooms/joined`, `GET /classrooms/:id`
- `GET /classrooms/:id/subjects/:subject/resources`
- `POST /classrooms/:id/subjects/:subject/notes` (multipart `file`)
- `GET /library/sections`, `GET /library/sections/:section/books`, `POST /library/books/:id/request`
- `GET /lab/departments/:deptId/sections`, `GET /lab/departments/:deptId/sections/:section/equipment`, `POST /lab/equipment/:id/request`
- `GET /history`

### Faculty — `/api/faculty` (role: faculty)
- `GET /classrooms` (join/create screen), `GET /classrooms/mine`
- `POST /classrooms` (create), `POST /classrooms/:id/join`
- `GET /classrooms/:id`
- `POST /classrooms/:id/resources` (multipart `file`)
- `GET /resources/mine?classroom=&subject=&type=&from=&to=`

### Library Staff — `/api/library-staff` (role: library_staff)
- `GET /sections`, `GET /sections/:section/books`
- `POST /books`, `GET /books/:id`, `PUT /books/:id`, `DELETE /books/:id`
- `GET /issued`, `GET /overdue`
- `GET /requests?status=pending`, `PUT /requests/:id/decision`, `PUT /requests/:id/return`
- `GET /return-tracking`

### Lab Staff — `/api/lab-staff` (role: lab_staff, department-scoped)
- Same shape as library staff, `/equipment` instead of `/books`, `/booked` instead of `/issued`

### Admin — `/api/admin` (role: admin)
- `GET/POST /users`, `GET /users/:id`, `PUT /users/:id/disable`, `PUT /users/:id/enable`, `PUT /users/:id/reset-password`
- `GET/POST /departments`, `GET /departments/:id/classrooms`, `DELETE /departments/:id`
- `GET /analytics`, `GET /audit-log`

#### Creating accounts (admin-only — there is no public registration)

Only the bootstrap admin exists on first boot. Every other account — faculty,
student, library staff, lab staff, and any further admins — must be created by
logging in as admin and calling `POST /api/admin/users`. Create a department
first (needed for student/faculty/lab_staff), then use its `_id`:

```
POST /api/admin/departments
{ "name": "Computer Science", "code": "CSE" }
```

```
POST /api/admin/users   (role: faculty)
{
  "role": "faculty",
  "name": "Dr. Meera",
  "email": "meera@campus.edu",
  "password": "Faculty@123",
  "department": "<CSE department _id>",
  "designation": "Assistant Professor"
}
```

```
POST /api/admin/users   (role: student)
{
  "role": "student",
  "name": "Arun Kumar",
  "email": "arun@campus.edu",
  "password": "Student@123",
  "department": "<CSE department _id>",
  "year": "II",
  "batch": "2024-2028"
}
```

```
POST /api/admin/users   (role: library_staff — no department, manages a
                          single university-wide book inventory)
{
  "role": "library_staff",
  "name": "Library Staff 1",
  "email": "library1@campus.edu",
  "password": "Library@123"
}
```

```
POST /api/admin/users   (role: lab_staff — department required, manages only
                          that department's equipment)
{
  "role": "lab_staff",
  "name": "Lab Staff 1",
  "email": "lab1@campus.edu",
  "password": "Lab@123",
  "department": "<CSE department _id>"
}
```

Every one of these calls needs `Authorization: Bearer <admin token>`. After
creating an account, log in with its email/password at `POST /api/auth/login`
to get that role's own token and test its routes (`/api/student/...`,
`/api/faculty/...`, `/api/library-staff/...`, `/api/lab-staff/...`).

### Notifications — `/api/notifications` (any role)
- `GET /`, `PUT /:id/read`, `PUT /clear-all`

## Design notes
- One `users` collection with Mongoose discriminators per role (`role` field) —
  keeps a single login endpoint while giving each role its own schema fields.
- Classroom identity is `{DEPT}-{YEAR}-{SECTION}`, enforced unique; faculty
  creating a duplicate gets a "Join it instead" error as specified.
- Resource types faculty can post: syllabus, blueprint, previous_year_qp,
  notes, study_material. Students may only post `notes`.
- Admin never hard-deletes users/departments with active ties — only disable,
  matching the spec.
- `src/jobs/deadlineEngine.js` runs daily at 00:00 (server time): sends a
  reminder for anything due tomorrow, and flips anything past due to `overdue`.