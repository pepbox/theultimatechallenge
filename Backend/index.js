const express = require('express');
const http = require('http');
require('dotenv').config();
const { Server } = require('socket.io');
const { setupSocket } = require('./services/sockets/Socket.js');
const v1Router = require("./routes/v1/index.js");
const connectDB = require("./config/db.js");
const cors = require('cors');
const path = require("path");
const cookieParser = require('cookie-parser');

const { connectRedis, redis } = require("./config/redis.js");

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:8080',
  'http://localhost:8081',
  'https://theultimatechallenge.techteamactivity.com',
  'https://teamformation.techteamactivity.com',
  'https://techteamactivity.com',
  'https://theultimatechallenge.pages.dev'
];

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow non-browser requests (server-to-server, curl, etc.)
  if (allowedOrigins.includes(origin)) return true;
  if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return true;
  if (origin.endsWith('.pages.dev')) return true;
  if (origin.endsWith('.techteamactivity.com')) return true;

  if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL.replace(/\/$/, '')) return true;
  if (process.env.TEAM_FORMATION_LINK && origin === process.env.TEAM_FORMATION_LINK.replace(/\/$/, '')) return true;
  if (process.env.ALLOWED_ORIGINS) {
    const customList = process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim().replace(/\/$/, ''));
    if (customList.includes(origin)) return true;
  }
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../Frontend/dist");
  
  // Serve static files FIRST - try multiple approaches
  app.use(express.static(buildPath));
  app.use('/assets', express.static(path.join(buildPath, 'assets')));
  
  app.use(express.static(buildPath, {
    setHeaders: (res, filePath) => {
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
app.use("/api/v1", v1Router);

setupSocket(io);
app.set('socketService', io);
app.set('redisClient', redis);

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

const startServer = async () => {
  await connectDB();
  await connectRedis(io);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();


