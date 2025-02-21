import { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig"; // Ensure correct relative path
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import PlacesAlotted from "../../components/PlacesAlotted";

const AdminRequests = () => {
  const [requests, setRequests] = useState([]); // List of requests
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message

  // Fetch all requests from Firestore
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError("");

      try {
        const requestsRef = collection(db, "requests");
        const querySnapshot = await getDocs(requestsRef);

        const requestsData = [];
        querySnapshot.forEach((doc) => {
          requestsData.push({ id: doc.id, ...doc.data() });
        });

        setRequests(requestsData); // Set requests data
      } catch (error) {
        console.error("Error fetching requests:", error);
        setError("Failed to fetch requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Toggle request status between "pending" and "accepted"
  const toggleStatus = async (requestId, currentStatus) => {
    try {
      const newStatus = currentStatus === "pending" ? "accepted" : "pending";
      const requestRef = doc(db, "requests", requestId);

      // Update the status in Firestore
      await updateDoc(requestRef, { status: newStatus });

      // Update the local state
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: newStatus }
            : request
        )
      );

      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update status. Please try again.");
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto mt-10 p-8 bg-white shadow-xl rounded-lg border border-gray-300">
        {/* Header */}
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-8 border-b-4 border-blue-500 pb-2 tracking-wide shadow-sm">
        Booking Requests
        </h2>


        {/* Error Message */}
        {error && (
          <p className="text-center text-red-600 bg-red-100 py-2 rounded-md border border-red-400 mb-4">
            {error}
          </p>
        )}

        {/* Loading State */}
        {loading ? (
          <p className="text-center text-lg text-gray-700 animate-pulse">Loading requests...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-gray-200 shadow-md rounded-lg">
              {/* Table Head */}
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg">
                  {["Student Name", "Email", "Date", "Department", "Place", "Purpose", "Time From", "Time To", "Status", "Action"].map((header) => (
                    <th key={header} className="py-3 px-4 border-b text-left">{header}</th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {requests.map((request, index) => (
                  <tr key={request.id} className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}>
                    <td className="py-3 px-4 border-b">{request.studentName}</td>
                    <td className="py-3 px-4 border-b">{request.studentEmail}</td>
                    <td className="py-3 px-4 border-b">{request.date}</td>
                    <td className="py-3 px-4 border-b">{request.department}</td>
                    <td className="py-3 px-4 border-b">{request.place}</td>
                    <td className="py-3 px-4 border-b">{request.purpose}</td>
                    <td className="py-3 px-4 border-b">{request.timeFrom}</td>
                    <td className="py-3 px-4 border-b">{request.timeTo}</td>

                    {/* Status with Color Coding */}
                    <td className={`py-3 px-4 border-b font-semibold ${request.status === "pending" ? "text-yellow-500" : "text-green-500"}`}>
                      {request.status}
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 border-b">
                      <button
                        onClick={() => toggleStatus(request.id, request.status)}
                        className={`px-4 py-2 rounded-md text-white font-medium transition duration-300 ease-in-out transform hover:scale-105 ${
                          request.status === "pending"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {request.status === "pending" ? "Accept" : "Revert"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Additional Component */}
      <PlacesAlotted />
    </>
  );
};

export default AdminRequests;
