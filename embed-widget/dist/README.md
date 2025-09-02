# 📦 Distribution Files

This folder contains the production-ready files for the Real Estate AI Chat Widget.

## 📄 Files

- **`chat-widget.js`** - Development version (readable, with comments)
- **`chat-widget.min.js`** - Production version (minified, optimized)
- **`chat-widget.min.js.map`** - Source map for debugging

## 🚀 Usage

### For Development
```html
<script src="chat-widget.js"></script>
```

### For Production
```html
<script src="chat-widget.min.js"></script>
```

## 🔧 Build

To create the production files:

```bash
npm run build
```

This will:
1. Minify the code
2. Generate source maps
3. Create build information
4. Optimize for production use

## 📊 File Sizes

- **Development**: ~15KB
- **Production**: ~8KB
- **Reduction**: ~47%

## 🌐 CDN Deployment

Upload these files to your CDN or web server:

1. `chat-widget.min.js` - Main production file
2. `chat-widget.min.js.map` - Source map (optional)
3. Update script URLs in client websites

## 📝 Integration Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to my site</h1>
    
    <!-- Widget will appear here -->
    
    <!-- Load the widget -->
    <script src="https://your-cdn.com/chat-widget.min.js"></script>
    <script>
        RealEstateChat.init({
            apiKey: 'your_api_key',
            userId: 'your_user_id',
            replicaUuid: 'your_replica_uuid'
        });
    </script>
</body>
</html>
```

## 🔒 Security Notes

- **Never expose API keys** in client-side code for production
- **Use environment variables** for sensitive configuration
- **Consider proxy endpoints** for additional security
- **Ensure CORS** is properly configured in Sensay

## 📞 Support

For issues or questions:
1. Check the main documentation
2. Review console errors
3. Verify configuration parameters
4. Contact support if needed

---

**Version**: 1.0.0  
**Last Updated**: September 2024
