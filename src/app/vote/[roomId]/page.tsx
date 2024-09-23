"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db, firestore } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import LogoutButton from "@/components/ui/logout";
import LeaderSelection from "@/components/ui/leaderSelection";
import withGuest from "../../hooks/withGuest";

const RoomPage: React.FC = () => {
  const router = useRouter();
  const { roomId } = useParams();
  const [roomExists, setRoomExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (roomId && typeof roomId === "string") {
      const checkRoom = async () => {
        try {
          const roomDoc = await getDoc(doc(firestore, "rooms", roomId));
          if (roomDoc.exists()) {
            setRoomExists(true);
          } else {
            alert("Room does not exist.");
            router.push("/vote");
          }
        } catch (error: any) {
          console.error("Error checking room:", error);
          alert("Failed to verify room.");
          router.push("/vote");
        }
        setLoading(false);
      };

      checkRoom();
    }
  }, [roomId, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <header className="flex justify-end p-4 bg-gray-200">
        <LogoutButton />
      </header>
      {roomExists && typeof roomId === "string" ? (
        <LeaderSelection roomId={roomId} />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <p>Invalid Room.</p>
        </div>
      )}
    </div>
  );
};

export default withGuest(RoomPage);
