// pages/register.tsx
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import Button from "../components/Button"; // shadcn Button
import Input from "../components/Input"; // shadcn Input
import { auth, database } from "@/firebase/firebase";

const Register = () => {
  const [nik, setNik] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save additional user info to Firestore
      await setDoc(doc(database, "users", user.uid), {
        nik,
        name,
        address,
      });

      router.push("/login");
    } catch (error) {
      console.error("Error registering:", error);
      alert(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="p-6 bg-white rounded shadow-md w-full max-w-md"
      >
        <h2 className="mb-4 text-2xl font-bold text-center">Register</h2>
        <div className="mb-4">
          <label className="block mb-1">NIK</label>
          <Input
            type="text"
            value={nik}
            onChange={(e) => setNik(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Name</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Home Address</label>
          <Input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Register
        </Button>
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500">
            Login
          </a>
        </p>
      </form>
    </div>
  );
};

export default Register;
