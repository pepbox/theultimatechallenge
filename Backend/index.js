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

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true // Allow cookies and auth headers
}));

app.use(express.json());
connectDB();

app.use("/api/v1", v1Router);

setupSocket(io);

app.set("socketService",io);



if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "..", "Frontend", "dist");
  app.use(express.static(buildPath));
  
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.resolve(buildPath, "index.html"));
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


