import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-app-bg">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}