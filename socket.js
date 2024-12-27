let io;

module.exports = {
  init: (httpServer) => {
    const { Server: SocketIOServer } = require("socket.io");
    io = new SocketIOServer(httpServer);
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized");
    }
    return io;
  },
};
