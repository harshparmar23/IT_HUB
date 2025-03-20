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

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/courses`
      );
      if (!response.ok) throw new Error("Failed to fetch courses");

      const data = await response.json();
      if (!Array.isArray(data.courses))
        throw new Error("Invalid response format");

      setCourses(data.courses);
      setFilteredCourses(data.courses);
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
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/courses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCourseName }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add course");

      alert("Course added successfully");
      setNewCourseName("");
      fetchCourses(); // Refresh course list
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Admin_Course;
