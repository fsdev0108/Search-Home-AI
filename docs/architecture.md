# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │   Backend API   │    │  Sensay API     │
│   (React/Vite)  │◄──►│   (Fastify)     │◄──►│  (External)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Widget Test   │    │   Database      │    │ Organizations   │
│   - Chat UI     │    │   (PostgreSQL)  │    │ - Users         │
│   - Settings    │    │   - Integrations│    │ - Replicas      │
│   - Dashboard   │    │   - Sync Logs   │    │ - Knowledge     │
└─────────────────┘    └─────────────────┘    │   Base          │
                                              └─────────────────┘
```

## Component Overview

### Backend (Fastify + TypeScript)
- **API Gateway**: Centralized API for all integrations
- **Database**: SQLite for local configuration storage
- **Services**: Modular services for each integration
- **Authentication**: JWT-based auth system

### Admin Panel (React + Vite)
- **Dashboard**: Real-time monitoring and management
- **Settings**: Configuration for all integrations
- **User Management**: Multi-user support with role-based access

### Widget (Vanilla JS)
- **Embeddable Chat**: Lightweight chat interface
- **Admin Integration**: Widget testing in admin panel
- **Customizable**: Theme and positioning options


## Data Flow

### 1. Property Data Integration
```
HubSpot CRM → Backend API → CSV Generation → Sensay Knowledge Base
```

### 2. User Interaction
```
User Message → WhatsApp/Telegram/Widget → Backend → Sensay AI → Response
```

### 3. Admin Management
```
Admin Panel → Backend API → Database → Sensay API → Configuration Update
```

## Technology Stack

### Backend
- **Fastify**: High-performance web framework
- **TypeScript**: Type-safe development
- **Prisma**: Modern ORM with SQLite
- **JWT**: Secure authentication

### Widget
- **Vanilla JavaScript**: Lightweight and fast
- **CSS**: Custom styling and themes
- **Build Tools**: Custom build process

### Integrations
- **Sensay API**: AI agent management
- **Twilio**: WhatsApp messaging
- **Telegram Bot API**: Telegram integration
- **HubSpot API**: CRM data synchronization

## Security

### Authentication
- JWT tokens for API access
- Role-based permissions
- Secure password hashing (bcrypt)

### Data Protection
- Environment variable configuration
- API key injection during build
- No sensitive data in client code

### API Security
- Request validation
- Error handling middleware
- Rate limiting (planned)

## Scalability

### Horizontal Scaling
- Stateless backend design
- Database-agnostic architecture
- Microservice-ready structure

### Performance
- Fastify's high throughput
- Efficient database queries
- Optimized frontend builds

## Deployment

### Development
- Local SQLite database
- Hot reload for backend and admin
- Widget testing in admin panel
- Environment-based configuration

### Production
- Railway deployment
- PostgreSQL database
- Admin panel with widget integration
- Automated CI/CD pipeline
