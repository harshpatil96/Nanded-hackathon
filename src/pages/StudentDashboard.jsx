import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const storage = getStorage();

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [newBooking, setNewBooking] = useState({ facility: "", date: "", time: "" });
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchStudentInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.email);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setStudent(userSnap.data());
        }
      }
    };

    fetchStudentInfo();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "bookings"), (snapshot) => {
      const bookingsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBookings(bookingsData);
    });
    return () => unsubscribe();
  }, []);

  const handleBooking = async () => {
    if (!newBooking.facility || !newBooking.date || !newBooking.time) return;
    await addDoc(collection(db, "bookings"), {
      studentEmail: student.email,
      facility: newBooking.facility,
      date: newBooking.date,
      time: newBooking.time,
      status: "Pending Approval",
    });
    setNewBooking({ facility: "", date: "", time: "" });
  };

  // if (!student) {
  //   return <p className="text-center text-gray-600 mt-6">Loading student information...</p>;
  // }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Student Dashboard</h2>

      <h3 className="text-xl font-semibold text-gray-700 mt-4">Book a Facility</h3>
      <select
        className="w-full p-2 border rounded mt-2"
        value={newBooking.facility}
        onChange={(e) => setNewBooking({ ...newBooking, facility: e.target.value })}
      >
        <option value="">Select Facility</option>
        <option value="Auditorium">Auditorium</option>
        <option value="Tennis Court">Tennis Court</option>
      </select>
      <input
        type="date"
        className="w-full p-2 border rounded mt-2"
        value={newBooking.date}
        onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
      />
      <input
        type="time"
        className="w-full p-2 border rounded mt-2"
        value={newBooking.time}
        onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
      />
      <button onClick={handleBooking} className="w-full bg-blue-500 text-white p-2 mt-3 rounded hover:bg-blue-600">
        Request Booking
      </button>

      <h3 className="text-xl font-semibold text-gray-700 mt-6">My Bookings</h3>
      <ul className="mt-2">
        {bookings
          .filter((booking) => booking.studentEmail === student.email)
          .map((booking) => (
            <li key={booking.id} className="p-2 border-b">
              {booking.facility} on {booking.date} at {booking.time} -
              <span className={booking.status === "Approved" ? "text-green-500" : "text-red-500"}> {booking.status}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default StudentDashboard;
