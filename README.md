# SPECTR SYSTEMS

Universal Automation System - Workflow automation platform with intelligence capabilities.

## 🚀 Features

- **Visual Workflow Builder** - Drag-and-drop interface for creating automation workflows
- **Multiple Node Types** - Triggers, Actions, Intelligence, and Output nodes
- **Intelligence Capabilities** - OSINT, GEOINT, and data enrichment
- **Web Scraping** - Advanced web scraping with browser rendering
- **API Integrations** - Connect with various services and APIs
- **User Management** - Authentication, organizations, and role-based access
- **Execution Tracking** - Monitor workflow executions and results

## 📋 Prerequisites

- Node.js 18+ and npm
- AWS Account (for production deployment)
- PostgreSQL (for production) or SQLite (for development)

## 🛠️ Installation

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentation

- **[AWS RDS Setup](./AWS_RDS_SETUP.md)** - Guide to set up PostgreSQL database on AWS RDS
- **[Database Migration](./MIGRATION_GUIDE.md)** - Migrate from SQLite to PostgreSQL
- **[AWS SES Setup](./AWS_SES_SETUP.md)** - Configure email service with AWS SES
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Complete deployment guide for AWS
- **[Backend Setup](./backend/SETUP_ENV.md)** - Backend environment configuration

## 🗄️ Database

The application supports both SQLite (development) and PostgreSQL (production).

### Development (SQLite)
- Default database type
- No additional setup required
- Database file: `backend/data/spectr-systems.db`

### Production (PostgreSQL)
- Set `DB_TYPE=postgresql` in `.env`
- Configure RDS connection details
- Run migration script: `node backend/scripts/migrate-to-postgresql.js`

## 🔧 Environment Variables

### Backend `.env`

```env
# Database (SQLite or PostgreSQL)
DB_TYPE=sqlite  # or postgresql
DB_HOST=localhost  # PostgreSQL only
DB_PORT=5432  # PostgreSQL only
DB_NAME=spectrsystems  # PostgreSQL only
DB_USER=postgres  # PostgreSQL only
DB_PASSWORD=your-password  # PostgreSQL only

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key

# Email (AWS SES)
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@yourdomain.com

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

### Quick Start (AWS)

1. **Set up RDS PostgreSQL** - Follow [AWS_RDS_SETUP.md](./AWS_RDS_SETUP.md)
2. **Migrate Database** - Follow [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
3. **Deploy Backend** - Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
4. **Deploy Frontend** - Deploy to S3 + CloudFront

## 📦 Project Structure

```
├── backend/           # Node.js/Express backend
│   ├── src/
│   │   ├── database/ # Database layer (SQLite & PostgreSQL)
│   │   ├── routes/   # API routes
│   │   ├── services/ # Business logic
│   │   └── types/    # TypeScript types
│   ├── scripts/      # Utility scripts
│   └── data/         # SQLite database (dev only)
├── frontend/         # React/Vite frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── stores/      # State management
│   │   └── services/    # API services
└── docs/             # Documentation
```

## 🧪 Development

### Running Locally

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api

### Database Migration

To migrate from SQLite to PostgreSQL:

```bash
cd backend
# Update .env with PostgreSQL credentials
node scripts/migrate-to-postgresql.js
```

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS configured for frontend
- Environment variables for sensitive data
- SQL injection protection (parameterized queries)

## 📝 License

[Your License Here]

## 🤝 Contributing

[Contributing Guidelines]

## 📞 Support

[Support Information]

---

**Built with:** React, TypeScript, Node.js, Express, PostgreSQL/SQLite, AWS
