import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
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
import { Loader2, Search, FileText, Download } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://it-hub-iota.vercel.app";

interface Material {
  _id: string;
  name: string;
  description: string;
  fileUrl: string;
  facultyName: string;
  courseName: string;
  createdAt: string;
}

const Student_Material: React.FC = () => {
  const { getToken } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  if (loading && materials.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Course Materials</h1>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search by course, faculty, or material name..."
          className="pl-10 pr-4 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Materials Display */}
      <div className="grid grid-cols-1 gap-6">
        {filteredMaterials.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-8 text-gray-500">
                {searchTerm
                  ? "No materials match your search"
                  : "No materials available"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Available Course Materials</CardTitle>
              <CardDescription>
                Browse and download course materials shared by faculty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Faculty</TableHead>
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
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {material.courseName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          {material.facultyName}
                        </span>
                      </TableCell>
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
                            className="flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              window.open(material.fileUrl, "_blank")
                            }
                            className="flex items-center bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Student_Material;
