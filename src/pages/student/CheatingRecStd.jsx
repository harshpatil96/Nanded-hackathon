import { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";
import CheatingRecordsList from "../../components/CheatingRecordsList";

const CheatingRecStd = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      const querySnapshot = await getDocs(collection(db, "cheating_records"));
      setRecords(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchRecords();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Cheating Records</h1>
      <CheatingRecordsList records={records} />
    </div>
  );
};

export default CheatingRecStd;
