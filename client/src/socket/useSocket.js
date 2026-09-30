import { io } from "socket.io-client";

let socket = null;

const useSocket = () => {
  const connect = (token) => {
    if (!socket) {
      socket = io("http://localhost:5000", {
        autoConnect: false,
        withCredentials: true,
        auth: {
          token: token,
        },
      });
    }

    if (!socket.connected) {
      socket.connect();
    }
  };

  const disConnect = () => {
    if (socket) {
      socket.disconnect();
    }
  };

  return {
    socket,
    connected: socket ? socket.connected : false,
    connect,
    disConnect,
  };
};

export default useSocket;
