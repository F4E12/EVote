// components/VotingResults.tsx
import React, { useEffect, useState } from "react";
import { db, firestore } from "@/firebase/firebase"; // Ensure this is your Firestore instance
import { collection, onSnapshot } from "firebase/firestore"; // Import onSnapshot
import LoadingSpinner from "./loadingSpinner";

interface Candidate {
  id: string;
  name: string;
  votes: number;
}

interface VotingResultsProps {
  roomId: string;
}

const VotingResults: React.FC<VotingResultsProps> = ({ roomId }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Reference to the candidates subcollection
    const candidatesCol = collection(firestore, "rooms", roomId, "candidates");

    // Set up the onSnapshot listener
    const unsubscribe = onSnapshot(
      candidatesCol,
      (snapshot) => {
        const candidatesList: Candidate[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Candidate, "id">),
        }));
        setCandidates(candidatesList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching voting results:", error);
        alert("Failed to fetch voting results.");
        setLoading(false);
      }
    );

    // Cleanup function to unsubscribe from the listener
    return () => unsubscribe();
  }, [roomId, db]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mt-2">
      <h4 className="text-md font-medium">Voting Results</h4>
      <ul className="mt-1 space-y-1">
        {candidates.map((candidate) => (
          <li key={candidate.id} className="flex justify-between">
            <span>{candidate.name}</span>
            <span>{candidate.votes} votes</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VotingResults;
