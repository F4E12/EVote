// components/VotingResults.tsx
import React, { useEffect, useState } from "react";
import { db, firestore } from "@/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
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
    const fetchResults = async () => {
      try {
        const candidatesCol = collection(
          firestore,
          "rooms",
          roomId,
          "candidates"
        );
        const candidatesSnapshot = await getDocs(candidatesCol);
        const candidatesList = candidatesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Candidate, "id">),
        }));
        setCandidates(candidatesList);
      } catch (error: any) {
        console.error("Error fetching voting results:", error);
        alert("Failed to fetch voting results.");
      }
      setLoading(false);
    };

    fetchResults();
  }, [roomId]);

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
