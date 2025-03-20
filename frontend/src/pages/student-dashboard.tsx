import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { User, FileText, BookOpen, Home, LogOut, Menu, X } from "lucide-react";

const StudentDashboard = () => {
  const { isSignedIn, getToken, signOut } = useAuth();
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          "http://localhost:5000/api/auth/get-user",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!data.user) {
          console.error("User not found");
          return;
        }

        setUser(data.user);

        // Redirect based on role
        if (data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.user.role === "faculty") {
          navigate("/faculty-dashboard");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (isSignedIn) fetchUserData();
  }, [isSignedIn, getToken, navigate]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-md"
        onClick={toggleMobileMenu}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white border-r border-gray-200 shadow-sm h-screen p-6 fixed left-0 top-0 z-40 md:z-auto`}
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-blue-600 p-2 rounded-md">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Student Portal</h2>
        </div>

        <nav className="space-y-1">
          <Link
            to="/student-dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive("/student-dashboard") &&
              !isActive("/student-dashboard/profile") &&
              !isActive("/student-dashboard/material") &&
              !isActive("/student-dashboard/previous-papers")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link
            to="/student-dashboard/profile"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive("/student-dashboard/profile")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
          <Link
            to="/student-dashboard/material"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive("/student-dashboard/material")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <FileText className="h-5 w-5" />
            <span>Material</span>
          </Link>
          <Link
            to="/student-dashboard/previous-papers"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive("/student-dashboard/previous-papers")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <BookOpen className="h-5 w-5" />
            <span>Previous Papers</span>
          </Link>

          <button
            onClick={() => {
              signOut();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2 text-red-600 rounded-md hover:bg-red-50 w-full text-left mt-8 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {user && (
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                Welcome, {user.name}
              </h1>
              <p className="text-gray-600">Role: Student</p>
            </div>
          )}
          <Outlet /> {/* This renders the selected page */}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
