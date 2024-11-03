// hooks/useSocket.js
import { useEffect } from "react";
import socket, { connectSocket, disconnectSocket } from "../api/socket";
import { useSelector } from "react-redux";

const useSocket = () => {
    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        if (user) {
            connectSocket();
            socket.emit("joinUser", user);

            // Cleanup function chỉ khi logout
            return () => {
                disconnectSocket();
            };
        }
    }, [user]);
};

export default useSocket;
