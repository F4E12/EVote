// components/AddCandidateForm.tsx
import React, { useState } from "react";
import { db, firestore } from "@/firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Input } from "./input";
import { Button } from "./button";

interface AddCandidateFormProps {
  roomId: string;
}

const AddCandidateForm: React.FC<AddCandidateFormProps> = ({ roomId }) => {
  const [candidateName, setCandidateName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!candidateName.trim()) {
      alert("Candidate name cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const candidatesCol = collection(
        firestore,
        "rooms",
        roomId,
        "candidates"
      );
      await addDoc(candidatesCol, {
        name: candidateName,
        votes: 0,
      });
      alert("Candidate added successfully!");
      setCandidateName("");
    } catch (error: any) {
      console.error("Error adding candidate:", error);
      alert("Failed to add candidate.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleAddCandidate} className="flex items-center space-x-2">
      <Input
        type="text"
        value={candidateName}
        onChange={(e) => setCandidateName(e.target.value)}
        required
        placeholder="Candidate Name"
        className="w-40"
      />
      <Button type="submit" disabled={loading} className="px-3 py-1">
        {loading ? "Adding..." : "Add"}
      </Button>
    </form>
  );
};

export default AddCandidateForm;
