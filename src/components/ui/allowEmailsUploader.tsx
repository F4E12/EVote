// components/AllowedEmailsUploader.tsx
import React, { useState } from "react";
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import { db, firestore } from "@/firebase/firebase";
import { Button } from "./button";

interface AllowedEmailsUploaderProps {
  roomId: string;
}

const AllowedEmailsUploader: React.FC<AllowedEmailsUploaderProps> = ({
  roomId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Function to parse and validate emails from the txt file
  const parseEmails = (text: string): string[] => {
    const lines = text.split("\n");
    const emails: string[] = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    lines.forEach((line) => {
      const email = line.trim();
      if (email && emailRegex.test(email)) {
        emails.push(email.toLowerCase()); // Store emails in lowercase for consistency
      }
    });

    return emails;
  };

  // Function to handle the upload process
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a .txt file to upload.");
      return;
    }

    if (file.type !== "text/plain") {
      alert("Invalid file type. Please upload a .txt file.");
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const content = event.target?.result;
        if (typeof content !== "string") {
          alert("Failed to read the file content.");
          setUploading(false);
          return;
        }

        const emails = parseEmails(content);
        if (emails.length === 0) {
          alert("No valid email addresses found in the file.");
          setUploading(false);
          return;
        }

        // Update the room's allowedEmails field
        const roomDocRef = doc(firestore, "rooms", roomId);
        const roomDoc = await getDoc(roomDocRef);

        if (roomDoc.exists()) {
          // Overwrite the allowedEmails array with the new list
          await updateDoc(roomDocRef, {
            allowedEmails: emails,
          });
          alert("Allowed emails updated successfully!");
        } else {
          alert("Room does not exist.");
        }

        setFile(null); // Reset the file input
        setUploading(false);
      };

      reader.onerror = () => {
        alert("Failed to read the file. Please try again.");
        setUploading(false);
      };

      reader.readAsText(file);
    } catch (error: any) {
      console.error("Error uploading allowed emails:", error);
      alert("Failed to upload allowed emails. Please try again.");
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-2">
      <label className="block mb-1">Upload Allowed Emails (.txt)</label>
      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="mb-2"
      />
      <Button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? "Uploading..." : "Upload Emails"}
      </Button>
    </div>
  );
};

export default AllowedEmailsUploader;
