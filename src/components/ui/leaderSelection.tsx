// Import necessary functions from Firebase Firestore
import {
  getDoc,
  doc,
  updateDoc,
  increment,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, firestore } from "@/firebase/firebase";
import { useRouter } from "next/navigation";
import LoadingSpinner from "./loadingSpinner";

interface Candidate {
  id: string;
  name: string;
  votes: number;
}

const LeaderSelection: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch candidates from the specific room
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

        // Check if the user has already voted in this room
        const user = auth.currentUser;
        if (user) {
          // Use getDoc instead of getDocs to fetch a single document
          const voteDocRef = doc(firestore, "rooms", roomId, "votes", user.uid);
          const voteDoc = await getDoc(voteDocRef);

          if (voteDoc.exists()) {
            setHasVoted(true);
          } else {
            setHasVoted(false);
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch room data.");
      }
      setLoading(false);
    };

    fetchData();
  }, [roomId]);

  const handleVote = async (candidateId: string) => {
    const user = auth.currentUser;
    if (!user) {
      alert("You need to be logged in to vote.");
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md w-full max-w-lg">
        <h2 className="mb-4 text-2xl font-bold text-center">
          Choose Your Leader
        </h2>
        {hasVoted ? (
          <p className="text-center text-green-500">
            You have already voted. Thank you!
          </p>
        ) : (
          <ul>
            {candidates.map((candidate) => (
              <li
                key={candidate.id}
                className="flex items-center justify-between p-2 border-b"
              >
                <span>{candidate.name}</span>
                <button
                  onClick={() => handleVote(candidate.id)}
                  disabled={voting}
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 disabled:opacity-50"
                >
                  {voting ? "Voting..." : "Vote"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LeaderSelection;
