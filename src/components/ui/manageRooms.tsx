"use client";

import React, { useEffect, useState } from "react";
import { db, firestore } from "@/firebase/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import LoadingSpinner from "./loadingSpinner";
import { Button } from "./button";
import AddCandidateForm from "./addCandidateForm";
import VotingResults from "./votingResult";

interface Room {
  id: string;
  code: string;
  name: string;
}

const ManageRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsCol = collection(firestore, "rooms");
        const roomsSnapshot = await getDocs(roomsCol);
        const roomsList = roomsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Room, "id">),
        }));
        setRooms(roomsList);
      } catch (error: any) {
        console.error("Error fetching rooms:", error);
        alert("Failed to fetch rooms.");
      }
      setLoading(false);
    };

    fetchRooms();
  }, []);

  const handleDeleteRoom = async (roomId: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this room? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(firestore, "rooms", roomId));
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
      alert("Room deleted successfully.");
    } catch (error: any) {
      console.error("Error deleting room:", error);
      alert("Failed to delete room.");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-xl font-semibold">Existing Rooms</h3>
      {rooms.length === 0 ? (
        <p>No rooms available. Create a new room to get started.</p>
      ) : (
        <ul className="space-y-4">
          {rooms.map((room) => (
            <li key={room.id} className="p-4 bg-gray-50 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium">{room.name}</p>
                  <p className="text-sm text-gray-600">Code: {room.code}</p>
                </div>
                <div className="flex space-x-2">
                  <AddCandidateForm roomId={room.id} />
                  <VotingResults roomId={room.id} />
                  <Button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageRooms;
