# 🏠 Real Estate AI Chat Widget - Embed Documentation

## 📖 Overview

The Real Estate AI Chat Widget is a lightweight, customizable JavaScript widget that can be embedded in any website to provide AI-powered real estate assistance. It integrates directly with the Sensay API and provides a seamless chat experience for users.

## 🚀 Quick Start

### 1. Basic Integration

Add this code to your HTML page (before the closing `</body>` tag):

```html
<script src="https://yourdomain.com/chat-widget.js"></script>
<script>
  RealEstateChat.init({
    userId: 'your_user_id',
    replicaUuid: 'your_replica_uuid'
  });
</script>
```

### 2. Required Configuration

You must provide these two required parameters:

- **`userId`**: Your existing Sensay user ID
- **`replicaUuid`**: Your existing Sensay replica UUID

**Note:** The API Key is automatically configured on our server side.

## ⚙️ Configuration Options

### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
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

### 4. Full Customization

```javascript
RealEstateChat.init({
  apiKey: 'sk_1234567890abcdef',
  userId: 'user_12345',
  replicaUuid: 'replica_uuid_here',
  position: 'bottom-left',
  theme: 'light',
  primaryColor: '#4ecdc4',
  apiVersion: '2025-03-25'
});
```

## 🔧 API Reference

### Methods

#### `RealEstateChat.init(config)`
Initializes the chat widget with the specified configuration.

**Parameters:**
- `config` (object): Configuration object

**Returns:** `undefined`

#### `RealEstateChat.toggle()`
Programmatically opens or closes the chat window.

**Parameters:** None

**Returns:** `undefined`

#### `RealEstateChat.addMessage(content, type)`
Adds a message to the chat programmatically.

**Parameters:**
- `content` (string): Message content
- `type` (string): Message type - `'user'` or `'assistant'`

**Returns:** `undefined`

#### `RealEstateChat.config`
Returns the current configuration object.

**Returns:** `object`

### Events

The widget automatically handles these events:

- **Click events**: Button clicks, form submissions
- **Keyboard events**: Enter key for sending, Escape key for closing
- **Responsive events**: Mobile device detection
- **Theme events**: System theme preference changes

## 📱 Responsive Design

The widget automatically adapts to different screen sizes:

- **Desktop**: Fixed size (350x500px)
- **Mobile**: Full screen with margins
- **Tablet**: Responsive sizing

### Mobile Breakpoint

```css
@media (max-width: 480px) {
  .chat-widget-window {
    width: calc(100vw - 40px);
    height: calc(100vh - 120px);
  }
}
```

## 🎨 Theme System

### Available Themes

1. **Light Theme**: Clean white background with dark text
2. **Dark Theme**: Dark background with light text
3. **Auto Theme**: Automatically follows system preference

### Theme Switching

```javascript
// Force light theme
RealEstateChat.init({
  // ... other config
  theme: 'light'
});

// Force dark theme
RealEstateChat.init({
  // ... other config
  theme: 'dark'
});

// Auto theme (default)
RealEstateChat.init({
  // ... other config
  theme: 'auto'
});
```

## 🔒 Security Considerations

### API Key Security

- **Never expose API keys** in client-side code for production
- **Use environment variables** for sensitive configuration
- **Consider proxy endpoints** for additional security

### CORS Configuration

The widget makes direct API calls to Sensay. Ensure your domain is allowed in Sensay's CORS settings.

## 🚨 Error Handling

### Common Errors

1. **Missing Configuration**: Console error if required fields are missing
2. **API Errors**: User-friendly error messages for API failures
3. **Network Errors**: Graceful fallback for connection issues

### Error Messages

- `"Missing required configuration"` - Required fields not provided
- `"Authentication failed"` - Invalid API key
- `"Replica not found"` - Invalid replica UUID
- `"Rate limit exceeded"` - API rate limit reached

## 🔧 Troubleshooting

### Widget Not Appearing

1. Check browser console for errors
2. Verify all required parameters are provided
3. Ensure the script is loaded correctly
4. Check if there are CSS conflicts

### Chat Not Working

1. Verify API key is valid
2. Check user ID and replica UUID
3. Ensure Sensay API is accessible
4. Check network connectivity

### Styling Issues

1. Check for CSS conflicts with your site
2. Verify z-index values
3. Ensure no conflicting styles
4. Test in different browsers

## 📋 Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **IE**: Not supported

## 🚀 Performance

### Optimization Features

- **Lazy loading**: Styles and HTML created on demand
- **Minimal DOM manipulation**: Efficient updates
- **CSS animations**: Hardware-accelerated transitions
- **Memory management**: Clean event listener removal

### Bundle Size

- **Widget script**: ~15KB (minified)
- **CSS**: ~8KB (injected)
- **Total**: ~23KB

## 🔄 Updates and Maintenance

### Version Updates

1. **Check for updates** regularly
2. **Test compatibility** with your site
3. **Update script URL** when new versions are available

### Breaking Changes

- **Major versions** will be documented
- **Deprecation warnings** will be shown in console
- **Migration guides** will be provided

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

## 📄 License

This widget is provided as-is for integration with the Sensay API. Ensure compliance with Sensay's terms of service and your local regulations.

## 🔗 Related Resources

- [Sensay API Documentation](https://docs.sensay.io)
- [Widget Demo Page](./embed-example.html)
- [Source Code](./chat-widget.js)
- [Configuration Examples](./config/sensay.js)

---

**Last Updated**: September 2024  
**Version**: 1.0.0  
**Compatibility**: Sensay API v2025-03-25+
