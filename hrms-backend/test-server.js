const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server is running!\n');
});

server.listen(4000, '0.0.0.0', () => {
  console.log('Test server listening on port 4000');
  console.log('Server address:', server.address());
  
  // Heartbeat
  setInterval(() => {
    console.log('Still alive...');
  }, 2000);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

console.log('Script started');
