# 🔧 Services Documentation

## Backend Services

### Sensay API Service
**File**: `backend/src/services/sensayApiService.ts`

Handles all interactions with the Sensay platform:
- User management
- Replica creation and management
- Knowledge base operations
- Chat message processing

**Key Methods**:
- `createUser()`: Creates new users in Sensay
- `createReplica()`: Creates AI agents
- `uploadKnowledgeBase()`: Uploads property data
- `sendMessage()`: Processes chat messages

### Twilio Service
**File**: `backend/src/services/twilioService.ts`

Manages WhatsApp integration via Twilio:
- Webhook handling
- Message processing
- TwiML response generation
- Integration management

**Key Methods**:
- `processMessageForTwiML()`: Processes WhatsApp messages
- `sendMessage()`: Sends messages via Twilio
- `createTwilioIntegration()`: Sets up WhatsApp integration

### Telegram Service
**File**: `backend/src/services/telegramService.ts`

Handles Telegram bot integration:
- Bot command processing
- Message routing
- User session management

### HubSpot Service
**File**: `backend/src/services/hubspotService.ts`

Manages CRM data synchronization:
- Property data extraction
- CSV generation
- Data transformation
- Sync scheduling

### User Service
**File**: `backend/src/services/userService.ts`

User management and authentication:
- User registration
- Password hashing
- JWT token generation
- Role management

## Admin Panel Services

### API Service
**File**: `admin/src/services/api.js`

Centralized API communication:
- HTTP request handling
- Authentication headers
- Error handling
- Response processing

**Modules**:
- `authAPI`: Authentication operations
- `replicaAPI`: Replica management
- `integrationAPI`: Integration settings
- `knowledgeBaseAPI`: File uploads

### Widget Service
**File**: `embed-widget/chat-widget.js`

Client-side widget functionality:
- Chat interface management
- API communication
- Theme customization
- Event handling

## Integration Services

### WhatsApp Integration
- **Provider**: Twilio
- **Features**: Text messages, media support
- **Setup**: Sandbox for testing, production for live
- **Webhook**: Global endpoint for all users

### Telegram Integration
- **Provider**: Telegram Bot API
- **Features**: Commands, inline keyboards
- **Setup**: Bot token configuration
- **Webhook**: Dedicated endpoint per integration

### HubSpot Integration
- **Provider**: HubSpot API
- **Features**: Property data sync, contact management
- **Setup**: API key configuration
- **Sync**: Scheduled and manual synchronization

## Database Services

### Prisma Client
**File**: `backend/src/lib/prisma.ts`

Database operations:
- User management
- Integration settings
- Sync logs
- File uploads

**Models**:
- `User`: User accounts and authentication
- `IntegrationSettings`: Platform configurations
- `TwilioIntegration`: WhatsApp settings
- `SyncLog`: Operation tracking

## External APIs

### Sensay API
- **Base URL**: `https://api.sensay.io/v1`
- **Authentication**: Organization Secret
- **Endpoints**: Users, Replicas, Knowledge Base, Chat

### Twilio API
- **Base URL**: `https://api.twilio.com/2010-04-01`
- **Authentication**: Account SID + Auth Token
- **Endpoints**: Messages, Webhooks, TwiML

### Telegram Bot API
- **Base URL**: `https://api.telegram.org/bot{token}`
- **Authentication**: Bot Token
- **Endpoints**: Send Message, Set Webhook, Get Updates

### HubSpot API
- **Base URL**: `https://api.hubapi.com`
- **Authentication**: API Key
- **Endpoints**: Properties, Contacts, Deals

## Service Dependencies

```
┌─────────────────┐
│   Admin Panel   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│   Backend API   │◄──►│  External APIs  │
└─────────┬───────┘    └─────────────────┘
          │
          ▼
┌─────────────────┐
│   Database      │
└─────────────────┘
```

## Error Handling

### Backend Services
- Try-catch blocks for all external API calls
- Structured error responses
- Logging for debugging
- Graceful degradation

### Admin Panel Services
- HTTP status code handling
- User-friendly error messages
- Retry mechanisms
- Loading states

## Configuration

### Environment Variables
- `SENSAY_ORGANIZATION_SECRET`: Sensay API key
- `TWILIO_ACCOUNT_SID`: Twilio account identifier
- `TWILIO_AUTH_TOKEN`: Twilio authentication token
- `TELEGRAM_BOT_TOKEN`: Telegram bot token
- `HUBSPOT_API_KEY`: HubSpot API key
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: JWT signing secret

### Service Configuration
- API timeouts and retries
- Rate limiting settings
- Webhook URL configurations
- Database connection pooling
