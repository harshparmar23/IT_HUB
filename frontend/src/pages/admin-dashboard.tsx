// import { useEffect, useState } from "react";
// import { useAuth } from "@clerk/clerk-react";
// import { useNavigate, Link, Outlet } from "react-router-dom";

import { Link, Outlet } from "react-router-dom";
import {
  Users,
  GraduationCap,
  FileText,
  BookOpen,
  Layers,
  Home,
  LogOut,
} from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

const AdminLayout = () => {
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm h-screen p-6 fixed left-0 top-0">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-blue-600 p-2 rounded-md">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">IT Hub Admin</h2>
        </div>

        <nav className="space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link
            to="/admin-dashboard/students"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Users className="h-5 w-5" />
            <span>Students</span>
          </Link>
          <Link
            to="/admin-dashboard/faculty"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <GraduationCap className="h-5 w-5" />
            <span>Faculty</span>
          </Link>
          <Link
            to="/admin-dashboard/material"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <FileText className="h-5 w-5" />
            <span>Material</span>
          </Link>
          <Link
            to="/admin-dashboard/previous-papers"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <BookOpen className="h-5 w-5" />
            <span>Previous Papers</span>
          </Link>
          <Link
            to="/admin-dashboard/courses"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Layers className="h-5 w-5" />
            <span>Courses</span>
          </Link>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2 text-red-600 rounded-md hover:bg-red-50 w-full text-left mt-8 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Outlet /> {/* This renders the selected page */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
