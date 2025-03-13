"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface Faculty {
  _id: string;
  email: string;
  name?: string;
  profileImage?: string;
  experience: number;
  courseName: string;
  joinDate?: string; // Changed from createdAt to joinDate
}

interface Course {
  _id: string;
  name: string;
}

const Admin_Faculty = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [newJoinDate, setNewJoinDate] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);

  // Edit faculty state
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [editCourseId, setEditCourseId] = useState<string>("");
  const [editJoinDate, setEditJoinDate] = useState<string>("");

  useEffect(() => {
    fetchFaculty();
    fetchCourses();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/faculty");
      if (!response.ok) throw new Error("Failed to fetch faculty members");

      const data = await response.json();

      // Make sure each faculty object has the joinDate field
      const facultyWithDates = data.faculty.map((fac: any) => ({
        ...fac,
        joinDate: fac.joinDate || fac.createdAt || new Date().toISOString(),
      }));

      setFaculty(facultyWithDates);
      setFilteredFaculty(facultyWithDates);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = faculty.filter((fac) =>
      fac.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredFaculty(filtered);
  }, [search, faculty]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");

      const data = await response.json();
      setCourses(data.courses);
    } catch (err: any) {
      console.error(err);
    }
  };

  const addFaculty = async () => {
    if (!email.trim() || !selectedCourse) {
      alert("Email and course selection are required");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          courseId: selectedCourse,
          joinDate: newJoinDate || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to add faculty");

      setFaculty([...faculty, data.faculty]);
      setFilteredFaculty([...faculty, data.faculty]);
      setEmail("");
      setSelectedCourse("");
      setNewJoinDate("");
      setOpen(false);
      alert("Faculty member added successfully!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const deleteFaculty = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this faculty member?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/faculty/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete faculty member");

      setFaculty(faculty.filter((fac) => fac._id !== id));
      setFilteredFaculty(filteredFaculty.filter((fac) => fac._id !== id));
      alert("Faculty member deleted successfully!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const openEditDialog = (fac: Faculty) => {
    setSelectedFaculty(fac);
    // Find the current course ID
    const currentCourse = courses.find(
      (course) => course.name === fac.courseName
    );
    setEditCourseId(currentCourse?._id || "");

    // Format the date for the input (YYYY-MM-DD)
    const joinDate = new Date(fac.joinDate || Date.now());
    const formattedDate = joinDate.toISOString().split("T")[0];
    setEditJoinDate(formattedDate);

    setEditDialogOpen(true);
  };

  const updateFaculty = async () => {
    if (!selectedFaculty) return;

    // Validate that at least one field is changed
    if (!editCourseId && !editJoinDate) {
      alert("Please change either the course or the join date");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/faculty/${selectedFaculty._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: editCourseId || undefined,
            joinDate: editJoinDate || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update faculty");
      }

      // Update the faculty list with the updated faculty
      const updatedFacultyList = faculty.map((fac) =>
        fac._id === selectedFaculty._id ? data.faculty : fac
      );

      setFaculty(updatedFacultyList);
      setFilteredFaculty(updatedFacultyList);
      setEditDialogOpen(false);
      setSelectedFaculty(null);
      alert("Faculty updated successfully!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Faculty Members</h1>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Input
            type="text"
            placeholder="Search faculty by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-colors px-4 py-2 rounded-md">
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Faculty
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-blue-600">
                Add Faculty Member
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faculty Email
                </label>
                <Input
                  type="email"
                  placeholder="Enter email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Course
                </label>
                <Select
                  value={selectedCourse}
                  onValueChange={(value) => setSelectedCourse(value)}
                >
                  <SelectTrigger className="w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Join Date{" "}
                  <span className="text-xs text-gray-500">
                    (affects experience calculation)
                  </span>
                </label>
                <Input
                  type="date"
                  value={newJoinDate}
                  onChange={(e) => setNewJoinDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If not specified, today's date will be used.
                </p>
              </div>

              <div className="flex space-x-3 pt-3">
                <Button
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addFaculty}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Faculty
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md"
          role="alert"
        >
          <div className="flex items-center">
            <svg
              className="h-6 w-6 text-red-500 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="font-medium">Error: {error}</p>
          </div>
        </div>
      )}

      {!loading && !error && filteredFaculty.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-md">
          <div className="flex items-center">
            <svg
              className="h-6 w-6 text-yellow-400 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-yellow-700 font-medium">
              No faculty members found.
            </p>
          </div>
        </div>
      )}

      {/* Edit Faculty Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-600">
              Edit Faculty Member
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Faculty Email
              </label>
              <p className="text-gray-800 font-medium">
                {selectedFaculty?.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Course
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Current course:{" "}
                <span className="font-medium text-gray-700">
                  {selectedFaculty?.courseName || "Not Assigned"}
                </span>
              </p>
              <Select
                value={editCourseId}
                onValueChange={(value) => setEditCourseId(value)}
              >
                <SelectTrigger className="w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Join Date{" "}
                <span className="text-xs text-gray-500">
                  (affects experience calculation)
                </span>
              </label>
              <Input
                type="date"
                value={editJoinDate}
                onChange={(e) => setEditJoinDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current join date:{" "}
                {selectedFaculty
                  ? new Date(
                      selectedFaculty.joinDate || ""
                    ).toLocaleDateString()
                  : ""}
              </p>
            </div>

            <div className="flex space-x-3 pt-3">
              <Button
                onClick={() => setEditDialogOpen(false)}
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={updateFaculty}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                Update Faculty
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {!loading && !error && filteredFaculty.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-1/6 py-3 px-4 text-gray-700">
                  Faculty ID
                </TableHead>
                <TableHead className="w-1/5 py-3 px-4 text-gray-700">
                  Email
                </TableHead>
                <TableHead className="w-1/5 py-3 px-4 text-gray-700">
                  Name
                </TableHead>
                <TableHead className="w-1/6 py-3 px-4 text-gray-700">
                  Experience
                </TableHead>
                <TableHead className="w-1/6 py-3 px-4 text-gray-700">
                  Course
                </TableHead>
                <TableHead className="w-1/6 py-3 px-4 text-gray-700">
                  Join Date
                </TableHead>
                <TableHead className="w-1/6 py-3 px-4 text-gray-700">
                  Profile
                </TableHead>
                <TableHead className="w-1/6 py-3 px-4 text-gray-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculty.map((fac) => (
                <TableRow
                  key={fac._id}
                  className="hover:bg-gray-50 border-t border-gray-200"
                >
                  <TableCell className="py-3 px-4 text-sm text-gray-500">
                    {fac._id}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm font-medium">
                    {fac.email}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm">
                    {fac.name || "N/A"}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {fac.experience} years
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {fac.courseName}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm">
                    {new Date(fac.joinDate || "").toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {fac.profileImage ? (
                      <img
                        src={fac.profileImage}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <span className="text-xs">No Image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                        onClick={() => openEditDialog(fac)}
                      >
                        Edit
                      </Button>
                      <Button
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                        onClick={() => deleteFaculty(fac._id)}
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
    </div>
  );
};

export default Admin_Faculty;
