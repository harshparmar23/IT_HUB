import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalMaterials: number;
  totalPapers: number;
}

interface RecentFaculty {
  _id: string;
  name: string;
  email: string;
  courses: string;
  createdAt: string;
}

interface RecentMaterial {
  _id: string;
  name: string;
  facultyName: string;
  courseName: string;
  createdAt: string;
}

interface RecentPaper {
  _id: string;
  name: string;
  facultyName: string;
  courseName: string;
  year: number;
  createdAt: string;
}

interface CourseDistribution {
  _id: string;
  name: string;
  facultyCount: number;
}

const AdminDashboard: React.FC = () => {
  const { userId, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalMaterials: 0,
    totalPapers: 0,
  });
  const [recentFaculty, setRecentFaculty] = useState<RecentFaculty[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<RecentMaterial[]>([]);
  const [recentPapers, setRecentPapers] = useState<RecentPaper[]>([]);
  const [courseDistribution, setCourseDistribution] = useState<
    CourseDistribution[]
  >([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = await getToken();

        const response = await axios.get(`${API_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats(response.data.stats);
        setRecentFaculty(response.data.recentFaculty);
        setRecentMaterials(response.data.recentMaterials);
        setRecentPapers(response.data.recentPapers);
        setCourseDistribution(response.data.courseDistribution);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDashboardData();
    }
  }, [userId, getToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFaculty}</div>
            <p className="text-xs text-muted-foreground">Teaching faculty</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Available courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Materials
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials}</div>
            <p className="text-xs text-muted-foreground">Uploaded materials</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPapers}</div>
            <p className="text-xs text-muted-foreground">
              Previous year papers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Recent Faculty */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Faculty</CardTitle>
            <CardDescription>Latest registered faculty members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFaculty.map((faculty) => (
                <div
                  key={faculty._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{faculty.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {faculty.courses}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(faculty.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Materials */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Materials</CardTitle>
            <CardDescription>Latest uploaded materials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMaterials.map((material) => (
                <div
                  key={material._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{material.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {material.facultyName} - {material.courseName}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(material.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Papers */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Papers</CardTitle>
            <CardDescription>Latest uploaded papers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPapers.map((paper) => (
                <div
                  key={paper._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{paper.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {paper.facultyName} - {paper.courseName} ({paper.year})
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(paper.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Distribution */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Course Distribution</CardTitle>
          <CardDescription>
            Number of faculty members per course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courseDistribution.map((course) => (
              <div
                key={course._id}
                className="flex items-center justify-between"
              >
                <p className="text-sm font-medium">{course.name}</p>
                <p className="text-sm text-muted-foreground">
                  {course.facultyCount} faculty members
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
