const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001; // Different port from frontend (3000)

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
    '/chat-widget-simple.js': 'chat-widget-simple.js',
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
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-cache' // Disable cache for development
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Widget server running on http://localhost:${PORT}`);
  console.log(`📁 Serving widget files from: ${__dirname}`);
  console.log(`🔗 Available files:`);
  console.log(`   - http://localhost:${PORT}/chat-widget.js`);
  console.log(`   - http://localhost:${PORT}/chat-widget.min.js`);
  console.log(`   - http://localhost:${PORT}/chat-widget-simple.js`);
  console.log(`   - http://localhost:${PORT}/config.js`);
  console.log(`\n💡 Frontend should run on http://localhost:3000`);
  console.log(`💡 Test widget embed at: http://localhost:3000/test-widget`);
});
