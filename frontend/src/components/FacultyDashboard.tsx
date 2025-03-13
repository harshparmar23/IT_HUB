import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Loader2,
  BookOpen,
  FileText,
  User,
  GraduationCap,
  MessageSquare,
} from "lucide-react";

interface FacultyProfile {
  _id: string;
  name: string;
  email: string;
  profileImage: string;
  role: string;
  courseName: string;
  experience: number;
  createdAt: string;
  updatedAt: string;
}

const FacultyDashboard = () => {
  const { isSignedIn, getToken, userId } = useAuth();
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [stats, setStats] = useState({
    materials: 0,
    papers: 0,
    students: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getToken();

        // Fetch faculty profile
        const response = await fetch(
          `http://localhost:5000/api/faculty/profile/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.faculty) {
          setProfile(data.faculty);
        }

        // Mock stats - in a real app, you would fetch these from your API
        setStats({
          materials: 12,
          papers: 8,
          students: 45,
        });
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn && userId) fetchData();
  }, [isSignedIn, getToken, userId]);

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
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-2">Welcome to Faculty Portal</h2>
          <p className="opacity-90">
            Manage your course materials, upload previous year papers, and
            interact with students.
          </p>
          {profile && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="font-medium">
                You are teaching: {profile.courseName || "Not assigned yet"}
              </p>
              <p className="text-sm opacity-90">
                Experience: {profile.experience} years
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Your Materials
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.materials}</div>
            <p className="text-xs text-muted-foreground">
              Course notes and resources uploaded
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
              Past examination papers shared
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
            <p className="text-xs text-muted-foreground">
              Students enrolled in your course
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used faculty tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="/faculty-dashboard/material"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="mr-3 bg-blue-100 p-2 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Upload Materials</h3>
                <p className="text-sm text-muted-foreground">
                  Share course notes and resources
                </p>
              </div>
            </a>

            <a
              href="/faculty-dashboard/previous-papers"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="mr-3 bg-amber-100 p-2 rounded-full">
                <BookOpen className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium">Upload Previous Papers</h3>
                <p className="text-sm text-muted-foreground">
                  Share past examination papers
                </p>
              </div>
            </a>

            <a
              href="/faculty-dashboard/profile"
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

            <a
              href="/faculty-dashboard/chat"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="mr-3 bg-purple-100 p-2 rounded-full">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Student Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Communicate with your students
                </p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyDashboard;
