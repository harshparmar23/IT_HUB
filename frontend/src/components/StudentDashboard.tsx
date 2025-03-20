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
  BookOpen,
  FileText,
  GraduationCap,
  Loader2,
  BarChart3,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://it-hub-iota.vercel.app";

interface EnrolledCourse {
  id: string;
  name: string;
  description: string;
}

interface Student {
  name: string;
  email: string;
  enrolledCourses: EnrolledCourse[];
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

interface CourseProgress {
  courseId: string;
  courseName: string;
  materialsCount: number;
  papersCount: number;
}

const StudentDashboard: React.FC = () => {
  const { userId, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<RecentMaterial[]>([]);
  const [recentPapers, setRecentPapers] = useState<RecentPaper[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = await getToken();

        const response = await axios.get(
          `${API_URL}/api/students/dashboard/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStudent(response.data.student);
        setRecentMaterials(response.data.recentMaterials);
        setRecentPapers(response.data.recentPapers);
        setCourseProgress(response.data.courseProgress);
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back,{" "}
          <span className="text-blue-600 dark:text-blue-400">
            {student?.name}
          </span>
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's what's happening with your courses
        </p>
      </div>

      {/* Enrolled Courses */}
      <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Enrolled Courses
              </CardTitle>
              <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                Courses you are currently enrolled in
              </CardDescription>
            </div>
            <GraduationCap className="h-8 w-8 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {student?.enrolledCourses.map((course) => (
              <Card
                key={course.id}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 
                         shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 
                         dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {course.name}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {course.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Progress */}
      <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Course Progress
              </CardTitle>
              <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                Available materials and papers for each course
              </CardDescription>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseProgress.map((progress) => (
              <Card
                key={progress.courseId}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 
                         shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 
                         dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {progress.courseName}
                  </CardTitle>
                  <CardDescription className="mt-4 space-y-3">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="flex items-center text-gray-700 dark:text-gray-300">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                        Materials
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {progress.materialsCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="flex items-center text-gray-700 dark:text-gray-300">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        Papers
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {progress.papersCount}
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Materials */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recent Materials
                </CardTitle>
                <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                  Latest materials for your courses
                </CardDescription>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentMaterials.map((material) => (
                <div
                  key={material._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 
                           rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {material.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {material.facultyName} - {material.courseName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(material.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Papers */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recent Papers
                </CardTitle>
                <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                  Latest papers for your courses
                </CardDescription>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentPapers.map((paper) => (
                <div
                  key={paper._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 
                           rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {paper.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {paper.facultyName} - {paper.courseName} ({paper.year})
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(paper.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
