const express = require('express');
const http = require('http');
require('dotenv').config();
const { Server } = require('socket.io');
const { setupSocket } = require('./services/sockets/Socket.js');
const v1Router = require("./routes/v1/index.js")
const connectDB = require("./config/db.js")
const cors = require('cors');
const path = require("path")

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

// API routes
app.use("/api/v1", v1Router)

setupSocket(io);

if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "..", "Frontend", "dist");
  
  // Serve static files with proper MIME types
  app.use(express.static(buildPath, {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));
  
  // Catch-all handler: send back React's index.html file for non-API routes
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.url.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    
    res.sendFile(path.resolve(buildPath, "index.html"));
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});