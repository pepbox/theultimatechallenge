const express = require('express');
const http = require('http');
require('dotenv').config();
const { Server } = require('socket.io');
const { setupSocket } = require('./services/sockets/Socket.js');
const v1Router = require("./routes/v1/index.js")
const connectDB = require("./config/db.js")
const cors = require('cors');
const path=require("path")

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors({
  origin: '*',
  credentials: true // if you plan to send cookies or auth headers
}));

app.use(express.json())
connectDB()


// app.get('/', (req, res) => {
//     res.send('Hello from server');
// });



app.use("/api/v1",v1Router)

setupSocket(io);


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