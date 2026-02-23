# Real Estate - Fullstack Application

E-commerce platform for buying/selling houses and land built with **NestJS**, **React**, and **Docker**.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/NguyenLe1104/Real-estate.git
   cd Real-estate
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your actual values:
   - **Database**: MySQL credentials
   - **JWT**: Your secret keys
   - **Cloudinary**: Image upload service
   - **Email**: SMTP configuration (Gmail, etc.)
   - **Google OAuth**: OAuth client credentials
   - **Gemini AI**: API key for AI features

3. **Start all services**
   ```bash
   docker compose up --build
   ```

   This will:
   - Create MySQL database with seed data
   - Start NestJS backend on `http://localhost:5000`
   - Start React frontend on `http://localhost:3000`

4. **Wait for startup**
   - MySQL: ~30-40 seconds to initialize
   - Backend: ~20-30 seconds to migrate & seed
   - Frontend: ~10 seconds to start dev server

Once ready, you'll see:
```
✓ real-estate-db        (healthy)
✓ real-estate-backend   (ready)
✓ real-estate-frontend  (ready)
```

## 📝 Default Login Credentials

After initial setup, the database is seeded with:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Administrator

⚠️ **Change these credentials in production!**

## 🌐 Access Points

### Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Swagger** (if available): http://localhost:5000/api/docs

### Database Connection

**Using MySQL Command Line:**
```bash
mysql -h localhost -P 3307 -u root -p
```
Then enter password and select database:
```sql
USE real_estate_db;
```

**Using MySQL GUI Tool** (MySQL Workbench, DBeaver, etc.):
- **Host**: `localhost`
- **Port**: `3307`
- **Username**: `root`
- **Password**: (from `.env` `MYSQL_ROOT_PASSWORD`)
- **Database**: `real_estate_db`

## 🔄 Development Workflow

With Docker, file changes **automatically reload**:

- **Frontend (React)**: Edit files in `src/`, Vite HMR updates browser instantly
- **Backend (NestJS)**: Edit files in `src/`, NestJS watch mode compiles automatically

**No need to restart containers!** Just save (Ctrl+S) and browser/app updates.

## 📂 Project Structure

```
real-estate/
├── real-estate-api/          # NestJS Backend
│   ├── src/
│   │   ├── modules/          # Feature modules (auth, users, houses, etc.)
│   │   ├── common/           # Shared utilities (mail, cloudinary, etc.)
│   │   └── main.ts           # Bootstrap
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── seed.ts           # Seed data
│   │   └── migrations/       # Database migrations
│   ├── Dockerfile
│   └── package.json
│
├── real-estate-frontend/     # React Frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── api/              # API service layer
│   │   ├── stores/           # Zustand state management
│   │   └── types/            # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml        # Orchestrates all services
├── .env.example              # Environment variable template
├── .env                      # Actual env vars (not in git)
└── README.md
```

## 🗄️ Database Schema

Key entities:
- **User**: System users (admin, employee, customer)
- **Role**: Permission roles (ADMIN, EMPLOYEE, CUSTOMER)
- **House**: House property listings
- **Land**: Land property listings
- **Appointment**: Schedule appointments for properties
- **Post**: News/blog posts
- **Favorite**: Saved properties by users
- **Category**: Property categories

## 🛠️ Common Commands

```bash
# View logs
docker compose logs -f backend          # Backend logs
docker compose logs -f frontend         # Frontend logs
docker compose logs -f db               # Database logs

# Stop containers
docker compose down

# Rebuild images (if Dockerfile changed)
docker compose up --build

# Access backend container shell
docker exec -it real-estate-backend sh

# Reset database
docker compose down -v              # Remove volumes too
docker compose up --build           # Start fresh with seed data
```

## 🔐 Security Notes

⚠️ **Before deployment:**

1. **Change all secrets in `.env`**:
   - `MYSQL_ROOT_PASSWORD`
   - `JWT_SECRET` & `JWT_REFRESH_SECRET`
   - API keys (Cloudinary, Google, Gemini)
   - Email password (use app-specific password for Gmail)

2. **Never commit `.env`** — it's in `.gitignore`

3. **Use strong passwords** for production databases

4. **Disable PhpMyAdmin** or protect with authentication

5. **Update CORS origins** in `docker-compose.yml` for production domains:
   ```yaml
   # In backend environment
   FRONTEND_URL: https://yourdomain.com
   ```

## 🐛 Troubleshooting

### Docker containers exit immediately
```bash
# Check logs
docker compose logs backend
docker compose logs db

# Common causes:
# - .env file missing → Create from .env.example
# - Port already in use → Change DB_PORT, BE_PORT, FE_PORT in .env
# - Database connection failed → Wait for MySQL to be healthy
```

### Can't connect to database
```bash
# Test MySQL connection
docker exec real-estate-db mysql -u root -p -e "SELECT 1;"

# Verify environment variables
docker compose config | grep MYSQL
```

### Frontend can't connect to backend
- Check backend is running: `docker ps`
- Verify API endpoint in `.env`: `VITE_API_BASE_URL=http://localhost:5000/api`
- Check browser console for errors

### PhpMyAdmin won't load
- Port 8081 might be in use
- Change in docker-compose.yml: `"YOUR_PORT:80"`

## 📚 Tech Stack

### Backend
- **NestJS** — TypeScript/Node.js framework
- **Prisma** — Database ORM
- **JWT** — Authentication
- **Cloudinary** — Image storage
- **Nodemailer** — Email sending
- **Google Auth** — OAuth login

### Frontend
- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **React Router** — Navigation
- **Axios** — HTTP client
- **Zustand** — State management
- **Ant Design** — UI components
- **TanStack React Query** — Data fetching

### Infrastructure
- **Docker** — Containerization
- **Docker Compose** — Multi-container orchestration
- **MySQL 8** — Database
- **PhpMyAdmin** — Database GUI

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review GitHub Issues: https://github.com/NguyenLe1104/Real-estate/issues
3. Check logs: `docker compose logs -f`

## 📄 License

This project is private. All rights reserved.
