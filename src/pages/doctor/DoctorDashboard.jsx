import { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  X, 
  User, 
  FileText, 
  CalendarRange,
  Loader2
} from "lucide-react";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [leaveDetails, setLeaveDetails] = useState({
    description: "",
    leaveFrom: "",
    leaveTo: "",
  });

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError("");

    try {
      const querySnapshot = await getDocs(collection(db, "DoctorAppointment"));
      const appointmentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(appointmentsData);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to fetch appointments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleApproveLeave = async (e) => {
    e.preventDefault();

    if (!leaveDetails.description || !leaveDetails.leaveFrom || !leaveDetails.leaveTo) {
      setError("Please fill all fields.");
      return;
    }

    try {
      // Update the appointment status in Firestore
      await updateDoc(doc(db, "DoctorAppointment", selectedAppointment.id), {
        status: "approved",
        description: leaveDetails.description,
        leaveFrom: leaveDetails.leaveFrom,
        leaveTo: leaveDetails.leaveTo,
      });

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      successMessage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>Leave approved successfully!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        successMessage.remove();
      }, 3000);

      // Reset state
      setSelectedAppointment(null);
      setLeaveDetails({ description: "", leaveFrom: "", leaveTo: "" });
      fetchAppointments();
    } catch (err) {
      console.error("Error approving leave:", err);
      setError("Failed to approve leave. Please try again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 tracking-tight">DOCTOR </h1>
            <p className="text-gray-600 mt-2">Manage medical appointments and leave requests</p>
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
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {appointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                variants={itemVariants}
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
                        {appointment.studentName}
                      </h3>
                      <p className="text-sm text-gray-500">{appointment.studentEmail}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                    appointment.status === "approved" 
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {appointment.status === "approved" ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {appointment.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2 text-gray-600">
                    <FileText size={16} className="mt-1 flex-shrink-0" />
                    <p>{appointment.reason}</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={16} />
                    <span>{appointment.createdAt.toDate().toLocaleDateString()}</span>
                  </div>
                  
                  {appointment.status === "approved" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-4 bg-green-50 rounded-xl space-y-2"
                    >
                      <p className="text-green-700 flex items-center gap-2">
                        <CalendarRange size={16} />
                        <span>
                          <strong>Leave Period:</strong> {appointment.leaveFrom} to {appointment.leaveTo}
                        </span>
                      </p>
                      <p className="text-green-700">
                        <strong>Description:</strong> {appointment.description}
                      </p>
                    </motion.div>
                  )}
                </div>

                {appointment.status === "pending" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAppointment(appointment)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve Leave
                  </motion.button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        <AnimatePresence>
          {selectedAppointment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">
                      Approve Leave Request
                    </h3>
                    <button
                      onClick={() => setSelectedAppointment(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleApproveLeave} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        What Happened?
                      </label>
                      <textarea
                        value={leaveDetails.description}
                        onChange={(e) =>
                          setLeaveDetails({ ...leaveDetails, description: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter medical details..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Leave From
                        </label>
                        <input
                          type="date"
                          value={leaveDetails.leaveFrom}
                          onChange={(e) =>
                            setLeaveDetails({ ...leaveDetails, leaveFrom: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Leave To
                        </label>
                        <input
                          type="date"
                          value={leaveDetails.leaveTo}
                          onChange={(e) =>
                            setLeaveDetails({ ...leaveDetails, leaveTo: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md"
                      >
                        Approve Leave
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setSelectedAppointment(null)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DoctorDashboard;