import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input"; // ShadCN input
import { Button } from "../components/ui/button"; // ShadCN button
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog"; // ShadCN dialog
import { Pencil, Trash2, UserPlus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Student {
  _id: string;
  name: string;
  email: string;
  profileImage?: string; // Profile image URL (optional)
  joinDate?: string;
}

const Admin_Student = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false); // Add dialog state

  // Edit student state
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editJoinDate, setEditJoinDate] = useState<string>("");

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          "https://it-hub-iota.vercel.app/api/students"
        );
        if (!response.ok) throw new Error("Failed to fetch students");

        const data = await response.json();
        if (!Array.isArray(data.students))
          throw new Error("Invalid response format");

        setStudents(data.students);
        setFilteredStudents(data.students); // Initialize filtered students
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Handle search input change
  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.name?.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [search, students]);

  // Handle adding a new student
  const addStudent = async () => {
    if (!email.trim()) return;

    try {
      const response = await fetch(
        "https://it-hub-iota.vercel.app/api/students",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to add student");

      setStudents([...students, data.student]); // Update state
      setFilteredStudents([...students, data.student]); // Update filtered list
      setEmail(""); // Clear input
      setOpen(false); // Close dialog
      toast.success("Student added successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Open edit dialog with student data
  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setEditName(student.name || "");
    setEditEmail(student.email || "");

    // Format the date for the input (YYYY-MM-DD)
    if (student.joinDate) {
      const joinDate = new Date(student.joinDate);
      const formattedDate = format(joinDate, "yyyy-MM-dd");
      setEditJoinDate(formattedDate);
    } else {
      setEditJoinDate("");
    }

    setEditDialogOpen(true);
  };

  // Handle updating a student
  const updateStudent = async () => {
    if (!selectedStudent) return;

    try {
      const response = await fetch(
        `https://it-hub-iota.vercel.app/api/students/${selectedStudent._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editName,
            email: editEmail,
            joinDate: editJoinDate,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update student");

      // Update the students list with the updated student
      const updatedStudentsList = students.map((student) =>
        student._id === selectedStudent._id ? data.student : student
      );

      setStudents(updatedStudentsList);
      setFilteredStudents(updatedStudentsList);
      setEditDialogOpen(false);
      setSelectedStudent(null);
      toast.success("Student updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  // Handle deleting a student
  const deleteStudent = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://it-hub-iota.vercel.app/api/students/${studentToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete student");
      }

      // Remove the deleted student from the lists
      const updatedStudentsList = students.filter(
        (student) => student._id !== studentToDelete._id
      );

      setStudents(updatedStudentsList);
      setFilteredStudents(updatedStudentsList);
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      toast.success("Student deleted successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Students</h1>
      <div className="flex justify-between mb-4">
        {/* Search Bar */}
        <Input
          type="text"
          placeholder="Search students by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full md:w-1/2"
        />

        {/* Add Student Button & Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4 flex items-center gap-2">
              <UserPlus size={16} />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Student</DialogTitle>
              <DialogDescription>
                Enter the email address of the student you want to add.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="email"
              placeholder="Enter student email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addStudent}>Add Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && filteredStudents.length === 0 && (
        <p className="text-gray-600">No students found.</p>
      )}

      {!loading && !error && filteredStudents.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/6">Student ID</TableHead>
                <TableHead className="w-1/5">Name</TableHead>
                <TableHead className="w-1/5">Email</TableHead>
                <TableHead className="w-1/6">Join Date</TableHead>
                <TableHead className="w-1/6">Profile</TableHead>
                <TableHead className="w-1/6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student._id}>
                  <TableCell className="font-mono text-xs">
                    {student._id}
                  </TableCell>
                  <TableCell>{student.name || "N/A"}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    {student.joinDate
                      ? new Date(student.joinDate).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {student.profileImage ? (
                      <img
                        src={student.profileImage}
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {student.name
                          ? student.name.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(student)}
                        className="flex items-center"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(student)}
                        className="flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
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

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student's information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Student name"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Student email"
              />
            </div>
            <div>
              <label htmlFor="joinDate" className="text-sm font-medium">
                Join Date
              </label>
              <Input
                id="joinDate"
                type="date"
                value={editJoinDate}
                onChange={(e) => setEditJoinDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateStudent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {studentToDelete && (
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {studentToDelete.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {studentToDelete.email}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteStudent}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Student"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin_Student;
