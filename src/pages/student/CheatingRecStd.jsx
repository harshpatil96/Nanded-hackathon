import { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";
import CheatingRecordsList from "../../components/CheatingRecordsList"; // Import the reusable component

const CheatingRecStd = () => {
  const [records, setRecords] = useState([]); // State to store all records

  // Fetch records from Firestore on component mount
  useEffect(() => {
    const fetchRecords = async () => {
      const querySnapshot = await getDocs(collection(db, "cheating_records"));
      setRecords(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchRecords();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Cheating Records</h1>

      {/* Render the CheatingRecordsList component */}
      <CheatingRecordsList records={records} />
    </div>
  );
};

export default CheatingRecStd;