import { useState, useEffect } from "react";
import { auth, db } from "../../firebase/firebaseConfig"; // Correct relative path
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import TimePicker from "react-time-picker"; // Import react-time-picker
import "react-time-picker/dist/TimePicker.css"; // Import CSS for react-time-picker
import PlacesAlotted from "../../components/PlacesAlotted";

const CampusPlaces = () => {
  const [user, setUser] = useState(null); // Logged-in user
  const [purpose, setPurpose] = useState(""); // Purpose of booking
  const [place, setPlace] = useState(""); // Place to be booked
  const [date, setDate] = useState(""); // Date of booking
  const [timeFrom, setTimeFrom] = useState("10:00 AM"); // Time From (12-hour format)
  const [timeTo, setTimeTo] = useState("12:00 PM"); // Time To (12-hour format)
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message

  // Fetch the logged-in user's information
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch user details from Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data()); // Set user data
        } else {
          setError("User not found in Firestore.");
        }
      } else {
        setError("No user logged in.");
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Convert 12-hour time to 24-hour format
  const convertTo24HourFormat = (time12h) => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");

    if (hours === "12") {
      hours = "00";
    }

    if (modifier === "PM") {
      hours = parseInt(hours, 10) + 12;
    }

    return `${hours}:${minutes}`;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!user) {
        throw new Error("User not logged in.");
      }

      // Convert 12-hour time to 24-hour format
      const timeFrom24h = convertTo24HourFormat(timeFrom);
      const timeTo24h = convertTo24HourFormat(timeTo);

      // Create a new request object
      const requestData = {
        requestId: `${user.uid}_${Date.now()}`, // Unique request ID
        studentUid: user.uid, // User's UID
        studentName: user.displayName, // User's name
        studentEmail: user.email, // User's email
        department: user.department, // User's department
        purpose: purpose, // Purpose of booking
        place: place, // Place to be booked
        date: date, // Date of booking
        timeFrom: timeFrom24h, // Time From (24-hour format)
        timeTo: timeTo24h, // Time To (24-hour format)
        status: "pending", // Default status
        createdAt: new Date().toISOString(), // Timestamp
        updatedAt: new Date().toISOString(), // Timestamp
      };

      // Add or update the request in the "requests" collection
      const requestRef = doc(db, "requests", requestData.requestId);
      await setDoc(requestRef, requestData, { merge: true });

      alert("Booking request submitted successfully!");
      setPurpose("");
      setPlace("");
      setDate("");
      setTimeFrom("10:00 AM");
      setTimeTo("12:00 PM");
    } catch (error) {
      console.error("Error submitting request:", error);
      setError("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 py-10">
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-2xl rounded-xl border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Campus Place Booking
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Enter purpose (e.g., Cultural Event)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Place */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Place
            </label>
            <select
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            >
              <option value="" disabled>
                Select a place
              </option>
              <option value="Auditorium">Auditorium</option>
              <option value="Seminar Hall">Seminar Hall</option>
              <option value="Conference Room">Conference Room</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Time From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time From
            </label>
            <TimePicker
              onChange={setTimeFrom}
              value={timeFrom}
              disableClock={true}
              format="h:mm a"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Time To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time To
            </label>
            <TimePicker
              onChange={setTimeTo}
              value={timeTo}
              disableClock={true}
              format="h:mm a"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
      <PlacesAlotted />
    </div>
  );
};

export default CampusPlaces;