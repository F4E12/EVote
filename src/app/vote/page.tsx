"use client";

import { useState, useEffect } from "react";
import { firestore, auth } from "@/firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  increment,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/ui/logout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import withGuest from "../hooks/withGuest";

interface Candidate {
  id: string;
  name: string;
  votes: number;
}

const VotePage: React.FC = () => {
  const [roomCode, setRoomCode] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const router = useRouter();

  // Function to join a room by code
  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      alert("Please enter a room code.");
      return;
    }

    setLoading(true);
    try {
      const roomsRef = collection(firestore, "rooms");
      const q = query(roomsRef, where("code", "==", roomCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("Invalid Room Code. Please try again.");
        setLoading(false);
        return;
      }

      const roomDoc = querySnapshot.docs[0];
      const fetchedRoomId = roomDoc.id;
      const fetchedRoomName = roomDoc.data().name;
      setRoomId(fetchedRoomId);
      setRoomName(fetchedRoomName);
      setRoomCode("");

      // Fetch candidates
      const candidatesRef = collection(
        firestore,
        "rooms",
        fetchedRoomId,
        "candidates"
      );
      const candidatesSnapshot = await getDocs(candidatesRef);
      const candidatesList = candidatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Candidate, "id">),
      }));
      setCandidates(candidatesList);

      // Check if user has already voted
      const user = auth.currentUser;
      if (user) {
        const voteDocRef = doc(
          firestore,
          "rooms",
          fetchedRoomId,
          "votes",
          user.uid
        );
        const voteDoc = await getDoc(voteDocRef);
        if (voteDoc.exists()) {
          setHasVoted(true);
        }
      }
    } catch (error: any) {
      console.error("Error joining room:", error);
      alert("Failed to join room. Please try again.");
    }
    setLoading(false);
  };

  // Function to handle voting
  const handleVote = async (candidateId: string) => {
    const user = auth.currentUser;
    if (!user || !roomId) {
      alert("You need to be logged in and have joined a room to vote.");
      router.push("/login");
      return;
    }

    const confirmVote = confirm(
      "Are you sure you want to vote for this candidate?"
    );
    if (!confirmVote) return;

    setVoting(true);
    try {
      // Atomically increment the candidate's vote count
      const candidateRef = doc(
        firestore,
        "rooms",
        roomId,
        "candidates",
        candidateId
      );
      await updateDoc(candidateRef, {
        votes: increment(1),
      });

      // Record that the user has voted
      const voteRef = doc(firestore, "rooms", roomId, "votes", user.uid);
      await setDoc(voteRef, {
        candidateId,
        votedAt: new Date(),
      });

      setHasVoted(true);
      alert("Your vote has been recorded!");
    } catch (error: any) {
      console.error("Error voting:", error);
      alert("Failed to cast your vote. Please try again.");
    }
    setVoting(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <header className="flex justify-end p-4 bg-gray-200">
        <LogoutButton />
      </header>
      <main className="flex flex-col items-center justify-center p-6">
        {!roomId ? (
          <form
            onSubmit={joinRoom}
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
        ) : (
          <div className="w-full max-w-lg">
            <div className="mb-4 text-center">
              <h2 className="mb-2 text-2xl font-bold">Room: {roomName}</h2>
              {hasVoted ? (
                <p className="text-green-500">
                  You have already voted in this room.
                </p>
              ) : (
                <p className="mb-4">
                  Please select your preferred leader below.
                </p>
              )}
            </div>
            {hasVoted ? (
              <p className="text-center text-green-500">
                Thank you for voting!
              </p>
            ) : (
              <ul>
                {candidates.map((candidate) => (
                  <li
                    key={candidate.id}
                    className="flex items-center justify-between p-2 border-b"
                  >
                    <span>{candidate.name}</span>
                    <Button
                      onClick={() => handleVote(candidate.id)}
                      disabled={voting}
                    >
                      {voting ? "Voting..." : "Vote"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default withGuest(VotePage);
