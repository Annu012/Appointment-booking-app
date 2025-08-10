# Deployment Guide

This guide provides step-by-step instructions for deploying the Appointment Booking application to production.

## 📋 Prerequisites

- GitHub account (for code repository)
- Database provider account (Neon, Railway, or Supabase)
- Hosting platform accounts (Render/Railway for backend, Vercel/Netlify for frontend)

## 🗄️ Database Deployment (Neon - Recommended)

### 1. Create Neon Database
1. Visit [Neon.tech](https://neon.tech) and sign up
2. Create a new project called `appointment-booking`
3. Copy the connection string (looks like: `postgresql://user:pass@host/dbname`)
4. Keep this safe - you'll need it for backend deployment

### Alternative: Railway Database
1. Visit [Railway.app](https://railway.app) and sign up
2. Create new project → Add PostgreSQL
3. Go to PostgreSQL service → Variables tab
4. Copy the `DATABASE_URL` value

## 🖥️ Backend Deployment (Render - Recommended)

### 1. Prepare Repository
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "feat: ready for deployment"
git push origin main
```

### 2. Deploy on Render
1. Visit [Render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"  
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `appointment-booking-api`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `api`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 3. Set Environment Variables
In Render dashboard, go to Environment tab and add:

```
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=your-super-secure-random-string-min-32-chars
FRONTEND_URL=https://your-frontend-url.vercel.app
PORT=3001
```

**Important**: Generate a strong JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Database Setup
After deployment, run database commands:
```bash
# SSH into your Render service or use Render's shell
npm run migrate
npm run seed
```

### 5. Copy Backend URL
Copy your backend URL (e.g., `https://appointment-booking-api.onrender.com`)

## 🌐 Frontend Deployment (Vercel - Recommended)

### 1. Deploy on Vercel
1. Visit [Vercel.com](https://vercel.com) and sign up
2. Import your GitHub repository
3. Configure project:
   - **Project Name**: `appointment-booking-web`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2. Set Environment Variables  
In Vercel dashboard, go to Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-url.onrender.com
```

### 3. Update Backend CORS
Update your backend's `FRONTEND_URL` environment variable with your Vercel URL:
```
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## 🚀 Alternative Deployment Options

### Backend: Railway
1. Visit [Railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Select your repo and `api` folder
4. Set environment variables (same as Render)
5. Railway auto-detects Node.js and deploys

### Backend: Fly.io
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Create `api/fly.toml`:
```toml
app = "appointment-booking-api"
kill_signal = "SIGINT"
kill_timeout = 5

[env]
  PORT = "8080"

[[services]]
  http_checks = []
  internal_port = 8080
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
```

3. Deploy:
```bash
cd api
fly launch
fly secrets set DATABASE_URL="your-db-url"
fly secrets set JWT_SECRET="your-jwt-secret"
fly deploy
```

### Frontend: Netlify
1. Visit [Netlify.com](https://netlify.com) and sign up
2. Drag and drop your `web/dist` folder, or connect GitHub
3. Build settings:
   - **Base directory**: `web`
   - **Build command**: `npm run build`
   - **Publish directory**: `web/dist`
4. Set environment variables in Site settings

## ✅ Verification Checklist

After deployment, verify everything works:

### 1. Test Backend API
```bash
# Health check
curl https://your-backend-url.onrender.com/health

# Register test user
curl -X POST https://your-backend-url.onrender.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123!"}'

# Login
curl -X POST https://your-backend-url.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

### 2. Test Frontend
1. Visit your frontend URL
2. Try logging in with demo accounts:
   - Patient: `patient@example.com` / `Passw0rd!`  
   - Admin: `admin@example.com` / `Passw0rd!`
3. Book an appointment as patient
4. View all bookings as admin

### 3. Live Deployment Checklist Template

```
## Live Deployment Links

- **Frontend URL**: https://your-frontend-url.vercel.app
- **API URL**: https://your-backend-url.onrender.com  
- **Repository**: https://github.com/yourusername/appointment-booking

## Demo Credentials
- **Patient**: patient@example.com / Passw0rd!
- **Admin**: admin@example.com / Passw0rd!

## Verification Commands

# Health Check
curl https://your-backend-url.onrender.com/health

# Test Registration
curl -X POST https://your-backend-url.onrender.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123!"}'

# Test Login
curl -X POST https://your-backend-url.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@example.com","password":"Passw0rd!"}'
```

## 🔧 Common Issues & Solutions

### Database Connection Issues
- Verify DATABASE_URL format: `postgresql://user:pass@host:port/database`
- Ensure database allows external connections
- Check firewall/security group settings

### CORS Errors
- Verify FRONTEND_URL matches your deployed frontend URL exactly
- Include protocol (https://) in FRONTEND_URL
- No trailing slash in FRONTEND_URL

### Build Failures
- Check Node.js version compatibility (use Node 18+)
- Ensure all dependencies are in package.json
- Verify build commands are correct for your platform

### Environment Variables Not Loading
- Double-check variable names (case-sensitive)
- Restart services after adding new variables
- Use platform-specific variable prefixes (VITE_ for Vite)

## 🔐 Production Security Checklist

- [ ] Strong JWT_SECRET (32+ characters)
- [ ] DATABASE_URL uses SSL connection
- [ ] CORS configured with specific origin (not *)
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints  
- [ ] No sensitive data in logs
- [ ] HTTPS enforced on both frontend and backend
- [ ] Dependencies regularly updated

## 📊 Monitoring & Maintenance

### Log Monitoring
- **Render**: View logs in dashboard → Logs tab
- **Vercel**: View function logs in dashboard
- **Railway**: Built-in logging and metrics

### Database Monitoring
- **Neon**: Dashboard shows connection count, query performance
- Monitor for connection leaks and slow queries

### Performance Monitoring
- Set up uptime monitoring (UptimeRobot, StatusCake)
- Monitor API response times
- Track error rates and user feedback

## 🚀 Scaling Considerations

### Database
- **Connection pooling**: Configure Prisma connection pool
- **Read replicas**: For high-read workloads
- **Database indexes**: Add indexes for frequently queried columns

### Backend
- **Horizontal scaling**: Multiple service instances
- **Caching**: Redis for session/data caching
- **Load balancing**: Distribute traffic across instances

### Frontend  
- **CDN**: Vercel/Netlify provide global CDN by default
- **Code splitting**: Implement lazy loading for routes
- **Asset optimization**: Optimize images and bundle size

This deployment guide ensures your appointment booking system is production-ready with proper security, monitoring, and scalability considerations.