import { useEffect } from "react";
import socket, { connectSocket, disconnectSocket } from "../api/socket";
import { useSelector } from "react-redux";

const useSocket = () => {
    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        if (user) {
            connectSocket();
            if (!socket.hasJoined) {
                socket.emit("joinAdmin", user);
                socket.hasJoined = true;
            }

            return () => {
                disconnectSocket();
            };
        }
    }, [user]);
};

export default useSocket;
