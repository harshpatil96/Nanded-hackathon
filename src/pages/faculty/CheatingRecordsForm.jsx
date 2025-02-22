import { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig.js";
import { collection, getDocs, addDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import CheatingRecordsList from "../../components/CheatingRecordsList";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const CheatingRecordsForm = () => {
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    name: "",
    photo: null,
    description: "",
    department: "",
    year: "",
    date: "",
  });
  const [userRole, setUserRole] = useState(""); // State to store user role
  const auth = getAuth();

  // Fetch records from Firestore
  useEffect(() => {
    const fetchRecords = async () => {
      const querySnapshot = await getDocs(collection(db, "cheating_records"));
      setRecords(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchRecords();
  }, []);

  // Fetch user role from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid)); // Fetch user document
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role); // Set user role
        }
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Convert Image to Base64
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewRecord({ ...newRecord, photo: reader.result }); // Store Base64 string
      };
      reader.readAsDataURL(file); // Convert to Base64
    }
  };

  // Add new record to Firestore
  const handleAddRecord = async () => {
    if (
      newRecord.name &&
      newRecord.photo &&
      newRecord.description &&
      newRecord.department &&
      newRecord.year &&
      newRecord.date
    ) {
      try {
        const docRef = await addDoc(collection(db, "cheating_records"), newRecord);
        setRecords([...records, { id: docRef.id, ...newRecord }]);
        setNewRecord({ name: "", photo: null, description: "", department: "", year: "", date: "" });
        alert("Record added successfully!");
      } catch (error) {
        console.error("Error adding record: ", error);
        alert("Failed to add record. Please try again.");
      }
    } else {
      alert("Please fill all fields.");
    }
  };

  // Function to delete a record
  const handleDeleteRecord = async (id) => {
    try {
      await deleteDoc(doc(db, "cheating_records", id)); // Delete record from Firestore
      setRecords(records.filter((record) => record.id !== id)); // Update local state
      alert("Record deleted successfully!");
    } catch (error) {
      console.error("Error deleting record: ", error);
      alert("Failed to delete record. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Academic Integrity Violations</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Add New Record</h2>

        <input
          type="text"
          placeholder="Name"
          className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
          value={newRecord.name}
          onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
        />

        <input
          type="file"
          accept="image/*"
          className="border border-gray-300 rounded-md p-3 w-full focus:outline-none mb-3"
          onChange={handleImageUpload}
        />

        <input
          type="text"
          placeholder="Description"
          className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
          value={newRecord.description}
          onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
        />

        <input
          type="text"
          placeholder="Department"
          className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
          value={newRecord.department}
          onChange={(e) => setNewRecord({ ...newRecord, department: e.target.value })}
        />

        <select
          className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
          value={newRecord.year}
          onChange={(e) => setNewRecord({ ...newRecord, year: e.target.value })}
        >
          <option value="">Select Year</option>
          <option value="First">First</option>
          <option value="Second">Second</option>
          <option value="Third">Third</option>
          <option value="Final">Final</option>
        </select>

        <input
          type="date"
          className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
          value={newRecord.date}
          onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
        />

        <button
          className="mt-4 bg-blue-500 text-white p-3 rounded-md w-full hover:bg-blue-600 transition"
          onClick={handleAddRecord}
        >
          Add Record
        </button>
      </div>

      {/* Pass userRole and handleDeleteRecord as props */}
      <CheatingRecordsList records={records} userRole={userRole} onDeleteRecord={handleDeleteRecord} />
    </div>
  );
};

export default CheatingRecordsForm;