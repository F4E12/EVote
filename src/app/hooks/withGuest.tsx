// hoc/withGuest.tsx
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

const withGuest = (WrappedComponent: React.FC) => {
  const ComponentWithGuest = (props: any) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (!currentUser) {
          router.push("/login"); // Redirect to /login if not logged in
        } else {
          setUser(currentUser);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return null; // Redirection handled above
    }

    return <WrappedComponent {...props} />;
  };

  ComponentWithGuest.displayName = `WithGuest(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithGuest;
};

export default withGuest;
