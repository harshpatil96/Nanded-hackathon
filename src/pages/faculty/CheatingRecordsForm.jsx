import { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig.js";
import { collection, getDocs, addDoc } from "firebase/firestore";
import CheatingRecordsList from "../../components/CheatingRecordsList"; // Import the reusable component

const CheatingRecordsForm = () => {
  const [records, setRecords] = useState([]); // State to store all records
  const [newRecord, setNewRecord] = useState({
    name: "",
    photo: null,
    description: "",
    department: "",
    year: "",
  });

  // Fetch records from Firestore on component mount
  useEffect(() => {
    const fetchRecords = async () => {
      const querySnapshot = await getDocs(collection(db, "cheating_records"));
      setRecords(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchRecords();
  }, []);

  // Handle adding a new record
  const handleAddRecord = async () => {
    if (
      newRecord.name &&
      newRecord.photo &&
      newRecord.description &&
      newRecord.department &&
      newRecord.year
    ) {
      try {
        const docRef = await addDoc(collection(db, "cheating_records"), newRecord);
        setRecords([...records, { id: docRef.id, ...newRecord }]); // Update local state
        setNewRecord({
          name: "",
          photo: null,
          description: "",
          department: "",
          year: "",
        });
        alert("Record added successfully!");
      } catch (error) {
        console.error("Error adding record: ", error);
        alert("Failed to add record. Please try again.");
      }
    } else {
      alert("Please fill all fields.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Academic Integrity Violations</h1>

      {/* Input Form */}
      <div className="bg-white p-4 rounded shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Add New Record</h2>
        <input
          type="text"
          placeholder="Name"
          className="border p-2 w-full mt-2"
          value={newRecord.name}
          onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
        />
        <input
          type="file"
          className="border p-2 w-full mt-2"
          onChange={(e) =>
            setNewRecord({ ...newRecord, photo: URL.createObjectURL(e.target.files[0]) })
          }
        />
        <input
          type="text"
          placeholder="Description"
          className="border p-2 w-full mt-2"
          value={newRecord.description}
          onChange={(e) =>
            setNewRecord({ ...newRecord, description: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Department"
          className="border p-2 w-full mt-2"
          value={newRecord.department}
          onChange={(e) =>
            setNewRecord({ ...newRecord, department: e.target.value })
          }
        />
        <select
          className="border p-2 w-full mt-2"
          value={newRecord.year}
          onChange={(e) => setNewRecord({ ...newRecord, year: e.target.value })}
        >
          <option value="">Select Year</option>
          <option value="First">First</option>
          <option value="Second">Second</option>
          <option value="Third">Third</option>
          <option value="Final">Final</option>
        </select>
        <button
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          onClick={handleAddRecord}
        >
          Add Record
        </button>
      </div>

      {/* Render the CheatingRecordsList component */}
      <CheatingRecordsList records={records} />
    </div>
  );
};

export default CheatingRecordsForm;