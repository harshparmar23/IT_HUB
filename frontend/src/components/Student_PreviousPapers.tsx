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
import { Loader2, Search, FileText, Download, Calendar } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://it-hub-iota.vercel.app";

interface Paper {
  _id: string;
  name: string;
  description: string;
  year: number;
  fileUrl: string;
  facultyName: string;
  courseName: string;
  createdAt: string;
}

const Student_PreviousPapers: React.FC = () => {
  const { getToken } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
        alert("Failed to load previous year papers");
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
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

  if (loading && papers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Previous Year Papers</h1>

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

      {/* Papers Display */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPapers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-8 text-gray-500">
                {searchTerm
                  ? "No papers match your search"
                  : "No previous year papers available"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Available Previous Year Papers</CardTitle>
              <CardDescription>
                Browse and download previous year papers shared by faculty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paper Name</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPapers.map((paper) => (
                    <TableRow key={paper._id}>
                      <TableCell className="font-medium">
                        {paper.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-purple-600" />
                          <span className="font-semibold">{paper.year}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {paper.description}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {paper.courseName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          {paper.facultyName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(paper.fileUrl, "_blank")}
                            className="flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => window.open(paper.fileUrl, "_blank")}
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

export default Student_PreviousPapers;
