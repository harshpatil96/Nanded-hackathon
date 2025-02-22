import { useState, useEffect } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import PlacesAlotted from "../../components/PlacesAlotted";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, FileText } from "lucide-react";

const CampusPlaces = () => {
  const [user, setUser] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [place, setPlace] = useState("");
  const [date, setDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("10:00 AM");
  const [timeTo, setTimeTo] = useState("12:00 PM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch the logged-in user's information
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data());
        } else {
          setError("User not found in Firestore.");
        }
      } else {
        setError("No user logged in.");
      }
    });

    return () => unsubscribe();
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

      const timeFrom24h = convertTo24HourFormat(timeFrom);
      const timeTo24h = convertTo24HourFormat(timeTo);

      const requestData = {
        requestId: `${user.uid}_${Date.now()}`,
        studentUid: user.uid,
        studentName: user.displayName,
        studentEmail: user.email,
        department: user.department,
        purpose: purpose,
        place: place,
        date: date,
        timeFrom: timeFrom24h,
        timeTo: timeTo24h,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="max-w-4xl mx-auto p-6 bg-white shadow-2xl rounded-xl border border-gray-100"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-3xl font-bold text-gray-800 text-center mb-8"
          variants={fadeIn}
        >
          Campus Place Booking
        </motion.h2>

        {error && (
          <motion.div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 text-center"
            variants={fadeIn}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Purpose */}
          <motion.div variants={fadeIn}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={18} className="inline-block mr-2" />
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
          </motion.div>

          {/* Place */}
          <motion.div variants={fadeIn}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={18} className="inline-block mr-2" />
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
              <option value="Laboratory">Laboratory</option>
              <option value="Gym">Gym</option>
            </select>
          </motion.div>

          {/* Date */}
          <motion.div variants={fadeIn}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={18} className="inline-block mr-2" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </motion.div>

          {/* Time From */}
          <motion.div variants={fadeIn}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={18} className="inline-block mr-2" />
              Time From
            </label>
            <TimePicker
              onChange={setTimeFrom}
              value={timeFrom}
              disableClock={true}
              format="h:mm a"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </motion.div>

          {/* Time To */}
          <motion.div variants={fadeIn}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={18} className="inline-block mr-2" />
              Time To
            </label>
            <TimePicker
              onChange={setTimeTo}
              value={timeTo}
              disableClock={true}
              format="h:mm a"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={fadeIn}>
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
          </motion.div>
        </form>
      </motion.div>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <PlacesAlotted />
      </motion.div>
    </motion.div>
  );
};

export default CampusPlaces;