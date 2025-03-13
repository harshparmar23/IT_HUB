import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Loader2,
  Users,
  GraduationCap,
  FileText,
  BookOpen,
  User,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";

interface DashboardStats {
  students: number;
  faculty: number;
  materials: number;
  papers: number;
  courses: number;
}

const AdminDashboard = () => {
  const { isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    materials: 0,
    papers: 0,
    courses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = await getToken();

        // Fetch both user and stats data
        const [userResponse, statsResponse] = await Promise.all([
          fetch("http://localhost:5000/api/auth/get-user", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5000/api/stats/dashboard-stats", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const userData = await userResponse.json();
        const statsData = await statsResponse.json();

        setUser(userData.user);
        if (statsData.success) {
          setStats(statsData.stats);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) fetchUserData();
  }, [isSignedIn, getToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md">
          {user ? (
            <p className="font-medium">Welcome, {user.name}</p>
          ) : (
            <p>Loading user...</p>
          )}
        </div>
      </div>

      {/* Admin Profile Card */}
      {user && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Admin Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
                  {clerkUser?.imageUrl ? (
                    <img
                      src={clerkUser.imageUrl}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-blue-600" />
                  )}
                </div>
              </div>
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Full Name
                    </p>
                    <p className="font-medium">{user.name || "Not provided"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Email Address
                    </p>
                    <p className="font-medium">
                      {user.email || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Role
                    </p>
                    <p className="font-medium capitalize">
                      {user.role || "Admin"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Joined
                    </p>
                    <p className="font-medium">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not available"}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    As an administrator, you have full access to manage
                    students, faculty, courses, materials, and previous year
                    papers across the platform.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled in various courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Faculty Members
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.faculty}</div>
            <p className="text-xs text-muted-foreground">
              Teaching across departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Course Materials
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.materials}</div>
            <p className="text-xs text-muted-foreground">
              Uploaded learning resources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Previous Papers
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.papers}</div>
            <p className="text-xs text-muted-foreground">
              Past examination papers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">New Material Uploaded</p>
                  <p className="text-sm text-muted-foreground">
                    Prof. Johnson uploaded "Advanced Algorithms Notes"
                  </p>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  2 hours ago
                </div>
              </div>

              <div className="flex items-center gap-4 border-b pb-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">New Student Registered</p>
                  <p className="text-sm text-muted-foreground">
                    Sarah Parker joined Computer Science
                  </p>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  5 hours ago
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-2 rounded-full">
                  <BookOpen className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Previous Paper Added</p>
                  <p className="text-sm text-muted-foreground">
                    2023 Midterm Exam for Database Systems
                  </p>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  Yesterday
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current system performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">Server Uptime</p>
                  <p className="text-sm text-muted-foreground">99.9%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "99.9%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">Database Load</p>
                  <p className="text-sm text-muted-foreground">42%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "42%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">Storage Usage</p>
                  <p className="text-sm text-muted-foreground">68%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: "68%" }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
