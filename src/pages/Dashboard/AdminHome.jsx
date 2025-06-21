// src/Dashboard.js
import React, { useState } from "react";
import AdminNavbar from "../../components/Dashboard/AdminNavbar";
import { Outlet } from "react-router-dom";

export default function AdminHome() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F5F6FA] text-[#232946]">
      <AdminNavbar onToggle={setIsSidebarCollapsed} />
      <div className={`${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} transition-all duration-300 h-10 md:h-auto`}></div>
      <div className="flex-1 overflow-y-auto py-8 lg:pr-4 px-3">
        <Outlet />
      </div>
    </div>
  );
}
