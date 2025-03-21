"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BookOpen, FileText, GraduationCap, Loader2 } from "lucide-react";
import axiosInstance from "../config/axios";
import { API_ENDPOINTS } from "../config/api";

interface Course {
  _id: string;
  name: string;
  description: string;
}

interface FacultyProfile {
  _id: string;
  name: string;
  email: string;
  profileImage: string;
  role: string;
  courses: Course[];
  experience: number;
  materialsCount: number;
  papersCount: number;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

const Faculty_profile = () => {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          API_ENDPOINTS.faculty.profile(userId || "")
        );

        if (!response.data.faculty) {
          throw new Error("Invalid response format");
        }

        setProfile(response.data.faculty);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Notice:</strong>
        <span className="block sm:inline"> Profile information not found.</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Profile Header */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-blue-100">
            <img
              src={profile.profileImage || "https://via.placeholder.com/128"}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {profile.name}
            </h1>
            <p className="text-gray-600 mb-4">{profile.email}</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Badge>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {formatExperience(profile.joinDate)} Experience
              </Badge>
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-800"
              >
                Joined {new Date(profile.joinDate).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">
              Materials Uploaded
            </CardTitle>
            <BookOpen className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {profile.materialsCount}
            </div>
            <p className="text-xs text-gray-600">Total course materials</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">
              Previous Papers
            </CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {profile.papersCount}
            </div>
            <p className="text-xs text-gray-600">Total previous year papers</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">
              Assigned Courses
            </CardTitle>
            <GraduationCap className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {profile.courses.length}
            </div>
            <p className="text-xs text-gray-600">Currently teaching</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            Assigned Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.courses && profile.courses.length > 0 ? (
              profile.courses.map((course) => (
                <div
                  key={course._id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <h3 className="font-semibold text-gray-900">{course.name}</h3>
                  {course.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {course.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600 col-span-2 text-center py-4">
                No courses assigned yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="mt-6 text-sm text-gray-600 text-center">
        <p>Member since {new Date(profile.joinDate).toLocaleDateString()}</p>
        <p>Last updated {new Date(profile.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default Faculty_profile;
