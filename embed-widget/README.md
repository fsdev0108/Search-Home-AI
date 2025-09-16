# 🏠 Real Estate AI Chat Widget

A lightweight, customizable JavaScript widget for AI-powered real estate assistance.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file with your Sensay API key:

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```env
SENSAY_API_KEY=your_sensay_organization_secret_here
```

### 2. Development

Start the development server:

```bash
npm run dev
```

This will start a server on `http://localhost:3001` serving the widget files.

### 3. Production Build

Build the widget for production:

```bash
npm run build:prod
```

This will:
- Replace `{{SENSAY_API_KEY}}` with your environment variable
- Minify the code
- Generate `chat-widget.min.js`

## 📦 Usage

### For Clients

Clients only need to include this code in their website:

```html
<script src="https://yourdomain.com/chat-widget.min.js"></script>
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

### Required Parameters

- `userId`: Sensay user ID
- `replicaUuid`: Sensay replica UUID

### Optional Parameters

- `position`: Widget position (`bottom-right`, `bottom-left`, `top-right`, `top-left`)
- `theme`: Widget theme (`light`, `dark`, `auto`)
- `primaryColor`: Primary color in hex format

## 🔒 Security

- **API Key**: Never exposed in source code
- **Build Process**: API key is injected during build from environment variables
- **Client**: Only needs to provide `userId` and `replicaUuid`

## 🏗️ Build Process

1. **Source**: `chat-widget.js` contains `{{SENSAY_API_KEY}}` placeholder
2. **Build**: `build.js` replaces placeholder with environment variable
3. **Output**: `chat-widget.min.js` with actual API key
4. **Deploy**: Minified file is served to clients

## 📁 Files

- `chat-widget.js` - Source code with placeholder
- `chat-widget.min.js` - Built/minified version (generated)
- `build.js` - Build script
- `server.js` - Development server
- `.env.example` - Environment variables template

## 🚨 Important

**Never commit the `.env` file or built files with real API keys to version control!**

The `.gitignore` file is configured to exclude:
- `.env` files
- `chat-widget.min.js` (built files)
- `build-info.json`