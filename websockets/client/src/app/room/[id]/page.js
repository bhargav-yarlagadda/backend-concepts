// pages/room/[id].tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import socket from "@/sockets"; // shared Socket.IO client instance

export default function ChatRoom() {
  // Array to store chat messages
  const [messages, setMessages] = useState([]);
  // Input state for the current message being typed
  const [message, setMessage] = useState("");

  // Get room ID from the dynamic route `/room/[id]`
  const params = useParams();
  // Get username from query string (e.g. ?username=John)
  const query = useSearchParams();

  const roomId = params.id; // room ID from URL
  const username = query.get("username") || "Guest"; // fallback to Guest

  useEffect(() => {
    /**
     * 🔌 Join the WebSocket room
     * Emits a `join-room` event to the server with room name and username.
     */
    socket.emit("join-room", roomId, username);

    /**
     * 📨 Listen for `chat-message` from server
     * This event is sent when someone else in the room sends a message.
     */
    socket.on("chat-message", (data) => {
      setMessages((prev) => [...prev, `${data.userName}: ${data.message}`]);
    });

    /**
     * 🟢 Listen for `user-joined` notifications
     * Server emits this to others when someone new joins the room.
     */
    socket.on("user-joined", (msg) => {
      setMessages((prev) => [...prev, `🔵 ${msg}`]);
    });

    /**
     * 🔴 Listen for `user-left` notifications
     * Triggered when someone disconnects or leaves the room.
     */
    socket.on("user-left", (msg) => {
      setMessages((prev) => [...prev, `🔴 ${msg}`]);
    });

    // 🧹 Clean up socket listeners on unmount
    return () => {
      socket.emit("leave-room", roomId, username); // optional
      socket.off("chat-message");
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, [roomId, username]);

  /**
   * 📨 Send the message to the server
   * Emits a `chat-message` event containing the room, message, and sender name.
   */
  const sendMessage = () => {
    if (message.trim()) {
      // Emit to server (which will broadcast to others)
      socket.emit("chat-message", {
        roomName: roomId,
        message,
        userName: username,
      });

      // Optimistically update UI with sender’s own message
      setMessages((prev) => [...prev, `🟢 Me: ${message}`]);
      setMessage(""); // Clear input box
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Room: {roomId}</h2>

      {/* Chat message display */}
      <div className="border h-80 overflow-y-auto mb-4 p-2 bg-white rounded shadow">
        {messages.map((msg, idx) => (
          <div key={idx} className="text-sm py-1">{msg}</div>
        ))}
      </div>

      {/* Message input + Send button */}
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow p-2 border rounded"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
