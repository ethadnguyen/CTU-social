let users = [];
let admins = [];

const SocketServer = (socket) => {
    console.log('new socket connection established');
    socket.on('joinUser', (user) => {
        const existingUser = users.find((u) => u.id === user._id);
        if (!existingUser) {
            users.push({ id: user._id, socketId: socket.id, friends: user.friends });
        }

        const activeFriends = users.filter((u) => user.friends.includes(u.id));

        socket.emit('activeFriends', activeFriends.map(friend => friend.id));
    });

    socket.on('joinAdmin', (id) => {
        const existingAdmin = admins.find((a) => a.id === id);
        if (!existingAdmin) {
            admins.push({ id, socketId: socket.id });
        }
        const admin = admins.find((admin) => admin.id === id);
        let totalActiveAdmins = users.length;

        socket.to(`${admin.socketId}`).emit('activeAdmins', totalActiveAdmins);
    });

    // like
    socket.on('likePost', (newPost) => {
        let ids = [...newPost.user.followers, newPost.user._id];
        const clients = users.filter((u) => ids.includes(u.id));
        if (clients.length > 0) {
            clients.forEach((client) => {
                socket.to(`${client.socketId}`).emit('likeToClient', newPost);
            });
        }
    });

    // report
    socket.on('reportPost', (reportedPost) => {
        const { id: _id, reportedBy } = reportedPost;

        const notification = {
            message: `Một bài viết với ID: ${_id} đã bị báo cáo bởi người dùng: ${reportedBy}`,
            id: _id,
            reportedBy
        };

        if (admins.length > 0) {
            admins.forEach((admin) => {
                socket.to(`${admin.socketId}`).emit('reportToAdmin', notification);
            });
        }
    });

    // comment
    socket.on('commentPost', (newPost) => {
        let ids = [...newPost.user.followers, newPost.user._id];
        const clients = users.filter((u) => ids.includes(u.id));
        if (clients.length > 0) {
            clients.forEach((client) => {
                socket.to(`${client.socketId}`).emit('commentToClient', newPost);
            });
        }
    });

    // follow
    socket.on('follow', (newUser) => {
        const user = users.find((user) => user.id === newUser._id);
        if (user) {
            socket.to(`${user.socketId}`).emit('followToClient', newUser);
        }
    });

    // notification
    socket.on('createNotify', (msg) => {
        const clients = users.filter((user) => msg.recipients.includes(user.id));
        if (clients.length > 0) {
            clients.forEach((client) => {
                socket.to(`${client.socketId}`).emit('createNotifyToClient', msg);
            });
        }
    });

    socket.on('getActiveUsers', (user) => {
        const activeFriends = users.filter((u) => user.friends.includes(u.id));
        socket.to(`${user.socketId}`).emit('activeFriends', activeFriends.map(friend => friend.id));
    });

    socket.on('getActiveAdmins', (id) => {
        const admin = admins.find((user) => user.id === id);
        if (admin) {
            const totalActiveAdmins = admins.length;
            socket.to(`${admin.socketId}`).emit("getActiveAdminsToClient", totalActiveAdmins);
        }
    });

    socket.on("addMessage", (msg) => {
        const user = users.find(user => user.id === msg.recipient);
        if (user) {
            socket.to(`${user.socketId}`).emit("addMessageToClient", msg);
        }
    });

    socket.on('disconnect', () => {
        users = users.filter((user) => user.socketId !== socket.id);
        admins = admins.filter((admin) => admin.socketId !== socket.id);
    });
};

module.exports = SocketServer;
