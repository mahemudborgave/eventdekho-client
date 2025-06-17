// src/Dashboard.js
import React, { useState } from "react";
import AdminNavbar from "../../components/Dashboard/AdminNavbar";
import { Outlet } from "react-router-dom";

export default function AdminHome() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F5F6FA] text-[#232946]">
      <AdminNavbar onToggle={setIsSidebarCollapsed} />
      <div className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`}></div>
      <div className="flex-1 overflow-y-auto py-8 pr-4">
        <Outlet />
      </div>
    </div>
  );
}
