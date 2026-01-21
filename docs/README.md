# HRMS - Human Resource Management System

A comprehensive HRMS solution built with NestJS (backend) and Next.js (frontend), featuring Saudi compliance, biometric integration, and advanced HR modules.

## 🚀 Features

- **Employee Management** - Complete employee lifecycle management
- **Attendance Tracking** - Biometric integration and automated attendance
- **Leave Management** - Multi-tier approval workflows
- **Payroll Processing** - Saudi compliance with GOSI integration
- **Recruitment** - Applicant tracking and onboarding
- **Saudi Compliance** - Full adherence to Saudi labor laws
- **ERP Integration** - Seamless integration with ERP systems
- **Workflow Engine** - Configurable approval workflows
- **Advanced Modules** - Tickets, advances, salary history, and more

## 📁 Project Structure

```
HRMS/
├── hrms-backend/          # NestJS backend API
├── hrms-frontend/         # Next.js frontend application
├── docs/                  # Comprehensive documentation
├── start-all.bat          # Quick start script (Windows)
└── start-all.sh           # Quick start script (Linux/Mac)
```

## 🛠️ Tech Stack

**Backend:**
- NestJS
- Prisma ORM
- SQLite (can be switched to PostgreSQL/MySQL)
- JWT Authentication
- TypeScript

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI Components

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd HRMS
```

### 2. Install dependencies

**Backend:**
```bash
cd hrms-backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
```

**Frontend:**
```bash
cd hrms-frontend
npm install
```

### 3. Start the application

**Option 1: Start everything at once (Windows)**
```bash
start-all.bat
```

**Option 2: Start separately**

Backend:
```bash
cd hrms-backend
npm run start:dev
```

Frontend:
```bash
cd hrms-frontend
npm run dev
```

### 4. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Documentation: http://localhost:4000/api

### Default Credentials

```
Username: admin
Password: admin123
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Quick Start Guide](docs/QUICK_START.md)
- [Project Overview](docs/01-project-overview.md)
- [API Reference](docs/API_REFERENCE.md)
- [Saudi Compliance](docs/06-saudi-compliance.md)
- [Workflow Configuration](docs/WORKFLOW_CONFIGURATION_GUIDE.md)
- [Biometric Integration](docs/BIOMETRIC_CONFIGURATION_GUIDE.md)
- [ERP Integration](docs/ERP_INTEGRATION_GUIDE.md)

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing
- SQL injection protection via Prisma
- CORS configuration
- Environment variable protection

## 🌍 Saudi Compliance Features

- GOSI integration
- Iqama tracking and expiry alerts
- Saudi labor law compliance
- Hijri calendar support
- Arabic language support
- End of Service calculations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software.

## 📞 Support

For support and queries, please refer to the documentation or create an issue in the repository.

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Cloud deployment guides
- [ ] Performance monitoring
- [ ] Automated testing suite

---

**Built with ❤️ for modern HR management**
