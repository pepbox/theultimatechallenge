function setupSocket(io) {
    io.on('connection', (socket) => {
        console.log('A user connected');

       
        socket.on('disconnect', () => {
            console.log('A user disconnected');
            socket.broadcast.emit('message', 'A user has left the chat');
        });
    });
}

module.exports = { setupSocket };