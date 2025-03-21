import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { toast } from "sonner";

interface Course {
  _id: string;
  name: string;
  description: string;
}

const Admin_Course: React.FC = () => {
  const { isSignedIn, getToken } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({ name: "", description: "" });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchCourses();
    }
  }, [isSignedIn]);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/courses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newCourse),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add course");
      }

      const data = await response.json();
      setCourses([...courses, data]);
      setNewCourse({ name: "", description: "" });
      toast.success("Course added successfully");
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add course"
      );
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/courses/${editingCourse._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingCourse),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update course");
      }

      const updatedCourse = await response.json();
      setCourses(
        courses.map((course) =>
          course._id === updatedCourse._id ? updatedCourse : course
        )
      );
      setIsEditDialogOpen(false);
      setEditingCourse(null);
      toast.success("Course updated successfully");
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update course"
      );
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/courses/${courseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete course");
      }

      setCourses(courses.filter((course) => course._id !== courseId));
      toast.success("Course deleted successfully");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete course"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add Course Form */}
          <form onSubmit={handleAddCourse} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Course Name"
                  value={newCourse.name}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Course Description"
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <Button type="submit" className="mt-4">
              Add Course
            </Button>
          </form>

          {/* Courses List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card key={course._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{course.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {course.description}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog
                        open={
                          isEditDialogOpen && editingCourse?._id === course._id
                        }
                        onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) setEditingCourse(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingCourse(course);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Course</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleEditCourse}
                            className="space-y-4"
                          >
                            <div>
                              <Input
                                placeholder="Course Name"
                                value={editingCourse?.name || ""}
                                onChange={(e) =>
                                  setEditingCourse({
                                    ...editingCourse!,
                                    name: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div>
                              <Textarea
                                placeholder="Course Description"
                                value={editingCourse?.description || ""}
                                onChange={(e) =>
                                  setEditingCourse({
                                    ...editingCourse!,
                                    description: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsEditDialogOpen(false);
                                  setEditingCourse(null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="submit">Save Changes</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCourse(course._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin_Course;
