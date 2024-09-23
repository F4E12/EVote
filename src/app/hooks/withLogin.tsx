// hoc/withLogin.tsx
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

const withLogin = (WrappedComponent: React.FC) => {
  const ComponentWithLogin = (props: any) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          router.push("/vote"); // Redirect to /vote if already logged in
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (user) {
      return null; // User is authenticated, redirection handled above
    }

    return <WrappedComponent {...props} />;
  };

  ComponentWithLogin.displayName = `WithLogin(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithLogin;
};

export default withLogin;
