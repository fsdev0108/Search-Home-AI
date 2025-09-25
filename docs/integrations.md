# 🔗 Integrations Guide

## WhatsApp Integration

### Overview
WhatsApp integration is powered by Twilio's WhatsApp Business API, providing automated customer service through the popular messaging platform.

### Setup Process

#### 1. Twilio Account Setup
- Create Twilio account
- Get Account SID and Auth Token
- Enable WhatsApp Sandbox for testing

#### 2. Sandbox Configuration
- **Sandbox Number**: `+1 415 523 8886`
- **Join Code**: Send "join <code>" to sandbox number
- **Webhook URL**: `https://your-domain.com/api/v1/twilio/webhook/global`

#### 3. Production Setup
- Apply for WhatsApp Business API
- Get approved phone number
- Configure webhook URL
- Set up message templates

### Technical Implementation

#### Webhook Handler
```typescript
// Handles incoming WhatsApp messages
POST /api/v1/twilio/webhook/global
Content-Type: application/x-www-form-urlencoded

// Twilio sends form data:
// SmsMessageSid, Body, From, To, etc.
```

#### TwiML Response
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>AI response here</Message>
</Response>
```

#### Message Processing Flow
1. Twilio receives WhatsApp message
2. Sends webhook to backend
3. Backend processes with Sensay AI
4. Returns TwiML response
5. Twilio sends response to user

### Features
- **Text Messages**: Full conversation support
- **Media Support**: Images, documents, voice notes
- **Rich Media**: Buttons, lists, carousels
- **Templates**: Pre-approved message templates
- **Status Updates**: Delivery and read receipts

### Limitations
- **Sandbox**: Limited to 24-hour conversation window
- **Templates**: Required for outbound messages
- **Approval**: Business verification required for production
- **Rate Limits**: Message sending restrictions

## Telegram Integration

### Overview
Telegram bot integration provides automated customer service through Telegram's bot API.

### Setup Process

#### 1. Bot Creation
- Contact @BotFather on Telegram
- Create new bot with `/newbot`
- Get bot token
- Configure bot settings

#### 2. Webhook Configuration
- Set webhook URL: `https://your-domain.com/api/v1/telegram/webhook/{integrationId}`
- Configure allowed updates
- Test webhook connection

### Technical Implementation

#### Bot Commands
```javascript
// Available commands
/start - Initialize conversation
/help - Show available commands
/properties - Search properties
/contact - Contact information
```

#### Message Handling
```typescript
// Webhook endpoint
POST /api/v1/telegram/webhook/:integrationId
Content-Type: application/json

{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": { "id": 123456789 },
    "chat": { "id": 123456789 },
    "text": "Hello"
  }
}
```

#### Response Format
```typescript
// Send message response
{
  "chat_id": 123456789,
  "text": "AI response here",
  "parse_mode": "Markdown"
}
```

### Features
- **Commands**: Custom bot commands
- **Inline Keyboards**: Interactive buttons
- **File Sharing**: Documents, images, videos
- **Group Support**: Multi-user conversations
- **Rich Formatting**: Markdown, HTML support

## HubSpot Integration

### Overview
HubSpot CRM integration synchronizes property data and contact information for AI training.

### Setup Process

#### 1. HubSpot Account
- Create HubSpot account
- Generate API key
- Configure property fields
- Set up contact properties

#### 2. API Configuration
- Get HubSpot API key
- Configure webhook endpoints
- Set up data synchronization
- Map property fields

### Technical Implementation

#### Data Synchronization
```typescript
// Sync properties from HubSpot
POST /api/v1/integrations/:id/hubspot/sync
Authorization: Bearer <token>

// Response
{
  "success": true,
  "data": {
    "propertiesCount": 150,
    "contactsCount": 75,
    "syncTime": "2025-01-15T10:00:00Z"
  }
}
```

#### Property Data Format
```csv
title,price,location,bedrooms,bathrooms,area,type,status
Apartamento Jardim Botânico,750000,Rua das Flores 123,3,2,120,sale,available
Casa Residencial,450000,Av. Principal 456,4,3,180,sale,available
```

#### Contact Data Format
```csv
email,name,phone,preferred_location,budget,property_type
client@example.com,John Doe,+1234567890,Downtown,500000,apartment
```

### Features
- **Property Sync**: Automatic property data updates
- **Contact Management**: Customer information sync
- **Custom Fields**: Flexible property attributes
- **Real-time Updates**: Webhook-based synchronization
- **Data Transformation**: CSV format conversion

### Data Mapping
- **Properties**: Title, price, location, features
- **Contacts**: Name, email, phone, preferences
- **Deals**: Transaction history, status
- **Activities**: Interactions, notes

## Sensay AI Integration

### Overview
Sensay AI provides the core intelligence for all communication channels, processing user messages and generating contextual responses.

### Setup Process

#### 1. Organization Setup
- Create Sensay organization
- Get organization secret
- Configure API access
- Set up user accounts

#### 2. Replica Creation
- Create AI replicas
- Configure personality
- Upload knowledge base
- Test conversations

### Technical Implementation

#### API Authentication
```typescript
// Headers for Sensay API
{
  "X-ORGANIZATION-SECRET": "your_organization_secret",
  "X-USER-ID": "user_id",
  "Content-Type": "application/json"
}
```

#### Message Processing
```typescript
// Send message to Sensay
POST https://api.sensay.io/v1/replicas/{replicaId}/chat
{
  "message": "User message here",
  "context": {
    "channel": "whatsapp",
    "userId": "user_id"
  }
}
```

#### Knowledge Base Upload
```typescript
// Upload property data
POST https://api.sensay.io/v1/replicas/{replicaId}/knowledge-base
Content-Type: multipart/form-data

// Form data with CSV file
```

### Features
- **Natural Language Processing**: Understanding user intent
- **Context Awareness**: Conversation memory
- **Knowledge Base**: Property data integration
- **Multi-language**: Support for multiple languages
- **Customization**: Personality and response style

## Widget Integration

### Overview
Embeddable chat widget for real estate websites, providing instant AI-powered customer service.

### Setup Process

#### 1. Widget Generation
- Configure widget settings
- Generate embed code
- Customize appearance
- Set up API credentials

#### 2. Website Integration
- Add embed code to website
- Configure positioning
- Test functionality
- Monitor usage

### Technical Implementation

#### Embed Code
```html
<script src="https://your-domain.com/chat-widget.min.js"></script>
<script>
  RealEstateChat.init({
    userId: 'user-uuid',
    replicaUuid: 'replica-uuid',
    position: 'bottom-right',
    theme: 'auto',
    primaryColor: '#3cacae'
  });
</script>
```

#### API Communication
```javascript
// Widget API calls
const response = await fetch('/api/v1/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: userMessage,
    replicaId: replicaUuid
  })
});
```

### Features
- **Responsive Design**: Mobile and desktop optimized
- **Customizable**: Colors, position, theme
- **Real-time**: Instant message processing
- **Secure**: API key protection
- **Analytics**: Usage tracking and insights

## Integration Testing

### WhatsApp Testing
```bash
# Test webhook endpoint
curl -X POST https://your-domain.com/api/v1/twilio/webhook/global \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Body=Hello&From=whatsapp:+1234567890&To=whatsapp:+14155238886"
```

### Telegram Testing
```bash
# Test bot commands
/start
/help
/properties
```

### HubSpot Testing
```bash
# Test API connection
curl -X GET "https://api.hubapi.com/crm/v3/objects/properties" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Widget Testing
```html
<!-- Test widget on local page -->
<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
</head>
<body>
  <script src="http://localhost:3001/chat-widget.js"></script>
  <script>
    RealEstateChat.init({
      userId: 'test-user',
      replicaUuid: 'test-replica'
    });
  </script>
</body>
</html>
```

## Troubleshooting

### Common Issues

#### WhatsApp
- **Webhook not receiving**: Check URL configuration
- **TwiML errors**: Validate XML format
- **Message delays**: Check Twilio logs
- **Sandbox limits**: Verify conversation window

#### Telegram
- **Bot not responding**: Check webhook URL
- **Command errors**: Verify bot token
- **Message format**: Check Markdown syntax
- **Rate limits**: Monitor API usage

#### HubSpot
- **Sync failures**: Verify API key
- **Data mapping**: Check field names
- **Rate limits**: Implement retry logic
- **Webhook issues**: Validate endpoint

#### Widget
- **Not loading**: Check script URL
- **API errors**: Verify credentials
- **Styling issues**: Check CSS conflicts
- **Mobile problems**: Test responsiveness

### Debug Tools
- **Webhook logs**: Monitor incoming requests
- **API logs**: Track external calls
- **Error tracking**: Capture and analyze errors
- **Performance monitoring**: Measure response times
