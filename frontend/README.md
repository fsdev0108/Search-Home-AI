# Real Estate AI Agent - Frontend

A modern and responsive interface for the AI real estate assistant.

## 🚀 Features

- **Attractive Landing Page**: Modern design with gradients and animations
- **Assistant Button**: Direct access to AI chat
- **Smart Chat Box**: Conversation interface with the assistant
- **Theme System**: Configurable colors via CSS variables
- **Responsive**: Works perfectly on desktop and mobile
- **Sensay API Integration**: Real AI chat powered by Sensay (using our own widget approach)

## 🎨 Theme System

The frontend uses a CSS variable-based theme system for easy customization:

### Primary Colors
- `--primary`: Primary color (teal #3cacae)
- `--accent`: Accent color (yellow/orange)
- `--success`: Success color (green)
- `--warning`: Warning color (yellow)
- `--error`: Error color (red)

### Interface Colors
- `--background`: Main background
- `--foreground`: Main text
- `--card`: Card backgrounds
- `--border`: Borders
- `--muted`: Secondary elements

### How to Change Colors

1. Edit `styles/globals.css`
2. Modify CSS variables in `:root`
3. Changes apply automatically

## 🛠️ Technologies

- **Next.js 15**: React framework
- **Tailwind CSS 4**: CSS framework
- **Geist Fonts**: Modern typography
- **CSS Variables**: Flexible theme system
- **Direct API Integration**: Custom implementation for Sensay API

## 🔑 API Configuration

### Prerequisites

**IMPORTANT**: You must have already created a user and replica in your Sensay dashboard before using this frontend.

### 1. Get Required Information

1. **API Key**: Go to [Sensay Dashboard](https://app.sensay.io/settings/api-keys)
2. **User ID**: Your existing user ID from Sensay
3. **Replica UUID**: Your existing replica UUID from Sensay

### 2. Configure Environment

Create `.env.local` file:

```bash
# Sensay API Configuration
NEXT_PUBLIC_SENSAY_API_KEY_SECRET=your_actual_api_key_here

# Existing User and Replica IDs (already created)
NEXT_PUBLIC_SENSAY_USER_ID=your_existing_user_id_here
NEXT_PUBLIC_SENSAY_REPLICA_UUID=your_existing_replica_uuid_here
```

### 3. Or Use Chat Interface

The chat will prompt you to enter the API key if not configured.

## 📱 How to Use

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment** (see above)

3. **Run in development**:
   ```bash
   npm run dev
   ```

4. **Access**: http://localhost:3000

5. **Click "Talk to Assistant"** and enter your API key

## 🎯 Project Structure

```
frontend/
├── components/
│   └── ChatBox.js          # Chat component with direct Sensay API integration
├── pages/
│   ├── _app.js             # Main app
│   ├── index.js            # Home page
│   └── property/[id].js    # Property detail page
├── styles/
│   └── globals.css         # Global styles and theme
├── tailwind.config.js      # Tailwind configuration
├── theme-examples.css      # Theme examples
└── README.md
```

## 🔧 Customization

### Change Theme Colors
Edit CSS variables in `styles/globals.css`:

```css
:root {
  --primary: #3cacae;        /* Teal */
  --accent: #f59e0b;        /* Yellow */
  --success: #10b981;        /* Green */
  /* ... other colors */
}
```

### Modify API Configuration
Edit the ChatBox component or environment variables:

```javascript
// In ChatBox.js
const userId = process.env.NEXT_PUBLIC_SENSAY_USER_ID || 'your-user-id';
const replicaUuid = process.env.NEXT_PUBLIC_SENSAY_REPLICA_UUID || 'your-replica-uuid';
```

## 🚀 Deploy

To deploy:

```bash
npm run build
npm run start
```

## 📱 Responsiveness

- **Mobile First**: Design optimized for mobile devices
- **Breakpoints**: Automatic adaptation for different screen sizes
- **Touch Friendly**: Interface optimized for touch

## 🎨 Animations

- **Hover Effects**: Smooth transitions on buttons
- **Floating Elements**: Animated floating elements
- **Smooth Transitions**: CSS transitions for all state changes

## 🔗 Backend Integration

The frontend integrates directly with Sensay API:
- **Custom Implementation**: Direct fetch calls to Sensay API
- **Real-time Chat**: Live AI responses
- **Pre-configured**: Uses existing user and replica
- **Error Handling**: Comprehensive error messages and recovery
- **No External SDK**: Self-contained implementation

## 📝 Next Steps

1. **Test API Integration**: Verify chat functionality
2. **Add Property Search**: Integrate with property database
3. **User Authentication**: Secure user management
4. **Analytics**: Track chat interactions
5. **Multi-language**: Internationalization support

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid API key"**: Check your Sensay API key
2. **"Rate limit exceeded"**: Wait a moment and try again
3. **"Access denied"**: Verify your account permissions
4. **"Replica not found"**: Check your replica UUID configuration

### Debug Mode

Check browser console for detailed error logs.

## 📚 API Documentation

- **Sensay API**: [https://docs.sensay.io](https://docs.sensay.io)
- **Configuration**: Environment variables in `.env.local`

## ⚠️ Important Notes

- **User and Replica must exist**: This frontend assumes you have already created a user and replica in Sensay
- **No Auto-creation**: The system will not create users or replicas automatically
- **Configuration Required**: You must provide valid user ID and replica UUID
- **Direct Integration**: Uses custom implementation instead of external SDK

## 🚀 Use Cases

### 1. **Real Estate Websites**
- Property search assistance
- Market information
- Investment advice

### 2. **Client Portals**
- Customer support
- Property recommendations
- Market updates

### 3. **Marketing Campaigns**
- Lead generation
- Interactive content
- Customer engagement

### 4. **Mobile Apps**
- WebView integration
- Progressive Web Apps
- Hybrid applications

## 🔗 Related Projects

- **Backend**: `../backend/` - API and database
- **Embed Widget**: `../embed-widget/` - Standalone chat widget for external websites

## 🔧 Technical Implementation

### ChatBox Component
- **Direct API Calls**: Uses `fetch()` to call Sensay API directly
- **Local Storage**: Stores API key securely in browser
- **Error Handling**: Comprehensive error messages and recovery
- **Real-time Updates**: Immediate response display

### API Integration
- **RESTful Calls**: Standard HTTP requests to Sensay
- **Authentication**: Uses organization secret and user ID
- **Versioning**: Supports Sensay API versioning
- **Response Handling**: Processes Sensay API responses directly
