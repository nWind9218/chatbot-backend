const sendMessage = (io, socket) => {
  socket.on("send_message", (data) => {
    const { user_id, message } = data;

    if (!user_id || !message) {
      socket.emit("error", { msg: "Thiếu user_id hoặc message" });
      return;
    }
    socket.join(user_id);
    console.log(`Socket ${socket.id} joined room ${user_id}`);
    console.log(`Tin nhắn từ ${user_id}: ${message}`);
    io.to(user_id).emit("received" , {msg: "Da nhan"});
  });
};

module.exports = { sendMessage };
