const express = require('express');
const http = require('http');
require('dotenv').config();
const { Server } = require('socket.io');
const { setupSocket } = require('./services/sockets/Socket.js');
const v1Router = require("./routes/v1/index.js")
const connectDB = require("./config/db.js")
const cors = require('cors');
// Removed path module to avoid path-to-regexp conflicts

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const socketinit = require("./services/sockets/Socket.js")
const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true // if you plan to send cookies or auth headers
}));

app.use(express.json())
connectDB()

// API routes
app.use("/api/v1", v1Router)

setupSocket(io);

if (process.env.NODE_ENV === "production") {
  const buildPath = __dirname + "/../Frontend/dist";


  app.use(express.static(buildPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));


  app.use((req, res, next) => {

    if (req.url.startsWith('/api/')) {
      return next();
    }


    res.sendFile(buildPath + "/index.html");
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});