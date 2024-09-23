"use client";

import React, { useState } from "react";
import { db, firestore } from "@/firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Input } from "./input";
import { Button } from "./button";

const CreateRoomForm: React.FC = () => {
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomCode || !roomName) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const roomsRef = collection(firestore, "rooms");
      // Check if room code already exists
      const q = query(roomsRef, where("code", "==", roomCode));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert("Room code already exists. Please choose a different code.");
        setLoading(false);
        return;
      }

      await addDoc(roomsRef, {
        code: roomCode,
        name: roomName,
        createdAt: serverTimestamp(),
      });

      alert("Room created successfully!");
      setRoomCode("");
      setRoomName("");
    } catch (error: any) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Please try again.");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleCreateRoom}
      className="p-4 bg-gray-100 rounded shadow-md"
    >
      <h3 className="mb-4 text-xl font-semibold">Create New Room</h3>
      <div className="mb-4">
        <label className="block mb-1">Room Code</label>
        <Input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          required
          placeholder="Enter unique room code"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Room Name</label>
        <Input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
          placeholder="Enter room name"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Room"}
      </Button>
    </form>
  );
};

export default CreateRoomForm;
