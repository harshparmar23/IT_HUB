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

// Simple toast implementation
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

const API_URL =
  import.meta.env.VITE_API_URL || "https://it-hub-iota.vercel.app";

interface Paper {
  _id: string;
  name: string;
  description: string;
  year: number;
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

const Faculty_previous: React.FC = () => {
  const { userId, getToken } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fileUrl: "",
    courseId: "",
    year: "",
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

        // Fetch papers for this faculty
        if (facultyResponse.data.faculty._id) {
          fetchPapers(facultyResponse.data.faculty._id);
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

  // Fetch papers
  const fetchPapers = async (facultyId: string) => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${API_URL}/api/faculty/papers/${facultyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPapers(response.data.papers || []);
    } catch (error) {
      console.error("Error fetching papers:", error);
      toast.error("Failed to load papers");
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
      !formData.year ||
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

      // Then, save the paper metadata with the Cloudinary URL
      await axios.post(
        `${API_URL}/api/faculty/papers`,
        {
          facultyId: faculty._id,
          courseId: formData.courseId,
          name: formData.name,
          description: formData.description,
          year: Number.parseInt(formData.year.toString(), 10),
          fileUrl: uploadResponse.data.fileUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Previous year paper uploaded successfully");

      // Reset form
      setFormData({
        name: "",
        description: "",
        year: "",
        fileUrl: "",
        courseId: "",
      });
      setSelectedFile(null);

      // Refresh papers list
      fetchPapers(faculty._id);
    } catch (error) {
      console.error("Error uploading paper:", error);
      toast.error("Failed to upload paper");
    } finally {
      setUploading(false);
    }
  };

  // Handle paper deletion
  const handleDelete = async (paperId: string) => {
    if (!confirm("Are you sure you want to delete this paper?")) {
      return;
    }

    if (!faculty) {
      toast.error("Faculty information not available");
      return;
    }

    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/api/faculty/papers/${paperId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Paper deleted successfully");

      // Refresh papers list
      fetchPapers(faculty._id);
    } catch (error) {
      console.error("Error deleting paper:", error);
      toast.error("Failed to delete paper");
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
      <h1 className="text-2xl font-bold mb-6">Previous Year Papers</h1>

      {faculty && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload New Paper</CardTitle>
            <CardDescription>
              Upload previous year papers for any course
            </CardDescription>
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
                  htmlFor="year"
                  className="block text-sm font-medium mb-1"
                >
                  Year
                </label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="Enter year (e.g., 2023)"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Paper Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter paper name"
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
                  placeholder="Enter paper description"
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
                    Upload Paper
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Previous Year Papers</CardTitle>
          <CardDescription>
            Manage your uploaded previous year papers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {papers.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              No papers uploaded yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {papers.map((paper) => (
                  <TableRow key={paper._id}>
                    <TableCell>{paper.name}</TableCell>
                    <TableCell>{paper.description}</TableCell>
                    <TableCell>{paper.courseName}</TableCell>
                    <TableCell>{paper.year}</TableCell>
                    <TableCell>
                      {new Date(paper.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(paper.fileUrl, "_blank")}
                        >
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(paper._id)}
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

export default Faculty_previous;
