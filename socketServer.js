let users = [];
let admins = [];

const SocketServer = (socket) => {
    socket.on('joinUser', (id) => {
        users.push({ id, socketId: socket.id });
    });

    socket.on('joinAdmin', (id) => {
        admins.push({ id, socketId: socket.id });
        const admin = admins.find((admin) => admin.id === id);
        let totalActiveUsers = users.length;

        socket.to(`${admin.socketId}`).emit('activeUsers', totalActiveUsers);
    });
}