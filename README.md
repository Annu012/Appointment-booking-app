# Appointment Booking System

A full-stack appointment booking application built with React, Node.js, Express, and PostgreSQL.

## 🏗️ Architecture

### Backend (`/api`)
- **Framework**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod schemas
- **Security**: CORS, rate limiting, input validation
- **Testing**: Jest + Supertest

### Frontend (`/web`)
- **Framework**: React + Vite + TypeScript
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **State**: React Context for authentication
- **HTTP Client**: Fetch API with interceptors

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### 1. Clone and Install
```bash
git clone <your-repo>
cd appointment-booking
npm install
cd api && npm install
cd ../web && npm install
```

### 2. Database Setup
Create a PostgreSQL database and copy the connection URL.

### 3. Environment Variables

**Backend** (`/api/.env`):
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/appointment_booking"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
FRONTEND_URL="http://localhost:5173"
PORT=3001
```

**Frontend** (automatically uses proxy for local development)

### 4. Database Migration & Seeding
```bash
cd api
npm run generate
npm run migrate
npm run seed
```

### 5. Start Development Servers
```bash
# Terminal 1 - API
cd api && npm run dev

# Terminal 2 - Web  
cd web && npm run dev
```

Visit: http://localhost:5173

## 🧪 Testing

```bash
cd api && npm test
```

## 🔐 Demo Accounts

- **Patient**: patient@example.com / Passw0rd!
- **Admin**: admin@example.com / Passw0rd!

## 📋 API Endpoints

### Authentication
- `POST /api/register` - Register new patient
- `POST /api/login` - Login user

### Slots
- `GET /api/slots?from=YYYY-MM-DD&to=YYYY-MM-DD` - Get available slots

### Bookings  
- `POST /api/book` - Book appointment (patient only)
- `GET /api/my-bookings` - Get user's bookings (patient only)
- `GET /api/all-bookings` - Get all bookings (admin only)

## 🛠️ API Verification Commands

```bash
# 1. Register
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123!"}'

# 2. Login  
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# 3. Get Slots
curl -X GET http://localhost:3001/api/slots \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Book Slot
curl -X POST http://localhost:3001/api/book \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slotId":"SLOT_UUID"}'

# 5. Book Same Slot (should fail with 409)
curl -X POST http://localhost:3001/api/book \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slotId":"SAME_SLOT_UUID"}'

# 6. Get My Bookings
curl -X GET http://localhost:3001/api/my-bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🏭 Production Build

### Backend
```bash
cd api
npm run build
npm start
```

### Frontend  
```bash
cd web
npm run build
npm run preview
```

## 🌐 Deployment

### Backend (Railway/Render/Fly)
1. Create PostgreSQL database (Neon, Railway, etc.)
2. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET` 
   - `FRONTEND_URL`
   - `PORT`
3. Deploy with: `npm run build && npm start`
4. Run: `npm run migrate && npm run seed`

### Frontend (Vercel/Netlify)
1. Build command: `npm run build`  
2. Output directory: `dist`
3. Set environment variable for API URL if needed

### Database Options
- **Neon**: Free PostgreSQL, copy connection string
- **Railway**: One-click PostgreSQL deployment  
- **Supabase**: PostgreSQL with dashboard

## 🔒 Security Features

- JWT authentication with 7-day expiry
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100 req/15min general, 10 req/15min auth)
- CORS protection
- Input validation with Zod
- SQL injection protection via Prisma
- Atomic booking transactions
- Unique constraint enforcement

## 🎯 Technical Decisions & Trade-offs

### Database Design
- **UUID primary keys**: Better for distributed systems
- **UTC timestamps**: Consistent timezone handling  
- **Unique constraint on bookings.slotId**: Prevents double-booking at DB level
- **Cascade deletes**: Maintains referential integrity

### Concurrency Control
- **Database transactions**: Ensures atomic booking operations
- **Unique constraints**: DB-level prevention of race conditions
- **Proper error handling**: Returns 409 SLOT_TAKEN for conflicts

### Authentication
- **JWT tokens**: Stateless authentication  
- **localStorage persistence**: Survives browser refresh (demo purposes)
- **Role-based access**: Patient vs Admin permissions
- **bcrypt hashing**: Industry standard password security

### API Design
- **RESTful endpoints**: Standard HTTP methods and status codes
- **Consistent error format**: `{ error: { code, message } }`
- **Input validation**: Server-side validation with Zod
- **Rate limiting**: Prevents abuse and brute force attacks

## 🚧 Known Limitations

- No email verification (demo purposes)
- Client-side auth storage (use httpOnly cookies in production)  
- No appointment cancellation/rescheduling
- No timezone conversion on frontend
- No real-time updates (would add WebSocket)
- No email notifications
- Fixed 30-minute appointment slots

## ⏰ With 2 More Hours, I'd Add:

1. **Email notifications** (booking confirmations, reminders)
2. **Appointment cancellation** with proper cancellation policies  
3. **Real-time slot updates** using WebSocket/Server-Sent Events
4. **Timezone support** with user timezone preferences
5. **Admin slot management** (create/edit/delete slots)
6. **Booking history export** (CSV/PDF reports)
7. **httpOnly cookie auth** for better security
8. **Input sanitization** and CSP headers
9. **Automated reminder emails** (24h before appointment)
10. **Mobile-responsive improvements** and better loading states

## 📊 Project Structure

```
appointment-booking/
├── api/                    # Backend API
│   ├── src/
│   │   ├── middleware/     # Auth, validation, etc.
│   │   ├── routes/         # API endpoints
│   │   ├── types/          # TypeScript definitions
│   │   └── server.ts       # Express app
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Database seeding
│   └── tests/              # API tests
├── web/                    # Frontend React app  
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Route components  
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript definitions
└── README.md
```