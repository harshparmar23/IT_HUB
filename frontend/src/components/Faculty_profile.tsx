import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

interface FacultyProfile {
  _id: string;
  name: string;
  email: string;
  profileImage: string;
  role: string;
  courseName: string;
  experience: number;
  createdAt: string;
  updatedAt: string;
}

const Faculty_profile = () => {
  const { getToken, userId } = useAuth();
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = await getToken();

        const response = await fetch(
          `http://localhost:5000/api/faculty/profile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfile(data.faculty);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, getToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Notice:</strong>
        <span className="block sm:inline"> Profile information not found.</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={profile.profileImage || "https://via.placeholder.com/128"}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
          <p className="text-gray-600 mb-2">{profile.email}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="text-sm font-medium text-gray-500">Role</h3>
              <p className="text-gray-800 capitalize">{profile.role}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <h3 className="text-sm font-medium text-gray-500">Course</h3>
              <p className="text-gray-800">{profile.courseName}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <h3 className="text-sm font-medium text-gray-500">Experience</h3>
              <p className="text-gray-800">
                {profile.experience}{" "}
                {profile.experience === 1 ? "year" : "years"}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <h3 className="text-sm font-medium text-gray-500">Joined</h3>
              <p className="text-gray-800">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faculty_profile;
