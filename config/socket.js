import { Server } from 'socket.io';

/**
 * Initializes Socket.IO server with event listeners for real-time messaging.
 */
export const initSocket = (server, allowedOrigins) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: allowedOrigins,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected to socket.io");

    // User joins a personal room based on their MongoDB ID
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
      console.log(`User room created for: ${userData._id}`);
    });

    // User joins a specific conversation room
    socket.on("join conversation", (room) => {
      socket.join(room);
      console.log("User joined conversation room: " + room);
    });

    // Typing indicators
    socket.on("typing", (room) => socket.to(room).emit("typing", { conversationId: room }));
    socket.on("stop typing", (room) => socket.to(room).emit("stop typing", { conversationId: room }));

    // Handling a new message
    socket.on("new message", (newMessageRecieved) => {
      let conversation = newMessageRecieved.conversation;

      if (!conversation) {
        return console.log("Message received without conversation.");
      }

      let participants = [];
      if (conversation.participants && Array.isArray(conversation.participants)) {
        participants = conversation.participants;
      } else {
        if (conversation.user) participants.push(conversation.user);
        if (conversation.provider) participants.push(conversation.provider);
      }

      if (participants.length === 0) {
        return console.log("Message received without participants.");
      }

      participants.forEach((participant) => {
        const participantId = participant._id ? participant._id.toString() : participant.toString();
        const senderId = newMessageRecieved.sender._id.toString();
        
        if (participantId === senderId) return;

        socket.in(participantId).emit("message received", newMessageRecieved);
      });
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });

  return io;
};
