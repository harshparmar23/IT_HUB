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
  Clock,
  GraduationCap,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Faculty {
  _id: string;
  name: string;
  email: string;
  joinDate: string;
  courses: {
    _id: string;
    name: string;
    description: string;
  }[];
}

interface Material {
  _id: string;
  name: string;
  courseName: string;
  createdAt: string;
}

interface Paper {
  _id: string;
  name: string;
  courseName: string;
  year: number;
  createdAt: string;
}

interface DashboardStats {
  totalMaterials: number;
  totalPapers: number;
  totalCourses: number;
}

const Faculty_Dashboard: React.FC = () => {
  const { userId, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalMaterials: 0,
    totalPapers: 0,
    totalCourses: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = await getToken();

        const response = await axios.get(
          `${API_URL}/api/faculty/dashboard/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setFaculty(response.data.faculty);
        setMaterials(response.data.materials || []);
        setPapers(response.data.papers || []);
        setStats(response.data.stats);
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

  const formatExperience = (joinDate: string) => {
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = diffDays / 365;

    if (diffYears < 1) {
      return "Less than a year";
    }
    return `${Math.floor(diffYears)} ${
      Math.floor(diffYears) === 1 ? "year" : "years"
    }`;
  };

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
            {faculty?.name}
          </span>
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's an overview of your teaching activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
              Your Materials
            </CardTitle>
            <BookOpen className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalMaterials}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Total materials uploaded
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
              Previous Papers
            </CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalPapers}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Total papers uploaded
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
              Experience
            </CardTitle>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {faculty?.joinDate ? formatExperience(faculty.joinDate) : "N/A"}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Years of teaching experience
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
              Teaching Courses
            </CardTitle>
            <GraduationCap className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalCourses}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Currently assigned courses
            </p>
          </CardContent>
        </Card>
      </div>

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
                  Your latest uploaded materials
                </CardDescription>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {materials.map((material) => (
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
                      {material.courseName}
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
                  Your latest uploaded papers
                </CardDescription>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {papers.map((paper) => (
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
                      {paper.courseName} ({paper.year})
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

export default Faculty_Dashboard;
