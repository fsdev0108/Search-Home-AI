# Railway Deployment Guide

This guide will help you deploy the Sensay Real Estate AI Agent backend to Railway.

## Prerequisites

1. Railway account (https://railway.app)
2. GitHub repository with your code
3. Sensay API credentials

## Deployment Steps

### 1. Create a New Project on Railway

1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository and the `backend` folder

### 2. Add Environment Variables

In your Railway project dashboard, go to the Variables tab and add:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database (Railway will provide this automatically when you add PostgreSQL)
DATABASE_URL=postgresql://...

# CORS (Update with your frontend domains)
CORS_ORIGIN=https://your-frontend-domain.com,https://your-admin-domain.com

# Sensay API Configuration
SENSAY_BASE_URL=https://api.sensay.io/v1
SENSAY_ORGANIZATION_SECRET=your_organization_secret_here
SENSAY_API_VERSION=2025-03-25

# Upload Configuration
UPLOAD_DIR=./uploads
```

### 3. Add PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically set the `DATABASE_URL` environment variable

### 4. Configure Build Settings

Railway will automatically detect the Node.js project and use the configurations in:
- `railway.json` - Railway-specific settings
- `nixpacks.toml` - Build configuration
- `package.json` - Build and start scripts

### 5. Deploy

1. Push your code to GitHub
2. Railway will automatically build and deploy
3. The deployment will:
   - Install dependencies (`npm ci`)
   - Build the TypeScript code (`npm run build`)
   - Generate Prisma client (`prisma generate`)
   - Run database migrations (`npm run db:migrate`)
   - Start the server (`npm start`)

### 6. Access Your API

Once deployed, Railway will provide a public URL like:
`https://your-service-name.railway.app`

Test the deployment by visiting the root endpoint:
`https://your-service-name.railway.app/`

## Important Notes

### Database Migration

The first deployment will automatically run the database migration to create all necessary tables. The migration file is located at:
`prisma/migrations/20241219000000_init/migration.sql`

### File Uploads

The application is configured to handle file uploads in the `./uploads` directory. Railway provides ephemeral storage, so uploaded files will be lost on redeploys. For production, consider using:
- Railway's persistent volumes
- External storage services (AWS S3, Cloudinary, etc.)

### Monitoring

Railway provides built-in monitoring and logs. You can view:
- Application logs in the Railway dashboard
- Metrics and performance data
- Database connection status

### Custom Domain

To use a custom domain:
1. Go to your service settings in Railway
2. Add your custom domain
3. Update the `CORS_ORIGIN` environment variable to include your domain

## Troubleshooting

### Build Failures

If the build fails, check:
1. All required environment variables are set
2. The `DATABASE_URL` is properly configured
3. Dependencies are correctly specified in `package.json`

### Runtime Errors

Common issues:
1. Database connection errors - verify `DATABASE_URL`
2. CORS errors - check `CORS_ORIGIN` configuration
3. Missing environment variables - verify all required vars are set

### Database Issues

If you need to reset the database:
1. Delete the PostgreSQL service in Railway
2. Create a new PostgreSQL service
3. The migration will run automatically on next deployment

## Production Checklist

- [ ] Environment variables configured
- [ ] PostgreSQL database added
- [ ] CORS origins set to actual domains
- [ ] Sensay API credentials configured
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Error tracking configured (optional)
