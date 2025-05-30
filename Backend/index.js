const express = require('express');
const http = require('http');
require('dotenv').config();
const { Server } = require('socket.io');
const { setupSocket } = require('./services/sockets/Socket.js');
const v1Router = require("./routes/v1/index.js")
const connectDB = require("./config/db.js")
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const socketinit = require("./services/sockets/Socket.js")
const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:5173','http://localhost:4173'],
  credentials: true // if you plan to send cookies or auth headers
}));

app.use(express.json())
connectDB()

// API routes FIRST
app.use("/api/v1", v1Router)

setupSocket(io);

if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../Frontend/dist");
  
  // Serve static files with proper MIME types
  app.use(express.static(buildPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html');
      }
    }
  }));
  
  // Catch-all handler LAST: send back React's index.html file for non-API and non-static routes
  app.use((req, res, next) => {
    // Skip API routes (though they should be handled above)
    if (req.url.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    
    // Skip static files (they should be served above)
    if (req.url.includes('.')) {
      return res.status(404).send('File not found');
    }
    
    // Serve React app for all other routes
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});