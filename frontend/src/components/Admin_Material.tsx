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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Material {
  _id: string;
  name: string;
  description: string;
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

const Admin_Material = () => {
  const { getToken } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    facultyId: "",
    courseId: "",
  });
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Fetch all materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const response = await axios.get(`${API_URL}/api/faculty/materials`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMaterials(response.data.materials || []);
        setFilteredMaterials(response.data.materials || []);
      } catch (error) {
        console.error("Error fetching materials:", error);
        alert("Failed to load materials");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
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
      setFilteredMaterials(materials);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = materials.filter(
        (material) =>
          material.courseName.toLowerCase().includes(lowercasedSearch) ||
          material.facultyName.toLowerCase().includes(lowercasedSearch) ||
          material.name.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredMaterials(filtered);
    }
  }, [searchTerm, materials]);

  // Open edit dialog
  const handleEdit = (material: Material) => {
    setCurrentMaterial(material);
    setEditForm({
      name: material.name,
      description: material.description,
      facultyId: material.facultyId?._id || "",
      courseId: material.courseId?._id || "",
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

  // Save edited material
  const handleSave = async () => {
    if (!currentMaterial) return;

    try {
      setLoading(true);
      const token = await getToken();

      // Call the API to update the material
      const response = await axios.put(
        `${API_URL}/api/faculty/materials/${currentMaterial._id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state with the returned updated material
      const updatedMaterial = response.data.material;
      const updatedMaterials = materials.map((material) =>
        material._id === currentMaterial._id ? updatedMaterial : material
      );

      setMaterials(updatedMaterials);
      setEditDialogOpen(false);
      alert("Material updated successfully");
    } catch (error) {
      console.error("Error updating material:", error);
      alert("Failed to update material");
    } finally {
      setLoading(false);
    }
  };

  // Delete material
  const handleDelete = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this material?")) {
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      await axios.delete(`${API_URL}/api/faculty/materials/${materialId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state
      const updatedMaterials = materials.filter(
        (material) => material._id !== materialId
      );
      setMaterials(updatedMaterials);
      alert("Material deleted successfully");
    } catch (error) {
      console.error("Error deleting material:", error);
      alert("Failed to delete material");
    } finally {
      setLoading(false);
    }
  };

  if (loading && materials.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Course Materials</CardTitle>
          <CardDescription>
            Manage all course materials uploaded by faculty
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by course, faculty or material name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMaterials.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              No materials found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.map((material) => (
                    <TableRow key={material._id}>
                      <TableCell className="font-medium">
                        {material.name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {material.description}
                      </TableCell>
                      <TableCell>{material.facultyName}</TableCell>
                      <TableCell>{material.courseName}</TableCell>
                      <TableCell>
                        {new Date(material.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(material)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
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
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
            <DialogDescription>
              Update the material information below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Material Name
              </label>
              <Input
                id="name"
                name="name"
                value={editForm.name}
                onChange={handleChange}
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
                rows={3}
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
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin_Material;
