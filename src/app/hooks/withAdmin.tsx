"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db, firestore } from "@/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const withAdmin = (WrappedComponent: React.FC) => {
  const ComponentWithAdmin = (props: any) => {
    const [loading, setLoading] = useState(true);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
          router.push("/login"); // Redirect to login if not authenticated
          setLoading(false);
          return;
        }

        try {
          const userDocRef = doc(firestore, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAdminUser(true);
          } else {
            router.push("/vote"); // Redirect non-admin users
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          router.push("/vote"); // Redirect on error
        }

        setLoading(false);
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) {
      return <LoadingSpinner />;
    }

    if (!isAdminUser) {
      return null; // Redirecting...
    }

    return <WrappedComponent {...props} />;
  };

  ComponentWithAdmin.displayName = `WithAdmin(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithAdmin;
};

export default withAdmin;
