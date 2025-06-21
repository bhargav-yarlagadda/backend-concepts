"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const [username, setUsername] = useState("");
  const [roomName, setRoomName] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (username && roomName) {
      router.push(`/room/${roomName}?username=${encodeURIComponent(username)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-100 p-8 rounded-2xl shadow-lg space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">Join a Chat Room</h1>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-600">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Room Name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter room name"
            />
          </div>

          <button
            onClick={handleJoin}
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
