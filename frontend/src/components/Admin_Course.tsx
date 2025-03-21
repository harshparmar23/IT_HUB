import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import axiosInstance from "../config/axios";
import { API_ENDPOINTS } from "../config/api";

interface Course {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const Admin_Course = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newCourseName, setNewCourseName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editCourseName, setEditCourseName] = useState<string>("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.courses.list);
      if (!response.data.courses) throw new Error("Invalid response format");

      setCourses(response.data.courses);
      setFilteredCourses(response.data.courses);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = courses.filter((course) =>
      course.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [search, courses]);

  const handleAddCourse = async () => {
    if (!newCourseName.trim()) return alert("Course name is required");

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.courses.create, {
        name: newCourseName,
      });

      if (response.status === 201) {
        alert("Course added successfully");
        setNewCourseName("");
        fetchCourses(); // Refresh course list
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCourse = async () => {
    if (!selectedCourse || !editCourseName.trim()) return;

    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.courses.update(selectedCourse._id),
        { name: editCourseName }
      );

      if (response.status === 200) {
        alert("Course updated successfully");
        setEditDialogOpen(false);
        setSelectedCourse(null);
        fetchCourses(); // Refresh course list
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update course");
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.courses.delete(selectedCourse._id)
      );

      if (response.status === 200) {
        alert("Course deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedCourse(null);
        fetchCourses(); // Refresh course list
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete course");
    }
  };

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setEditCourseName(course.name);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (course: Course) => {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Courses</h1>

      {/* Search Bar & Add Course Button */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2"
        />
        {/* Add Course Button with Modal */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white">Add Course</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
            </DialogHeader>
            <Input
              type="text"
              placeholder="Enter course name"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              className="mb-4"
            />
            <Button
              className="w-full bg-blue-600 text-white"
              onClick={handleAddCourse}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Course"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {loading && <p className="text-gray-500">Loading courses...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && filteredCourses.length === 0 && (
        <p className="text-gray-600">No courses found.</p>
      )}

      {!loading && !error && filteredCourses.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/5">Course ID</TableHead>
                <TableHead className="w-2/5">Course Name</TableHead>
                <TableHead className="w-1/5">Created At</TableHead>
                <TableHead className="w-1/5">Updated At</TableHead>
                <TableHead className="w-1/5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell>{course._id}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>
                    {new Date(course.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(course.updatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(course)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(course)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Course Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter course name"
            value={editCourseName}
            onChange={(e) => setEditCourseName(e.target.value)}
            className="mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white"
              onClick={handleEditCourse}
            >
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
          </DialogHeader>
          <p className="mb-4">
            Are you sure you want to delete the course "{selectedCourse?.name}"?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin_Course;
