"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2, GraduationCap, Calendar, Mail, User } from "lucide-react";
import { toast } from "sonner";

interface Course {
  id: string;
  name: string;
  description: string;
}

interface Faculty {
  _id: string;
  name: string;
  email: string;
  profileImage: string;
  role: string;
  joinDate: string;
  courses: Course[];
}

const Faculty_profile: React.FC = () => {
  const { isSignedIn, getToken } = useAuth();
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateExperience = (joinDate: string): string => {
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years === 0) {
      return `${months} months`;
    } else if (months === 0) {
      return `${years} years`;
    } else {
      return `${years} years ${months} months`;
    }
  };

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/get-user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch faculty data");
        }

        const data = await response.json();
        setFaculty(data);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
        setError("Failed to load faculty data");
        toast.error("Failed to load faculty data");
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchFacultyData();
    }
  }, [isSignedIn]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !faculty) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error || "Faculty data not found"}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 bg-gradient-to-b from-blue-50 to-white">
          <CardHeader className="pb-0">
            <CardTitle className="text-2xl font-bold text-blue-600">
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <img
                  src={
                    faculty.profileImage || "https://via.placeholder.com/150"
                  }
                  alt={faculty.name}
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-100 shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2">
                  <User className="h-5 w-5" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  {faculty.name}
                </h2>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <p>{faculty.email}</p>
                </div>
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                  {faculty.role}
                </div>
              </div>
              <div className="w-full pt-4 border-t border-blue-100">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <p className="text-sm">
                      <span className="font-medium">Experience:</span>{" "}
                      {calculateExperience(faculty.joinDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <p className="text-sm">
                      <span className="font-medium">Joined:</span>{" "}
                      {new Date(faculty.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Section */}
        <Card className="md:col-span-2 bg-gradient-to-b from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-blue-600">
              <GraduationCap className="h-6 w-6" />
              Courses Teaching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faculty.courses.map((course) => (
                <div
                  key={course.id}
                  className="p-6 bg-white rounded-xl border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {course.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2">
                        {course.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {faculty.courses.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  No courses assigned yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Faculty_profile;
