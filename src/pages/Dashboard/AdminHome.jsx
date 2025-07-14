// src/Dashboard.js
import React, { useState } from "react";
import AdminNavbar from "../../components/Dashboard/AdminNavbar";
import { Outlet } from "react-router-dom";
import ScrollToTop from "../../components/ScrollToTop";
import { ThemeProvider } from '../../components/ui/ThemeProvider';

export default function AdminHome() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <AdminNavbar onToggle={setIsSidebarCollapsed} />
        <div className={`${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} transition-all duration-300 h-10 md:h-auto`}></div>
        <div className="flex-1 overflow-y-auto pt-10 lg:pt-0">
          <Outlet />
          <ScrollToTop />
        </div>
      </div>
    </ThemeProvider>
  );
}
