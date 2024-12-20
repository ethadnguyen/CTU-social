const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const port = process.env.PORT || 5000;
const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: [process.env.USER_URL, process.env.ADMIN_URL],
        credentials: true,
    },
});

let users = [];
let admins = [];

io.on('connection', (socket) => {
    console.log('New socket connection established');
    console.log('users', users.length);
    console.log('admins', admins.length);
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
    socket.on('joinAdmin', (user) => {
        const existingAdmin = admins.find((a) => a.id === user._id);
        console.log('Admin joined:', user.firstName);
        if (!existingAdmin) {
            admins.push({ id: user._id, socketId: socket.id });
        }
    });

    // Gửi thông báo cho bạn bè
    const sendFriendsNotification = (userId, notification) => {
        const sender = users.find((user) => user.id === userId);
        if (!sender) {
            console.error(`Không tìm thấy người dùng với ID: ${userId}`);
            return;
        }

        const friendsId = sender.friends.map(friend => friend._id);

        const onlineFriends = users.filter((user) => friendsId.includes(user.id));

        onlineFriends.forEach((friend) => {
            console.log('Gửi thông báo đến:', friend.id);
            socket.to(friend.socketId).emit('getNotification', notification);
        });
    };

    socket.on('sendFriendsNotification', (data) => {
        const { userId, notification } = data;
        sendFriendsNotification(userId, notification);
    });

    // Gửi thông báo
    socket.on('sendNotification', ({ notification, receiverId }) => {
        console.log('sendNotification:', notification);
        const receiver = users.find((user) => user.id === receiverId);
        if (receiver && receiver.socketId) {
            console.log('Gửi thông báo đến:', receiverId);
            socket.to(receiver.socketId).emit('getNotification', notification);
        } else {
            console.error(`Không tìm thấy người dùng với ID: ${receiverId}`);
        }
    });

    socket.on('friendRequest', ({ userId, request }) => {
        const receiver = users.find((user) => user.id === userId);
        if (receiver && receiver.socketId) {
            console.log('Gửi yêu cầu kết bạn đến:', userId);
            socket.to(receiver.socketId).emit('getFriendRequest', request);
        } else {
            console.error(`Không tìm thấy người dùng với ID: ${userId}`);
        }
    });

    socket.on('unFriend', ({ userId, friendId }) => {
        const user = users.find((u) => u.id === userId);
        const friend = users.find((u) => u.id === friendId);

        if (user && friend) {
            user.friends = user.friends.filter((f) => f !== friendId);

            friend.friends = friend.friends.filter((f) => f !== userId);

            console.log(`Đã xóa bạn giữa ${userId} và ${friendId}`);

            socket.to(user.socketId).emit('friendRemoved', friendId);
            socket.to(friend.socketId).emit('friendRemoved', userId);
        } else {
            console.error(`Không tìm thấy người dùng với ID: ${userId} hoặc bạn với ID: ${friendId}`);
        }
    });

    socket.on('sendMessage', (message) => {
        const receiver = users.find((user) => user.id === message.recipient._id);
        if (receiver && receiver.socketId) {
            console.log('Gửi tin nhắn đến:', receiver.id);
            socket.to(receiver.socketId).emit('getMessage', message);
        } else {
            console.error(`Không tìm thấy người dùng với ID: ${receiver.id}`);
        }
    });

    // group request
    socket.on('groupRequest', (groupRequest) => {
        console.log('admins:', admins.length);
        admins.forEach((admin) => {
            socket.to(admin.socketId).emit('receiveGroupRequest', groupRequest);
        });
    });


    // Ngắt kết nối
    socket.on('disconnect', () => {
        console.log('Socket disconnected');
        users = users.filter((user) => user.socketId !== socket.id);
        admins = admins.filter((admin) => admin.socketId !== socket.id);
    });
});

server.listen(port, () => {
    console.log(`Socket server running on port ${port}`);
});
