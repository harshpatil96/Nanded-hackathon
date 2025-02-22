import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { 
  Vote, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ChevronRight, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  GraduationCap, 
  Award, 
  FileText, 
  Target 
} from "lucide-react";

const CandidateApplication = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
    mobile: "",
    courseYear: "",
    branch: "",
    cgpa: "",
    whyApply: "",
    goals: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [view, setView] = useState("upcoming");
  const [totalApplications, setTotalApplications] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95
    }
  };

  // Status icons and colors
  const statusIcons = {
    Pending: <AlertTriangle className="w-5 h-5" />,
    Approved: <CheckCircle className="w-5 h-5" />,
    Rejected: <XCircle className="w-5 h-5" />,
  };

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };

  useEffect(() => {
    const fetchElections = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "elections"));
        const electionsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setElections(electionsData);
      } catch (error) {
        console.error("Error fetching elections:", error);
        setError("Failed to fetch elections. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchElections();
  }, []);

  useEffect(() => {
    if (view === "your") {
      fetchUserApplications();
    }
  }, [view]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        email: user.email,
      }));
    }
  }, []);

  const fetchTotalApplications = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "candidates"));
      const applicationsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTotalApplications(applicationsData);
    } catch (error) {
      console.error("Error fetching total applications:", error);
      setError("Failed to fetch total applications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Please log in to view your applications.");
        return;
      }

      const q = query(collection(db, "candidates"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
      const applicationsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUserApplications(applicationsData);
    } catch (error) {
      console.error("Error fetching user applications:", error);
      setError("Failed to fetch your applications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
    setSelectedElection(null);
    if (newView === "total") {
      fetchTotalApplications();
    }
  };

  const handleApplyClick = (election) => {
    setSelectedElection(election);
    setFormData((prevFormData) => ({
      ...prevFormData,
      role: election.role,
    }));
    setView("apply");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedElection) {
      setError("No election selected.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("Please log in to submit an application.");
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, "candidates"), {
        ...formData,
        userId: user.uid,
        email: user.email,
        electionId: selectedElection.id,
        electionName: selectedElection.name,
        role: selectedElection.role,
        status: "Pending",
        appliedAt: new Date().toISOString(),
      });
      setSuccess("Application submitted successfully!");
      setFormData({
        name: "",
        rollNumber: "",
        email: user.email,
        mobile: "",
        courseYear: "",
        branch: "",
        cgpa: "",
        whyApply: "",
        goals: "",
        role: "",
      });
      await fetchUserApplications();
      setTimeout(() => {
        setView("your");
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
      setError("Failed to submit application. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderApplicationStatus = (application) => {
    return (
      <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="bg-white rounded-xl shadow-lg p-6 mb-4 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-blue-800">{application.electionName}</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColors[application.status]}`}>
          {statusIcons[application.status]}
          {application.status}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-gray-600 text-sm">Name</p>
            <p className="font-medium">{application.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-gray-600 text-sm">Roll Number</p>
            <p className="font-medium">{application.rollNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="font-medium">{application.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-gray-600 text-sm">Mobile</p>
            <p className="font-medium">{application.mobile}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-gray-600 text-sm">Branch</p>
            <p className="font-medium">{application.branch}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-gray-600 text-sm">Course Year</p>
            <p className="font-medium">{application.courseYear}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-gray-600 text-sm">CGPA</p>
            <p className="font-medium">{application.cgpa}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-gray-600 text-sm">Role</p>
            <p className="font-medium">{application.role}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <div>
          <p className="text-gray-600 text-sm mb-1">Why Apply</p>
          <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{application.whyApply}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm mb-1">Goals</p>
          <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{application.goals}</p>
        </div>
      </div>
    </motion.div>
    );
  };

  const handleGiveVoteClick = () => {
    navigate("/voting");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6">
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={handleGiveVoteClick}
        className="fixed right-6 top-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2"
      >
        <span>Give Vote!</span>
        <Vote className="w-5 h-5" />
      </motion.button>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {["upcoming", "total", "your"].map((viewOption) => (
            <motion.button
              key={viewOption}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleViewChange(viewOption)}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2
                ${view === viewOption 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                  : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              {viewOption === "upcoming" && <Calendar className="w-5 h-5" />}
              {viewOption === "total" && <FileText className="w-5 h-5" />}
              {viewOption === "your" && <User className="w-5 h-5" />}
              {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)} Elections
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
              />
            </motion.div>
          ) : (
            <motion.div
              key={view}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {view === "upcoming" && (
                <>
                  <h1 className="text-4xl font-bold text-blue-800 mb-8 text-center">
                    Upcoming Elections
                  </h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {elections.map((election) => (
                      <motion.div
                        key={election.id}
                        variants={itemVariants}
                        className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                      >
                        <h3 className="text-xl font-bold text-blue-800 mb-4">{election.name}</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Target className="w-5 h-5 text-blue-600" />
                            <span>{election.role}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span>{election.applicationDates.start} to {election.applicationDates.end}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Vote className="w-5 h-5 text-blue-600" />
                            <span>{election.votingDate}</span>
                          </div>
                        </div>
                        <motion.button
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => handleApplyClick(election)}
                          className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                          <span>Apply Now</span>
                          <ChevronRight className="w-5 h-5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {view === "total" && (
                <>
                  <h1 className="text-4xl font-bold text-blue-800 mb-8 text-center">
                    Total Applications
                  </h1>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Election</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {totalApplications.map((application) => (
                            <motion.tr
                              key={application.id}
                              variants={itemVariants}
                              className="hover:bg-gray-50 transition-colors duration-200"
                            >
                              <td className="px-6 py-4">{application.name}</td>
                              <td className="px-6 py-4">{application.electionName}</td>
                              <td className="px-6 py-4">{application.role}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                  statusColors[application.status]
                                }`}>
                                  {statusIcons[application.status]}
                                  {application.status}
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {view === "your" && (
                <>
                  <h1 className="text-4xl font-bold text-blue-800 mb-8 text-center">
                    Your Applications
                  </h1>
                  <div className="max-w-4xl mx-auto">
                    {userApplications.length === 0 ? (
                      <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-xl p-8 shadow-lg text-center"
                      >
                        <p className="text-gray-600 mb-6">You haven't submitted any applications yet.</p>
                        <motion.button
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => handleViewChange("upcoming")}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium"
                        >
                          View Upcoming Elections
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div variants={containerVariants} className="space-y-6">
                        {userApplications.map(renderApplicationStatus)}
                      </motion.div>
                    )}
                  </div>
                </>
              )}

              {view === "apply" && selectedElection && (
                <motion.div
                  variants={containerVariants}
                  className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8"
                >
                  <h2 className="text-2xl font-bold text-blue-800 mb-6">
                    Apply for {selectedElection.name}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {Object.keys(formData).map((key) => (
                      <motion.div
                        key={key}
                        variants={itemVariants}
                        className="relative"
                      >
                        <label className="block text-gray-700 font-medium mb-2">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1").trim()}
                        </label>
                        {key === "whyApply" || key === "goals" ? (
                          <textarea
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            rows={4}
                            required
                          />
                        ) : (
                          <input
                            type={key === "email" ? "email" : key === "mobile" ? "tel" : "text"}
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            required
                            disabled={key === "email" || key === "role"}
                          />
                        )}
                      </motion.div>
                    ))}
                    <div className="flex gap-4 pt-4">
                      <motion.button
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            <span>Submitting...</span>
                          </div>
                        ) : (
                          "Submit Application"
                        )}
                      </motion.button>
                      <motion.button
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        type="button"
                        onClick={() => handleViewChange("upcoming")}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CandidateApplication;