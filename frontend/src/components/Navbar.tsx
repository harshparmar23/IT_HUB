import { Link, NavLink, useNavigate } from "react-router-dom";
import { SignInButton, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

interface User {
  role: string;
}

const Navbar = () => {
  const { isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

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
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (isSignedIn) {
      fetchUserData();
    }
  }, [isSignedIn, getToken]);

  // Define navigation links based on user role
  const getNavLinks = () => {
    if (!user) return [];

    if (user.role === "student") {
      return [
        { name: "Dashboard", path: "/student-dashboard" },
        { name: "Materials", path: "/student-dashboard/material" },
        { name: "Previous Papers", path: "/student-dashboard/previous-papers" },
      ];
    } else if (user.role === "faculty") {
      return [
        { name: "Dashboard", path: "/faculty-dashboard" },
        { name: "Profile", path: "/faculty-dashboard/profile" },
        { name: "Materials", path: "/faculty-dashboard/material" },
        { name: "Previous Papers", path: "/faculty-dashboard/previous-papers" },
      ];
    } else if (user.role === "admin") {
      return [
        { name: "Dashboard", path: "/admin-dashboard" },
        { name: "Students", path: "/admin-dashboard/students" },
        { name: "Faculty", path: "/admin-dashboard/faculty" },
        { name: "Courses", path: "/admin-dashboard/courses" },
      ];
    }

    return [
      { name: "Dashboard", path: "/" },
      { name: "About Us", path: "/about" },
    ];
  };

  const navLinks = getNavLinks();

  const handleUserButtonClick = () => {
    if (user) {
      if (user.role === "student") {
        navigate("/student-dashboard/profile");
      } else if (user.role === "faculty") {
        navigate("/faculty-dashboard/profile");
      } else if (user.role === "admin") {
        navigate("/admin-dashboard");
      }
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md w-full fixed top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold hover:text-gray-300 transition"
        >
          IT Hub
        </Link>

        {/* Navigation Links */}
        {isSignedIn && (
          <ul className="flex space-x-4 md:space-x-8">
            {navLinks.map(({ name, path }) => (
              <li key={name}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `px-3 md:px-4 py-2 rounded-lg transition ${
                      isActive ? "bg-blue-500" : "hover:bg-blue-500"
                    }`
                  }
                >
                  {name}
                </NavLink>
              </li>
            ))}
          </ul>
        )}

        {/* Authentication Options */}
        <div className="flex items-center">
          {isSignedIn ? (
            <div className="flex items-center">
              <span className="mr-3 hidden md:inline-block">
                {clerkUser?.firstName}
              </span>
              <div onClick={handleUserButtonClick}>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition">
                Sign in
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
