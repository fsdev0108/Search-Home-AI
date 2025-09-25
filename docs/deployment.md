# 🚀 Deployment Guide

## Production Deployment

### Railway Deployment

The application is deployed on Railway with the following configuration:

#### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Sensay API
SENSAY_ORGANIZATION_SECRET="your_sensay_secret"
SENSAY_BASE_URL="https://api.sensay.io/v1"
SENSAY_API_VERSION="2025-03-25"

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="auth_token_here"
TWILIO_PHONE_NUMBER="+14155238886"

# Telegram
TELEGRAM_BOT_TOKEN="bot_token_here"

# HubSpot
HUBSPOT_API_KEY="hubspot_api_key_here"

# JWT
JWT_SECRET="your_jwt_secret"

# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
```

#### Build Configuration
**Procfile**:
```
web: npm install --production=false && npm run build && npx prisma db push && node dist/index.js
```

**Package.json Scripts**:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "railway:deploy": "npm run build && npx prisma generate"
  }
}
```

### Database Setup

#### Development (SQLite)
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Open database studio
npx prisma studio
```

#### Production (PostgreSQL)
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run migrations (if needed)
npx prisma migrate deploy
```

## Frontend Deployment

### Admin Panel (Vite)
```bash
# Build for production
npm run build

# Preview build
npm run preview

# Deploy to static hosting
# Copy dist/ folder to hosting provider
```

### Admin Panel (React + Vite)
```bash
# Build for production
npm run build

# Preview build
npm run preview

# Deploy to static hosting
# Copy dist/ folder to hosting provider
```

### Embed Widget
```bash
# Build with API key injection
npm run build:prod

# Deploy chat-widget.min.js to CDN
# Update client websites with new URL
```

## Environment Setup

### Development
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev

# Admin Panel
cd admin
npm install
npm run dev

# Embed Widget
cd embed-widget
npm install
cp .env.example .env
# Edit .env with Sensay API key
npm run dev
# Widget runs on http://localhost:3001
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database connection established
- [ ] Prisma schema synchronized
- [ ] External API credentials valid
- [ ] Webhook URLs configured
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] CDN setup (for widget)

## Monitoring

### Health Checks
```bash
# API health
GET /health

# Database connection
GET /health/db

# External services
GET /health/external
```

### Logging
- **Development**: Console logging
- **Production**: Structured JSON logs
- **Error Tracking**: Error details with request IDs

### Metrics
- API response times
- Database query performance
- External API call success rates
- Webhook processing times

## Security

### Production Security
- HTTPS enforcement
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

### API Security
- JWT token validation
- Request size limits
- File upload restrictions
- Webhook signature verification


## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check database URL
echo $DATABASE_URL

# Test connection
npx prisma db push --preview-feature
```

#### Build Failures
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run build
```

#### Webhook Issues
```bash
# Test webhook endpoint
curl -X POST https://your-domain.com/api/v1/twilio/webhook/global \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Body=test&From=whatsapp:+1234567890"
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start

# Prisma debug
DEBUG=prisma:* npm start
```

## Backup & Recovery

### Database Backup
```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Configuration Backup
- Environment variables
- Webhook configurations
- Integration settings
- User data


