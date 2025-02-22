import { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const StudentAppointment = () => {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);

  // Hardcoded user for testing (replace with actual user data)
  const currentUser = {
    displayName: "John Doe", // Replace with actual user name
    email: "john.doe@example.com", // Replace with actual user email
  };

  // Fetch appointments from Firestore
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      setError("Please provide a reason for the appointment.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Add appointment request to Firestore
      await addDoc(collection(db, "DoctorAppointment"), {
        studentName: currentUser.displayName || "Unknown",
        studentEmail: currentUser.email,
        classCoordinatorEmail: "coordinator@college.com", // Replace with actual coordinator email
        reason,
        status: "pending", // Initial status
        createdAt: new Date(),
      });

      alert("Appointment request submitted successfully!");
      setReason("");
      fetchAppointments(); // Refresh the list
    } catch (err) {
      console.error("Error submitting appointment:", err);
      setError("Failed to submit appointment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete appointment
  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this appointment?");
      if (confirmDelete) {
        await deleteDoc(doc(db, "DoctorAppointment", appointmentId));
        setAppointments(appointments.filter((appointment) => appointment.id !== appointmentId));
        alert("Appointment deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      setError("Failed to delete appointment. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {/* Appointment Form */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 hover:shadow-2xl mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">Schedule Appointment</h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reason for Appointment */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Reason for Appointment</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter reason for appointment"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            {isLoading ? "Submitting..." : "Submit Appointment"}
          </button>
        </form>
      </div>

      {/* Appointments List */}
      <div className="w-full max-w-6xl">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Your Appointments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="text-xl font-bold text-blue-800 mb-2">{appointment.studentName}</h3>
              <p className="text-gray-700 mb-1">
                <strong>Reason:</strong> {appointment.reason}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Status:</strong> {appointment.status}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Date:</strong> {appointment.createdAt.toDate().toLocaleDateString()}
              </p>
              <button
                onClick={() => handleDeleteAppointment(appointment.id)}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105"
              >
                Delete Appointment
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentAppointment;