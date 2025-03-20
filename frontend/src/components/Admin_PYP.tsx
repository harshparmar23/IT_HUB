import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
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
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Loader2, Pencil, X, Check, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const API_URL =
  import.meta.env.VITE_API_URL || "https://it-hub-iota.vercel.app";

interface Paper {
  _id: string;
  name: string;
  description: string;
  year: number;
  fileUrl: string;
  facultyId: {
    _id: string;
    name: string;
  };
  courseId: {
    _id: string;
    name: string;
  };
  facultyName: string;
  courseName: string;
  createdAt: string;
}

interface Faculty {
  _id: string;
  name: string;
  role: string;
}

interface Course {
  _id: string;
  name: string;
}

const Admin_PYP = () => {
  const { getToken } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPaper, setCurrentPaper] = useState<Paper | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    year: 0,
    facultyId: "",
    courseId: "",
  });
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Fetch all papers
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const response = await axios.get(`${API_URL}/api/faculty/papers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPapers(response.data.papers || []);
        setFilteredPapers(response.data.papers || []);
      } catch (error) {
        console.error("Error fetching papers:", error);
        alert("Failed to load papers");
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [getToken]);

  // Fetch faculties and courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();

        // Fetch faculties
        const facultyResponse = await axios.get(`${API_URL}/api/faculty`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFaculties(facultyResponse.data.faculty || []);

        // Fetch courses
        const courseResponse = await axios.get(`${API_URL}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(courseResponse.data.courses || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [getToken]);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPapers(papers);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = papers.filter(
        (paper) =>
          paper.courseName.toLowerCase().includes(lowercasedSearch) ||
          paper.facultyName.toLowerCase().includes(lowercasedSearch) ||
          paper.name.toLowerCase().includes(lowercasedSearch) ||
          paper.year.toString().includes(lowercasedSearch)
      );
      setFilteredPapers(filtered);
    }
  }, [searchTerm, papers]);

  // Open edit dialog
  const handleEdit = (paper: Paper) => {
    setCurrentPaper(paper);
    setEditForm({
      name: paper.name,
      description: paper.description,
      year: paper.year,
      facultyId: paper.facultyId?._id || "",
      courseId: paper.courseId?._id || "",
    });
    setEditDialogOpen(true);
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save edited paper
  const handleSave = async () => {
    if (!currentPaper) return;

    try {
      setLoading(true);
      const token = await getToken();

      // Call the API to update the paper
      const response = await axios.put(
        `${API_URL}/api/faculty/papers/${currentPaper._id}`,
        {
          ...editForm,
          year: parseInt(editForm.year.toString(), 10),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state with the returned updated paper
      const updatedPaper = response.data.paper;
      const updatedPapers = papers.map((paper) =>
        paper._id === currentPaper._id ? updatedPaper : paper
      );

      setPapers(updatedPapers);
      setEditDialogOpen(false);
      alert("Paper updated successfully");
    } catch (error) {
      console.error("Error updating paper:", error);
      alert("Failed to update paper");
    } finally {
      setLoading(false);
    }
  };

  // Delete paper
  const handleDelete = async (paperId: string) => {
    if (!confirm("Are you sure you want to delete this paper?")) {
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      await axios.delete(`${API_URL}/api/faculty/papers/${paperId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state
      setPapers(papers.filter((paper) => paper._id !== paperId));
      alert("Paper deleted successfully");
    } catch (error) {
      console.error("Error deleting paper:", error);
      alert("Failed to delete paper");
    } finally {
      setLoading(false);
    }
  };

  if (loading && papers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">
        Previous Year Papers Management
      </h1>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search by course, faculty, paper name, or year..."
          className="pl-10 pr-4 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Papers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Previous Year Papers</CardTitle>
          <CardDescription>
            View and manage all previous year papers across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPapers.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              {searchTerm
                ? "No papers match your search"
                : "No papers available"}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paper Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPapers.map((paper) => (
                  <TableRow key={paper._id}>
                    <TableCell className="font-medium">{paper.name}</TableCell>
                    <TableCell>{paper.year}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {paper.description}
                    </TableCell>
                    <TableCell>{paper.courseName}</TableCell>
                    <TableCell>{paper.facultyName}</TableCell>
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
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(paper)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(paper._id)}
                        >
                          <X className="h-4 w-4" />
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Previous Year Paper</DialogTitle>
            <DialogDescription>
              Update the paper details below. The file cannot be changed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Paper Name
              </label>
              <Input
                id="name"
                name="name"
                value={editForm.name}
                onChange={handleChange}
                placeholder="Enter paper name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="year" className="text-sm font-medium">
                Year
              </label>
              <Input
                id="year"
                name="year"
                type="number"
                min="2000"
                max={new Date().getFullYear()}
                value={editForm.year}
                onChange={handleChange}
                placeholder="Enter year"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={editForm.description}
                onChange={handleChange}
                placeholder="Enter paper description"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="faculty" className="text-sm font-medium">
                Faculty
              </label>
              <Select
                value={editForm.facultyId}
                onValueChange={(value) =>
                  handleSelectChange("facultyId", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty._id} value={faculty._id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="course" className="text-sm font-medium">
                Course
              </label>
              <Select
                value={editForm.courseId}
                onValueChange={(value) => handleSelectChange("courseId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Course" />
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

            {currentPaper && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Course</p>
                <p className="text-sm">{currentPaper.courseName}</p>

                <p className="text-sm font-medium mt-2">Faculty</p>
                <p className="text-sm">{currentPaper.facultyName}</p>

                <p className="text-sm font-medium mt-2">File</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => window.open(currentPaper.fileUrl, "_blank")}
                >
                  View File
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin_PYP;
