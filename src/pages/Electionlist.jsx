import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig.js"; // Firebase Firestore setup
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom"; // Import Link for navigation

const ElectionList = () => {
  const [elections, setElections] = useState([]);

  useEffect(() => {
    const fetchElections = async () => {
      const querySnapshot = await getDocs(collection(db, "elections"));
      const electionData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setElections(electionData);
    };
    fetchElections();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Elections</h2>
      <ul className="space-y-3">
        {elections.map((election) => (
          <li key={election.id} className="p-4 bg-gray-100 rounded-lg shadow-md">
            <Link to={`/election/${election.id}`} className="text-blue-500 hover:underline text-lg">
              {election.name} - {<br></br>}
              {election.status}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ElectionList;
