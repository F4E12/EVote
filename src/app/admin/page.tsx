"use client";

import CreateRoomForm from "@/components/ui/createRoomForm";
import LogoutButton from "@/components/ui/logout";
import ManageRooms from "@/components/ui/manageRooms";
import React from "react";
import withAdmin from "../hooks/withAdmin";

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex justify-between items-center p-4 bg-gray-200">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <LogoutButton />
      </header>
      <main className="p-6">
        <CreateRoomForm />
        <ManageRooms />
      </main>
    </div>
  );
};

export default withAdmin(AdminDashboard);
