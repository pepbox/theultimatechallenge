const express = require('express');
const http = require('http');
require('dotenv').config();
const { Server } = require('socket.io');
const { setupSocket } = require('./services/sockets/Socket.js');
const v1Router = require("./routes/v1/index.js")
const connectDB = require("./config/db.js")
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors({
  origin: '*',
  credentials: true // if you plan to send cookies or auth headers
}));

app.use(express.json())
connectDB()

app.get('/', (req, res) => {
    res.send('Hello from server');
});

app.use("/api/v1",v1Router)

setupSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});