const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || process.env.WIDGET_PORT || 3001;

const server = http.createServer((req, res) => {
  // Set CORS headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath = req.url;
  
  // Default to chat-widget.js if root is requested
  if (filePath === '/') {
    filePath = '/chat-widget.js';
  }
  
  // Remove query parameters
  filePath = filePath.split('?')[0];
  
  // Map URLs to files
  const fileMap = {
    '/chat-widget.js': 'chat-widget.js',
    '/chat-widget.min.js': 'chat-widget.min.js',
    '/config.js': 'config.js'
  };
  
  const fileName = fileMap[filePath];
  
  if (!fileName) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
    return;
  }
  
  const fullPath = path.join(__dirname, fileName);
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
    return;
  }
  
  // Read and serve the file
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal server error');
      return;
    }
    
    // Set appropriate content type
    const ext = path.extname(fileName);
    const contentType = {
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.html': 'text/html'
    }[ext] || 'text/plain';
    
    const headers = {
      'Content-Type': contentType
    };
    
    // Set cache headers based on environment
    if (process.env.NODE_ENV === 'production') {
      headers['Cache-Control'] = 'public, max-age=3600'; // 1 hour cache in production
    } else {
      headers['Cache-Control'] = 'no-cache'; // No cache in development
    }
    
    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const host = process.env.NODE_ENV === 'production' ? 'https://your-railway-domain.railway.app' : `http://localhost:${PORT}`;
  console.log(`🚀 Widget server running on port ${PORT}`);
  console.log(`📁 Serving widget files from: ${__dirname}`);
  console.log(`🔗 Available files:`);
  console.log(`   - ${host}/chat-widget.js`);
  console.log(`   - ${host}/chat-widget.min.js`);
  console.log(`   - ${host}/config.js`);
  console.log(`\n🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`💡 Frontend should run on http://localhost:3000`);
    console.log(`💡 Test widget embed at: http://localhost:3000/test-widget`);
  }
});
