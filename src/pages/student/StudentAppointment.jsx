import { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, AlertCircle, Trash2, PlusCircle, User, Mail, CheckCircle } from "lucide-react";

const StudentAppointment = () => {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true);

  // Fetch the logged-in student's details
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCurrentUser({
            displayName: userDoc.data().displayName,
            email: user.email,
          });
        } else {
          setError("User data not found in Firestore!");
        }
      } else {
        setError("No user is logged in.");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAppointments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "DoctorAppointment"));
      const appointmentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to fetch appointments. Please try again.");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      setError("Please provide a reason for the appointment.");
      return;
    }

    if (!currentUser) {
      setError("No user is logged in.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await addDoc(collection(db, "DoctorAppointment"), {
        studentName: currentUser.displayName || "Unknown",
        studentEmail: currentUser.email,
        classCoordinatorEmail: "coordinator@college.com",
        reason,
        status: "pending",
        createdAt: new Date(),
      });

      setReason("");
      fetchAppointments();
      setIsFormVisible(false);
      
      // Show success message with animation
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
      successMessage.textContent = 'Appointment submitted successfully!';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    } catch (err) {
      console.error("Error submitting appointment:", err);
      setError("Failed to submit appointment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this appointment?");
      if (confirmDelete) {
        await deleteDoc(doc(db, "DoctorAppointment", appointmentId));
        setAppointments(appointments.filter((appointment) => appointment.id !== appointmentId));
        
        // Show success message with animation
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
        successMessage.textContent = 'Appointment deleted successfully!';
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
          successMessage.remove();
        }, 3000);
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      setError("Failed to delete appointment. Please try again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 tracking-tight">
            Medical Appointments
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg"
          >
            <PlusCircle size={20} />
            {isFormVisible ? "Close Form" : "New Appointment"}
          </motion.button>
        </div>

        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-4 mb-8 flex items-center gap-4"
          >
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{currentUser.displayName}</h3>
              <div className="flex items-center gap-2 text-gray-500">
                <Mail size={14} />
                <span>{currentUser.email}</span>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {isFormVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8 overflow-hidden"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Schedule New Appointment</h2>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6"
                >
                  <AlertCircle size={20} />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Reason for Appointment
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Please describe your reason for the appointment..."
                    rows={4}
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg transition-all duration-300"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Clock size={20} />
                      </motion.div>
                      Processing...
                    </span>
                  ) : (
                    "Submit Appointment"
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

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
                <h3 className="text-xl font-semibold text-gray-800">
                  {appointment.studentName}
                </h3>
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
                <p className="text-gray-600">
                  <strong>Reason:</strong> {appointment.reason}
                </p>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={16} />
                  <span>{appointment.createdAt.toDate().toLocaleDateString()}</span>
                </div>
                {appointment.status === "approved" && (
                  <div className="space-y-2 mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-green-700">
                      <strong>Leave From:</strong> {appointment.leaveFrom}
                    </p>
                    <p className="text-green-700">
                      <strong>Leave To:</strong> {appointment.leaveTo}
                    </p>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDeleteAppointment(appointment.id)}
                className="flex items-center gap-2 w-full justify-center bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl transition-colors duration-200"
              >
                <Trash2 size={16} />
                Cancel Appointment
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudentAppointment;