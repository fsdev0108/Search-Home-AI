# 🏠 Real Estate AI Chat Widget

A lightweight, customizable JavaScript widget that can be embedded in any website to provide AI-powered real estate assistance.

## 🚀 Quick Start

### 1. Download the Widget

Download `chat-widget.js` from this folder and upload it to your web server or CDN.

### 2. Basic Integration

Add this code to your HTML page (before the closing `</body>` tag):

```html
<script src="https://yourdomain.com/chat-widget.js"></script>
<script>
  RealEstateChat.init({
    apiKey: 'your_sensay_api_key',
    userId: 'your_user_id',
    replicaUuid: 'your_replica_uuid'
  });
</script>
```

### 3. Required Configuration

You must provide these three required parameters:

- **`apiKey`**: Your Sensay organization secret key
- **`userId`**: Your existing Sensay user ID
- **`replicaUuid`**: Your existing Sensay replica UUID

## ⚙️ Configuration Options

### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `apiKey` | string | Your Sensay API key | `'sk_1234567890abcdef'` |
| `userId` | string | Your Sensay user ID | `'user_12345'` |
| `replicaUuid` | string | Your Sensay replica UUID | `'uuid-here'` |

### Optional Parameters

| Parameter | Type | Default | Description | Options |
|-----------|------|---------|-------------|---------|
| `position` | string | `'bottom-right'` | Widget position on page | `'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'` |
| `theme` | string | `'auto'` | Widget theme | `'light'`, `'dark'`, `'auto'` |
| `primaryColor` | string | `'#3cacae'` | Primary color in hex format | Any valid hex color |
| `apiVersion` | string | `'2025-03-25'` | Sensay API version | Sensay API version string |

## 🎨 Customization Examples

### 1. Basic Configuration

```javascript
RealEstateChat.init({
  apiKey: 'sk_1234567890abcdef',
  userId: 'user_12345',
  replicaUuid: 'replica_uuid_here'
});
```

### 2. Custom Position and Theme

```javascript
RealEstateChat.init({
  apiKey: 'sk_1234567890abcdef',
  userId: 'user_12345',
  replicaUuid: 'replica_uuid_here',
  position: 'bottom-left',
  theme: 'dark'
});
```

### 3. Custom Colors

```javascript
RealEstateChat.init({
  apiKey: 'sk_1234567890abcdef',
  userId: 'user_12345',
  replicaUuid: 'replica_uuid_here',
  primaryColor: '#ff6b6b',
  position: 'top-right'
});
```

## 🔧 API Reference

### Methods

#### `RealEstateChat.init(config)`
Initializes the chat widget with the specified configuration.

#### `RealEstateChat.toggle()`
Programmatically opens or closes the chat window.

#### `RealEstateChat.addMessage(content, type)`
Adds a message to the chat programmatically.

#### `RealEstateChat.config`
Returns the current configuration object.

## 📱 Features

- **Lightweight**: Only ~23KB total
- **Customizable**: Colors, position, theme
- **Responsive**: Works on all devices
- **No Dependencies**: Pure JavaScript
- **Real-time Chat**: Direct Sensay API integration
- **Multiple Positions**: 4 different corner positions
- **Theme Support**: Light, dark, and auto themes
- **Mobile Optimized**: Full-screen on mobile devices

## 🚨 Prerequisites

**IMPORTANT**: You must have already created a user and replica in your Sensay dashboard before using this widget.

1. **Create User**: Go to Sensay dashboard and create a user
2. **Create Replica**: Create a replica for that user
3. **Get API Key**: Generate an API key for your organization
4. **Configure Widget**: Use the IDs in the widget configuration

## 🔒 Security Considerations

- **Never expose API keys** in client-side code for production
- **Use environment variables** for sensitive configuration
- **Consider proxy endpoints** for additional security
- **Ensure CORS** is properly configured in Sensay

## 📋 Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **IE**: Not supported

## 🚀 Deployment

### 1. Upload to CDN
Upload `chat-widget.js` to your CDN or web server.

### 2. Update Script URLs
Update the script source in client websites.

### 3. Test Integration
Verify the widget works on different platforms.

## 📞 Support

### Getting Help

1. **Check this documentation** first
2. **Review console errors** for debugging
3. **Test with minimal configuration**
4. **Contact support** if issues persist

### Debug Mode

Enable debug logging by setting:

```javascript
localStorage.setItem('chat-widget-debug', 'true');
```

## 📄 Files

- **`chat-widget.js`** - Main widget script
- **`embed-example.html`** - Demo page showing the widget
- **`EMBED_DOCUMENTATION.md`** - Comprehensive documentation
- **`README.md`** - This file

## 🔗 Related Resources

- [Sensay API Documentation](https://docs.sensay.io)
- [Main Project README](../README.md)
- [Widget Demo](./embed-example.html)

---

**Version**: 1.0.0  
**Compatibility**: Sensay API v2025-03-25+  
**Last Updated**: September 2024
