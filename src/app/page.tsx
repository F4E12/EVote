"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const Home: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/vote"); // Redirect to /vote if logged in
      } else {
        router.replace("/login"); // Redirect to /login if not logged in
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <LoadingSpinner />; // Show spinner while checking auth
};

export default Home;
