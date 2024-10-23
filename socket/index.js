const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const port = process.env.PORT || 5000;
const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Địa chỉ frontend
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

let users = [];
let admins = [];

io.on('connection', (socket) => {
    console.log('New socket connection established');

    // Tham gia người dùng
    socket.on('joinUser', (user) => {
        console.log('User joined:');
        const existingUser = users.find((u) => u.id === user._id);
        if (!existingUser) {
            users.push({ id: user._id, socketId: socket.id, friends: user.friends, followers: user.followers });
        }
        const activeFriends = users.filter((u) => user.friends.includes(u.id));
        socket.emit('activeFriends', activeFriends.map(friend => friend.id));
    });

    // Tham gia admin
    socket.on('joinAdmin', (id) => {
        const existingAdmin = admins.find((a) => a.id === id);
        if (!existingAdmin) {
            admins.push({ id, socketId: socket.id });
        }
        const admin = admins.find((admin) => admin.id === id);
        let totalActiveAdmins = admins.length;

        socket.to(`${admin.socketId}`).emit('activeAdmins', totalActiveAdmins);
    });

    // Xử lý thích bài viết
    socket.on('likePost', (data) => {
        const { userId, postId } = data;
        const user = users.find((u) => u.id === userId);
        if (user) {
            // Cập nhật thuộc tính "likes" của bài viết trên server (bạn cần có API hoặc DB cho việc này)

            const followers = users.filter((u) => user.followers.includes(u.id));
            followers.forEach((follower) => {
                socket.to(`${follower.socketId}`).emit('likeToClient', { postId, userId });
            });

            console.log(`User ${userId} đã thích bài viết ${postId}`);
        }
    });

    // Xử lý báo cáo bài viết
    socket.on('reportPost', (reportedPost) => {
        const { id, reportedBy } = reportedPost;

        const notification = {
            message: `Một bài viết với ID: ${id} đã bị báo cáo bởi người dùng: ${reportedBy}`,
            id,
            reportedBy,
        };

        if (admins.length > 0) {
            admins.forEach((admin) => {
                socket.to(`${admin.socketId}`).emit('reportToAdmin', notification);
            });
        }
    });

    // Xử lý bình luận bài viết
    socket.on('commentPost', (newPost) => {
        const ids = [...newPost.user.followers, newPost.user._id];
        const clients = users.filter((u) => ids.includes(u.id));
        if (clients.length > 0) {
            clients.forEach((client) => {
                socket.to(`${client.socketId}`).emit('commentToClient', newPost);
            });
        }
    });

    // Xử lý theo dõi người dùng
    socket.on('follow', (newUser) => {
        const user = users.find((user) => user.id === newUser._id);
        if (user) {
            socket.to(`${user.socketId}`).emit('followToClient', newUser);
        }
    });

    // Tạo thông báo
    socket.on('createNotify', (msg) => {
        const clients = users.filter((user) => msg.recipients.includes(user.id));
        if (clients.length > 0) {
            clients.forEach((client) => {
                socket.to(`${client.socketId}`).emit('createNotifyToClient', msg);
            });
        }
    });

    // Lấy danh sách người dùng đang hoạt động
    socket.on('getActiveUsers', (user) => {
        const activeFriends = users.filter((u) => user.friends.includes(u.id));
        socket.to(`${user.socketId}`).emit('activeFriends', activeFriends.map(friend => friend.id));
    });

    // Lấy danh sách admin đang hoạt động
    socket.on('getActiveAdmins', (id) => {
        const admin = admins.find((user) => user.id === id);
        if (admin) {
            const totalActiveAdmins = admins.length;
            socket.to(`${admin.socketId}`).emit("getActiveAdminsToClient", totalActiveAdmins);
        }
    });

    // Thêm tin nhắn
    socket.on("addMessage", (msg) => {
        const user = users.find(user => user.id === msg.recipient);
        if (user) {
            socket.to(`${user.socketId}`).emit("addMessageToClient", msg);
        }
    });

    // Ngắt kết nối
    socket.on('disconnect', () => {
        users = users.filter((user) => user.socketId !== socket.id);
        admins = admins.filter((admin) => admin.socketId !== socket.id);
    });
});

server.listen(port, () => {
    console.log(`Socket server running on port ${port}`);
});
