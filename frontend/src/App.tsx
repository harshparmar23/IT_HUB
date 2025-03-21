import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
// import Chat from "./pages/Chat";
import PreviousPapers from "./pages/PreviousPapers";
import Material from "./pages/Material";
import About from "./pages/About";
import AdminDashboard from "./components/AdminDashboard";
import Admin_Student from "./components/Admin_Student";
import Admin_Faculty from "./components/Admin_Faculty";
import Admin_Material from "./components/Admin_Material";
import Admin_PYP from "./components/Admin_PYP";
import Admin_Course from "./components/Admin_Course";
import Faculty_profile from "./components/Faculty_profile";
import Faculty_material from "./components/Faculty_material";
import Faculty_pervious from "./components/Faculty_previous";
// import Faculty_chat from "./components/Faculty_chat";
import Student_Material from "./components/Student_Material";
import Student_PreviousPapers from "./components/Student_PreviousPapers";
import Student_Profile from "./components/Student_Profile";
import StudentDashboardPage from "./pages/student-dashboard";
import FacultyDashboardPage from "./pages/faculty-dashboard";
// import StudentDashboardHome from "./components/StudentDashboard";
import FacultyDashboardHome from "./components/FacultyDashboard";
import AdminLayout from "./pages/admin-dashboard";
import SignInPage from "./components/SignInPage";
import axiosInstance from "./config/axios";
import { API_ENDPOINTS } from "./config/api";

// Define User Type
interface User {
  name: string;
  email: string;
  role: "student" | "admin" | "faculty";
}

function App() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error("No authentication token available");
        }

        // Get user data from Clerk
        const userData = await window.Clerk?.user;
        if (!userData) {
          throw new Error("No user data available");
        }

        // Send the token and user data to backend
        const response = await axiosInstance.post(API_ENDPOINTS.auth.login, {
          token,
          userData: {
            clerkId: userData.id,
            email: userData.primaryEmailAddress?.emailAddress,
            name: `${userData.firstName} ${userData.lastName}`,
          },
        });

        if (response.status === 200) {
          setUser(response.data.user);
        } else {
          throw new Error(response.data.message || "Authentication failed");
        }
      } catch (error) {
        console.error("Error authenticating user:", error);
        setError(
          error instanceof Error ? error.message : "Authentication failed"
        );
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      authenticateUser();
    } else {
      setLoading(false);
      setUser(null);
    }
  }, [isSignedIn, getToken]);

  // Show loading while checking authentication
  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  // Show error if authentication failed
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 text-xl mb-4">Authentication Error</div>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <Router>
      <MainLayout user={user} />
    </Router>
  );
}

// Role-based route protection component
const ProtectedRoute = ({
  children,
  user,
  allowedRoles,
}: {
  children: React.ReactElement;
  user: User | null;
  allowedRoles: string[];
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "faculty") {
        navigate("/faculty-dashboard");
      } else if (user.role === "student") {
        navigate("/student-dashboard");
      }
    }
  }, [user, allowedRoles, navigate]);

  if (!user) {
    return <Navigate to="/sign-in" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return null; // Render nothing while redirecting
  }

  return children;
};

const MainLayout = ({ user }: { user: User | null }) => {
  const location = useLocation();
  const shouldHideNavbar =
    location.pathname.startsWith("/admin-dashboard") ||
    location.pathname.startsWith("/faculty-dashboard") ||
    location.pathname.startsWith("/student-dashboard") ||
    location.pathname.startsWith("/");

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHideNavbar && <Navbar />}
      <main className="flex-grow p-6 pt-16 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                user ? (
                  user.role === "admin" ? (
                    <Navigate to="/admin-dashboard" replace />
                  ) : user.role === "faculty" ? (
                    <Navigate to="/faculty-dashboard" replace />
                  ) : (
                    <Navigate to="/student-dashboard" replace />
                  )
                ) : (
                  <Navigate to="/sign-in" replace />
                )
              }
            />

            <Route
              path="/admin-dashboard/*"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<Admin_Student />} />
              <Route path="faculty" element={<Admin_Faculty />} />
              <Route path="material" element={<Admin_Material />} />
              <Route path="previous-papers" element={<Admin_PYP />} />
              <Route path="courses" element={<Admin_Course />} />
            </Route>

            <Route
              path="/student-dashboard/*"
              element={
                <ProtectedRoute user={user} allowedRoles={["student"]}>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<Student_Profile />} />
              <Route path="profile" element={<Student_Profile />} />
              <Route path="material" element={<Student_Material />} />
              <Route
                path="previous-papers"
                element={<Student_PreviousPapers />}
              />
            </Route>

            <Route
              path="/faculty-dashboard/*"
              element={
                <ProtectedRoute user={user} allowedRoles={["faculty"]}>
                  <FacultyDashboardPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<FacultyDashboardHome />} />
              <Route path="profile" element={<Faculty_profile />} />
              <Route path="material" element={<Faculty_material />} />
              <Route path="previous-papers" element={<Faculty_pervious />} />
              {/* <Route path="chat" element={<Faculty_chat />} /> */}
            </Route>

            {/* <Route
              path="/chat"
              element={user ? <Chat /> : <Navigate to="/sign-in" replace />}
            /> */}
            <Route
              path="/previous-papers"
              element={
                user ? <PreviousPapers /> : <Navigate to="/sign-in" replace />
              }
            />
            <Route
              path="/material"
              element={user ? <Material /> : <Navigate to="/sign-in" replace />}
            />
            <Route
              path="/about"
              element={user ? <About /> : <Navigate to="/sign-in" replace />}
            />

            <Route
              path="/sign-in"
              element={
                user ? (
                  <Navigate to={`/${user.role}-dashboard`} replace />
                ) : (
                  <SignInPage />
                )
              }
            />

            <Route
              path="*"
              element={
                user ? (
                  <Navigate
                    to={
                      user.role === "admin"
                        ? "/admin-dashboard"
                        : user.role === "faculty"
                        ? "/faculty-dashboard"
                        : "/student-dashboard"
                    }
                    replace
                  />
                ) : (
                  <Navigate to="/sign-in" replace />
                )
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;
