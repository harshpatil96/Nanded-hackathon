import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc, getDocs, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Send, Check, X, Clock, User, Briefcase } from "lucide-react";

const ApplicationDashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [formData, setFormData] = useState({
    type: "Event Organization",
    description: "",
    applicant: "",
  });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      const querySnapshot = await getDocs(collection(db, "applications"));
      const appList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setApplications(appList);
      setLoading(false);
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserRole(userSnap.data().role);
        }
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await addDoc(collection(db, "applications"), { ...formData, status: "Pending" });
      setFormData({ type: "Event Organization", description: "", applicant: "" });
      const querySnapshot = await getDocs(collection(db, "applications"));
      setApplications(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleApproval = async (id, status) => {
    if (userRole === "HOD" || userRole === "admin") {
      const applicationRef = doc(db, "applications", id);
      await updateDoc(applicationRef, { status });
      const querySnapshot = await getDocs(collection(db, "applications"));
      setApplications(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto p-4 sm:p-6"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <div className="flex items-center justify-center space-x-3 ">
          <FileText className="text-blue-500" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">Application Dashboard</h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        {/* Submit Application Form */}
        {/* <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
            <h2 className="text-xl font-semibold">Submit Application</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Briefcase size={18} className="mr-2" />
                Application Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option>Event Organization</option>
                <option>Budget Approval</option>
                <option>Sponsorship</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <User size={18} className="mr-2" />
                Your Name
              </label>
              <input
                type="text"
                name="applicant"
                value={formData.applicant}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FileText size={18} className="mr-2" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 resize-none"
                placeholder="Provide detailed information about your application"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={submitLoading}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {submitLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              ) : (
                <>
                  <Send size={20} className="mr-2" />
                  Submit Application
                </>
              )}
            </motion.button>
          </form>
        </motion.div> */}

        {/* Applications Status */}
        <div className="flex justify-center items-center min-h-screen">
  <motion.div
    variants={container}
    initial="hidden"
    animate="show"
    className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-2xl"
  >
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
      <h2 className="text-xl font-semibold">Applications Status</h2>
    </div>
    
    <div className="p-4">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : (
        <motion.div className="space-y-3">
          <AnimatePresence>
            {applications.map((app) => (
              <motion.div
                key={app.id}
                variants={item}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Briefcase size={18} className="text-gray-500" />
                      <span className="font-medium">{app.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User size={18} className="text-gray-500" />
                      <span>{app.applicant}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={18} className="text-gray-500" />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.status === "Approved" ? "bg-green-100 text-green-800" :
                      app.status === "Rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-gray-600">{app.description}</p>

                {(userRole === "HOD" || userRole === "Admin") && app.status === "Pending" && (
                  <div className="mt-3 flex space-x-2">
                    <motion.button
                      onClick={() => handleApproval(app.id, "Approved")}
                      className="flex items-center px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Check size={16} className="mr-1" />
                      Approve
                    </motion.button>
                    <motion.button
                      onClick={() => handleApproval(app.id, "Rejected")}
                      className="flex items-center px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X size={16} className="mr-1" />
                      Reject
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  </motion.div>
</div>
      </div>
    </motion.div>
  );
};

export default ApplicationDashboard;