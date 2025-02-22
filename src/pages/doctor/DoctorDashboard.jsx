import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all appointment requests
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

  // Handle leave approval
  const handleApproveLeave = async (appointmentId, fromDate, toDate) => {
    try {
      await updateDoc(doc(db, "DoctorAppointment", appointmentId), {
        status: "approved",
        leaveFrom: fromDate,
        leaveTo: toDate,
      });

      alert("Leave approved successfully!");
      fetchAppointments(); // Refresh the list
    } catch (err) {
      console.error("Error approving leave:", err);
      setError("Failed to approve leave. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Doctor Dashboard</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="p-4 border border-gray-300 rounded-lg">
              <h3 className="text-lg font-semibold">{appointment.studentName}</h3>
              <p className="text-gray-700">{appointment.reason}</p>
              <p className="text-gray-500">Status: {appointment.status}</p>
              {appointment.status === "pending" && (
                <div className="mt-2">
                  <button
                    onClick={() => handleApproveLeave(appointment.id, "2023-10-01", "2023-10-05")} // Replace with actual dates
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Approve Leave
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;