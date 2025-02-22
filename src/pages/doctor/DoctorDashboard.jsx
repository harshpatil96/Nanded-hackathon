import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null); // Track selected appointment for approval
  const [leaveDetails, setLeaveDetails] = useState({
    description: "", // What happened
    leaveFrom: "", // Leave start date
    leaveTo: "", // Leave end date
  });

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

  // Handle leave approval form submission
  const handleApproveLeave = async (e) => {
    e.preventDefault();

    if (!leaveDetails.description || !leaveDetails.leaveFrom || !leaveDetails.leaveTo) {
      setError("Please fill all fields.");
      return;
    }

    try {
      // Update the appointment in Firestore
      await updateDoc(doc(db, "DoctorAppointment", selectedAppointment.id), {
        status: "approved",
        description: leaveDetails.description, // Add what happened
        leaveFrom: leaveDetails.leaveFrom, // Leave start date
        leaveTo: leaveDetails.leaveTo, // Leave end date
      });

      alert("Leave approved successfully!");
      setSelectedAppointment(null); // Close the form
      setLeaveDetails({ description: "", leaveFrom: "", leaveTo: "" }); // Reset form
      fetchAppointments(); // Refresh the list

      // TODO: Send email notifications to the class coordinator and student
      // You can use Firebase Cloud Functions for this.
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
                    onClick={() => setSelectedAppointment(appointment)} // Open form for this appointment
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

      {/* Leave Approval Form */}
      {selectedAppointment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Approve Leave for {selectedAppointment.studentName}</h3>
            <form onSubmit={handleApproveLeave} className="space-y-4">
              {/* What Happened */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">What Happened?</label>
                <textarea
                  value={leaveDetails.description}
                  onChange={(e) =>
                    setLeaveDetails({ ...leaveDetails, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter details"
                  required
                />
              </div>

              {/* Leave Start Date */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Leave From</label>
                <input
                  type="date"
                  value={leaveDetails.leaveFrom}
                  onChange={(e) =>
                    setLeaveDetails({ ...leaveDetails, leaveFrom: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Leave End Date */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Leave To</label>
                <input
                  type="date"
                  value={leaveDetails.leaveTo}
                  onChange={(e) =>
                    setLeaveDetails({ ...leaveDetails, leaveTo: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md transition-transform transform hover:scale-105"
              >
                Approve Leave
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)} // Close the form
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg shadow-md transition-transform transform hover:scale-105"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;