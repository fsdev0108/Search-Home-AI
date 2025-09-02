# 🏠 Real Estate AI Agent - Sensay Project

A comprehensive AI-powered real estate platform built with modern technologies and clean architecture.

## 🚀 Project Overview

This project consists of three main components:

1. **Backend** - Node.js API with Fastify and Prisma
2. **Frontend** - Next.js 15 web application
3. **Embed Widget** - Standalone JavaScript widget for external websites

## 📁 Project Structure

```
sensay/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Custom middlewares
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration
│   ├── prisma/              # Database schema and migrations
│   └── README.md            # Backend documentation
├── frontend/                # Next.js web application
│   ├── components/          # React components
│   ├── pages/               # Next.js pages
│   ├── styles/              # CSS and styling
│   ├── sdk/                 # Auto-generated Sensay SDK
│   └── README.md            # Frontend documentation
├── embed-widget/            # Standalone chat widget
│   ├── chat-widget.js       # Main widget code
│   ├── config.js            # Widget configuration
│   ├── build.js             # Build script
│   ├── dist/                # Production files
│   └── README.md            # Widget documentation
└── README.md                # This file
```

## 🎯 Key Features

### Backend
- **Clean Architecture** with separation of concerns
- **Prisma ORM** for database management
- **Fastify** for high-performance API server
- **Sensay API Integration** for AI capabilities
- **Scheduled tasks** for automated operations
- **Multi-tenancy ready** for future SaaS expansion

### Frontend
- **Modern UI/UX** with Tailwind CSS 4
- **Responsive design** for all devices
- **Theme system** with CSS variables
- **Real-time chat** with Sensay AI
- **Property management** interface
- **TypeScript** for type safety

### Embed Widget
- **Lightweight** (~10KB minified)
- **Customizable** colors, position, theme
- **No dependencies** - pure JavaScript
- **Easy integration** in any website
- **Real-time AI chat** powered by Sensay

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run db:generate
npm run db:push
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configure your .env.local file
npm run dev
```

### 3. Embed Widget Setup

```bash
cd embed-widget
npm install
npm run build
# Upload dist/chat-widget.min.js to your CDN
```

## 🔑 Configuration

### Required Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL="file:./dev.db"

# Sensay API
SENSAY_API_KEY=your_sensay_api_key
SENSAY_API_VERSION=2025-03-25

# Server
PORT=3001
NODE_ENV=development
```

#### Frontend (.env.local)
```bash
# Sensay API
NEXT_PUBLIC_SENSAY_API_KEY_SECRET=your_sensay_api_key
NEXT_PUBLIC_SENSAY_USER_ID=your_user_id
NEXT_PUBLIC_SENSAY_REPLICA_UUID=your_replica_uuid
```

## 🌐 API Endpoints

### Backend API (Port 3001)

- `POST /api/users` - Create user
- `POST /api/replicas` - Create replica
- `POST /api/upload` - Upload files to Sensay
- `GET /api/data-sources` - List data sources
- `POST /api/data-sources/sync` - Sync data to Sensay

### Frontend (Port 3000)

- `/` - Home page with chat assistant
- `/property/[id]` - Property detail page
- Chat interface integrated with Sensay AI

## 🔧 Development

### Backend Development

```bash
cd backend
npm run dev          # Development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
```

### Frontend Development

```bash
cd frontend
npm run dev          # Development server
npm run build        # Build for production
npm run start        # Start production server
npm run generate-sdk # Regenerate Sensay SDK
```

### Widget Development

```bash
cd embed-widget
npm run dev          # Build widget
npm run build        # Build for production
```

## 🚀 Deployment

### Backend Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start the server**:
   ```bash
   npm run start
   ```

### Frontend Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to your hosting platform** (Vercel, Netlify, etc.)

### Widget Deployment

1. **Build the widget**:
   ```bash
   npm run build
   ```

2. **Upload `dist/chat-widget.min.js` to your CDN**

3. **Update script URLs in client websites**

## 📊 Database Schema

### Core Models

- **User** - User management
- **Replica** - Sensay replica instances
- **UploadSchedule** - File upload scheduling
- **FileUpload** - File upload tracking
- **DataConnector** - Universal data source connector

### SaaS-Ready Models (Commented)

- **Tenant** - Multi-tenant support
- **Property** - Property management
- **ApiKey** - API key management
- **WebhookEvent** - Webhook event tracking

## 🔒 Security Considerations

- **API keys** stored securely in environment variables
- **CORS** configured for production domains
- **Input validation** on all API endpoints
- **Rate limiting** for API requests
- **Secure file uploads** with validation

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Frontend Testing

```bash
cd frontend
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 📚 Documentation

- **Backend**: [backend/README.md](backend/README.md)
- **Frontend**: [frontend/README.md](frontend/README.md)
- **Embed Widget**: [embed-widget/README.md](embed-widget/README.md)
- **API Documentation**: Available at `/api/docs` when backend is running

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 External Resources

- **Sensay API**: [https://docs.sensay.io](https://docs.sensay.io)
- **Next.js**: [https://nextjs.org](https://nextjs.org)
- **Fastify**: [https://fastify.io](https://fastify.io)
- **Prisma**: [https://prisma.io](https://prisma.io)
- **Tailwind CSS**: [https://tailwindcss.com](https://tailwindcss.com)

## 📞 Support

For questions or issues:

1. **Check the documentation** in each component folder
2. **Review console logs** for error details
3. **Check environment variables** are configured correctly
4. **Verify Sensay API** credentials and permissions

---

**Project Status**: Active Development  
**Last Updated**: September 2024  
**Version**: 1.0.0
