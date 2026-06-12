const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Admin joins admin room
    socket.on('join_admin', () => {
      socket.join('admin_room');
      console.log(`👑 Admin joined: ${socket.id}`);
    });

    // Customer joins their order room
    socket.on('join_order', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`🛒 Customer joined order room: order_${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
