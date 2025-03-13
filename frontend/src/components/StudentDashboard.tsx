import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2, BookOpen, FileText, User } from "lucide-react";

const StudentDashboard = () => {
  const { isSignedIn, getToken } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
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

        // Mock stats - in a real app, you would fetch these from your API
        setStats({
          materials: 24,
          papers: 18,
          courses: 5,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
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
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-2">Welcome to IT Hub</h2>
          <p className="opacity-90">
            Access course materials, previous year papers, and more from your
            student dashboard.
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Available Materials
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.materials}</div>
            <p className="text-xs text-muted-foreground">
              Course notes, slides, and resources
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Your Courses</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled courses this semester
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Frequently accessed resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="/student-dashboard/material"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="mr-3 bg-blue-100 p-2 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Course Materials</h3>
                <p className="text-sm text-muted-foreground">
                  Access lecture notes and resources
                </p>
              </div>
            </a>

            <a
              href="/student-dashboard/previous-papers"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="mr-3 bg-amber-100 p-2 rounded-full">
                <BookOpen className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium">Previous Year Papers</h3>
                <p className="text-sm text-muted-foreground">
                  Practice with past exams
                </p>
              </div>
            </a>

            <a
              href="/student-dashboard/profile"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="mr-3 bg-green-100 p-2 rounded-full">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Your Profile</h3>
                <p className="text-sm text-muted-foreground">
                  View and update your information
                </p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
