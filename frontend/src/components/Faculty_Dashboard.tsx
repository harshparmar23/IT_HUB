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
  BookOpen,
  FileText,
  Clock,
  GraduationCap,
  Loader2,
  BarChart3,
} from "lucide-react";
import { API_ENDPOINTS } from "../utils/api";

// ... existing interfaces ...

const Faculty_Dashboard: React.FC = () => {
  const { userId, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalMaterials: 0,
    totalPapers: 0,
    totalCourses: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = await getToken();

        const response = await axios.get(
          API_ENDPOINTS.faculty.dashboard(userId || ""),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setFaculty(response.data.faculty);
        setMaterials(response.data.materials || []);
        setPapers(response.data.papers || []);
        setStats(response.data.stats);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDashboardData();
    }
  }, [userId, getToken]);

  // ... rest of the component code ...
};
