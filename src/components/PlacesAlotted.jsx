import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; // Ensure correct import

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const q = query(collection(db, "requests"), where("status", "==", "accepted"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-8">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
          Booked Places
        </span>
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center">
          <p className="text-lg text-red-500 font-semibold">No accepted bookings found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-xl overflow-hidden">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-left">
                  <th className="py-4 px-6 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold">Department</th>
                  <th className="py-4 px-6 font-semibold">Place</th>
                  <th className="py-4 px-6 font-semibold">Purpose</th>
                  <th className="py-4 px-6 font-semibold">Student Name</th>
                  <th className="py-4 px-6 font-semibold">Time From</th>
                  <th className="py-4 px-6 font-semibold">Time To</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr
                    key={booking.id}
                    className={`border-t border-gray-300 transition duration-300 ${
                      index % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <td className="py-4 px-6">{booking.date}</td>
                    <td className="py-4 px-6">{booking.department}</td>
                    <td className="py-4 px-6">{booking.place}</td>
                    <td className="py-4 px-6">{booking.purpose}</td>
                    <td className="py-4 px-6">{booking.studentName}</td>
                    <td className="py-4 px-6">{booking.timeFrom}</td>
                    <td className="py-4 px-6">{booking.timeTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;