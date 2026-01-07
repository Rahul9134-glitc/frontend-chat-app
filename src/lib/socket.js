import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.MODE === "development" ? "http://localhost:4000" : "https://backend-chat-app-qfag.onrender.com";

let socket = null;

export const connectSocket = (userId) => {
  if (!userId) return null;

  // If already connected, return the existing instance
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    query: {
      userId,
    },
    // FIX 1: Force WebSocket to avoid CORS Polling errors
    transports: ["websocket"], 
    // FIX 2: Send cookies/headers if backend expects 'credentials: true'
    withCredentials: true, 
  });

  socket.on("connect", () => {
    console.log("✅ Connected to socket server:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting socket...");
    socket.disconnect();
    socket = null;
  }
};