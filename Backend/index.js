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

if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../Frontend/dist");
  
  // Debug: Log the build path and check what files exist
  console.log('Serving static files from:', buildPath);
  
  const fs = require('fs');
  try {
    console.log('Files in dist:', fs.readdirSync(buildPath));
    if (fs.existsSync(path.join(buildPath, 'assets'))) {
      console.log('Files in assets:', fs.readdirSync(path.join(buildPath, 'assets')));
    } else {
      console.log('Assets folder does not exist!');
    }
  } catch (err) {
    console.log('Error reading directory:', err.message);
  }
  
  // Add request logging to see what's being requested
  app.use((req, res, next) => {
    if (!req.url.startsWith('/api')) {
      console.log('REQUEST:', req.method, req.url);
    }
    next();
  });
  
  // Serve static files FIRST - try multiple approaches
  app.use(express.static(buildPath));
  app.use('/assets', express.static(path.join(buildPath, 'assets')));
  
  // Additional debugging for static files
  app.use(express.static(buildPath, {
    setHeaders: (res, filePath) => {
      console.log('Serving static file:', filePath);
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));
}

// API routes AFTER static files
app.use("/api/v1", v1Router)

setupSocket(io);

if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../Frontend/dist");
  
  // Handle React Router - only for non-file requests
  app.get(/^(?!\/api).*/, (req, res) => {
    // If the request has a file extension, it's likely a missing static file
    if (path.extname(req.path)) {
      return res.status(404).send('File not found');
    }
    
    // Otherwise, serve the React app
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});