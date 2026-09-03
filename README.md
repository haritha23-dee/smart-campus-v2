# Smart Campus Resource Sharing Portal

A MERN stack web app built for managing campus resources — classroom notes, library books, and lab equipment — with separate dashboards for students, faculty, library staff, lab staff, and admin.

## Tech Stack

- MongoDB
- Express.js
- React (Vite)
- Node.js
- Tailwind CSS
- Socket.io for real-time notifications
- JWT for authentication

## Folder Structure

```
smart-campus/
├── backend/
│   ├── src/
│   │   ├── config/          # constants, db connection
│   │   ├── controllers/     # route logic per role
│   │   ├── middleware/      # auth, upload, error handling
│   │   ├── models/          # mongoose schemas
│   │   ├── routes/          # express routers
│   │   ├── sockets/         # socket.io setup
│   │   ├── utils/           # notify helper etc
│   │   └── app.js
│   ├── uploads/             # uploaded photos and resources
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # shared UI (navbar, modal, toast)
│   │   ├── context/         # auth and notification context
│   │   ├── pages/           # role-based pages
│   │   ├── routes/          # route protection, app routes
│   │   ├── services/        # axios API calls per role
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## Setup

### 1. Clone the repo

```
git clone <repo-url>
cd smart-campus
```

### 2. Backend setup

```
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-campus
JWT_SECRET=your_secret_here
CLIENT_ORIGIN=http://localhost:5173
```

Make sure MongoDB is running locally, or use a MongoDB Atlas connection string in `MONGO_URI`.

Start the backend:

```
npm run dev
```

Runs on `http://localhost:5000`.

### 3. Frontend setup

Open a new terminal:

```
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```
npm run dev
```

Runs on `http://localhost:5173`.

### 4. First login

There's no public sign-up flow. Seed an admin user directly in MongoDB, or run whatever seed script is set up in `backend/`, then log in as admin to create departments and other users from there. Supported roles: `student`, `faculty`, `library_staff`, `lab_staff`, `admin`.

## Notes

- Uploaded files (profile photos, classroom resources, equipment photos) are stored under `backend/uploads/` and served as static files — make sure this folder isn't wiped on deploy if you're using ephemeral hosting.
- Real-time notifications need both the frontend and backend running at the same time. Socket.io connects automatically once a user is logged in.
- Keep `VITE_API_URL` and `CLIENT_ORIGIN` in sync with wherever each service is actually running, or CORS and API calls will fail silently.
