"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2, Upload, Trash2 } from "lucide-react";

// Since react-hot-toast might not be installed, we'll create a simple toast implementation
const toast = {
  success: (message: string) => {
    console.log(`Success: ${message}`);
    alert(`Success: ${message}`);
  },
  error: (message: string) => {
    console.error(`Error: ${message}`);
    alert(`Error: ${message}`);
  },
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Material {
  _id: string;
  name: string;
  description: string;
  fileUrl: string;
  courseName: string;
  createdAt: string;
}

interface Faculty {
  _id: string;
  name: string;
  courses: {
    _id: string;
    name: string;
    description: string;
  }[];
}

interface Course {
  _id: string;
  name: string;
  description: string;
}

const Faculty_material: React.FC = () => {
  const { userId, getToken } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fileUrl: "",
    courseId: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch faculty data and all courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getToken();

        // Fetch faculty data
        const facultyResponse = await axios.get(
          `${API_URL}/api/faculty/profile/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFaculty(facultyResponse.data.faculty);

        // Fetch all courses
        const coursesResponse = await axios.get(`${API_URL}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(coursesResponse.data.courses || []);

        // Fetch materials for this faculty
        if (facultyResponse.data.faculty._id) {
          fetchMaterials(facultyResponse.data.faculty._id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, getToken]);

  // Fetch materials
  const fetchMaterials = async (facultyId: string) => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${API_URL}/api/faculty/materials/${facultyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMaterials(response.data.materials || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Failed to load materials");
    }
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle course selection
  const handleCourseChange = (courseId: string) => {
    setFormData((prev) => ({ ...prev, courseId }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // We'll upload the file when the form is submitted
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !selectedFile ||
      !formData.courseId
    ) {
      toast.error("Please fill all fields, select a course, and upload a file");
      return;
    }

    if (!faculty) {
      toast.error("Faculty information not available");
      return;
    }

    try {
      setUploading(true);
      const token = await getToken();

      // First, upload the file to Cloudinary via our backend
      const fileFormData = new FormData();
      fileFormData.append("file", selectedFile);

      const uploadResponse = await axios.post(
        `${API_URL}/api/upload`,
        fileFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Then, save the material metadata with the Cloudinary URL
      await axios.post(
        `${API_URL}/api/faculty/materials`,
        {
          facultyId: faculty._id,
          courseId: formData.courseId,
          name: formData.name,
          description: formData.description,
          fileUrl: uploadResponse.data.fileUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Material uploaded successfully");

      // Reset form
      setFormData({
        name: "",
        description: "",
        fileUrl: "",
        courseId: "",
      });
      setSelectedFile(null);

      // Refresh materials list
      fetchMaterials(faculty._id);
    } catch (error) {
      console.error("Error uploading material:", error);
      toast.error("Failed to upload material");
    } finally {
      setUploading(false);
    }
  };

  // Handle material deletion
  const handleDelete = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this material?")) {
      return;
    }

    if (!faculty) {
      toast.error("Faculty information not available");
      return;
    }

    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/api/faculty/materials/${materialId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Material deleted successfully");

      // Refresh materials list
      fetchMaterials(faculty._id);
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error("Failed to delete material");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Course Materials</h1>

      {faculty && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload New Material</CardTitle>
            <CardDescription>Upload materials for any course</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="courseId"
                  className="block text-sm font-medium mb-1"
                >
                  Select Course
                </label>
                <Select
                  value={formData.courseId}
                  onValueChange={handleCourseChange}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.length > 0 ? (
                      courses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No courses available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Material Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter material name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter material description"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="file"
                  className="block text-sm font-medium mb-1"
                >
                  Upload PDF
                </label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Material
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Materials</CardTitle>
          <CardDescription>
            Manage your uploaded course materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              No materials uploaded yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material._id}>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>{material.description}</TableCell>
                    <TableCell>{material.courseName}</TableCell>
                    <TableCell>
                      {new Date(material.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(material.fileUrl, "_blank")
                          }
                        >
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(material._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Faculty_material;
