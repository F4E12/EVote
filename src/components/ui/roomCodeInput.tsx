// components/RoomCodeInput.tsx
import React, { useState } from "react";
import { db, firestore } from "@/firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Input } from "./input";
import { Button } from "./button";

const RoomCodeInput: React.FC = () => {
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const roomsRef = collection(firestore, "rooms");
      const q = query(roomsRef, where("code", "==", roomCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("Invalid Room Code. Please try again.");
      } else {
        const roomDoc = querySnapshot.docs[0];
        const roomId = roomDoc.id;
        // Optionally, store the roomId in user data or session
        router.push(`/rooms/${roomId}`);
      }
    } catch (error: any) {
      console.error("Error joining room:", error);
      alert("Failed to join room. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleJoinRoom}
        className="p-6 bg-white rounded shadow-md w-full max-w-md"
      >
        <h2 className="mb-4 text-2xl font-bold text-center">
          Join a Voting Room
        </h2>
        <div className="mb-4">
          <label className="block mb-1">Room Code</label>
          <Input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            required
            placeholder="Enter Room Code"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Joining..." : "Join Room"}
        </Button>
      </form>
    </div>
  );
};

export default RoomCodeInput;
