import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { Calendar, User, FileText, CalendarRange, Loader2, AlertCircle } from "lucide-react";

const LeaveApplication = () => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch the logged-in user's email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Logged-in user email:", user.email); // Debugging
        setCurrentUser(user.email); // Set the logged-in user's email
      } else {
        setError("No user is logged in.");
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch leave applications for the logged-in coordinator
  const fetchLeaveApplications = async () => {
    setIsLoading(true);
    setError("");

    try {
      const querySnapshot = await getDocs(collection(db, "FacultyLeaveDashboard"));
      const leaveData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("All leave applications:", leaveData); // Debugging

      // Filter leave applications where classCoordinatorEmail matches the logged-in user's email
      const filteredLeaveData = leaveData.filter(
        (leave) => leave.classCoordinatorEmail === currentUser
      );

      console.log("Filtered leave applications:", filteredLeaveData); // Debugging

      setLeaveApplications(filteredLeaveData);
    } catch (err) {
      console.error("Error fetching leave applications:", err);
      setError("Failed to fetch leave applications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch leave applications when the currentUser changes
  useEffect(() => {
    if (currentUser) {
      console.log("Fetching leave applications for coordinator:", currentUser); // Debugging
      fetchLeaveApplications();
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 tracking-tight">Faculty Leave Dashboard</h1>
            <p className="text-gray-600 mt-2">View approved leave applications for your students</p>
          </div>
          <div className="bg-white p-3 rounded-full shadow-md">
            <User size={24} className="text-blue-600" />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center gap-2"
          >
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 size={40} className="text-blue-600" />
            </motion.div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {leaveApplications.length > 0 ? (
              leaveApplications.map((leave) => (
                <motion.div
                  key={leave.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {leave.studentName}
                        </h3>
                        <p className="text-sm text-gray-500">{leave.studentEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2 text-gray-600">
                      <FileText size={16} className="mt-1 flex-shrink-0" />
                      <p>{leave.reason}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar size={16} />
                      <span>{leave.createdAt.toDate().toLocaleDateString()}</span>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-4 bg-green-50 rounded-xl space-y-2"
                    >
                      <p className="text-green-700 flex items-center gap-2">
                        <CalendarRange size={16} />
                        <span>
                          <strong>Leave Period:</strong> {leave.leaveFrom} to {leave.leaveTo}
                        </span>
                      </p>
                      <p className="text-green-700">
                        <strong>Description:</strong> {leave.description}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-600">No leave applications found for your students.</p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LeaveApplication;