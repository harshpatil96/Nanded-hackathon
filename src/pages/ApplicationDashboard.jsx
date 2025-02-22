import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig.js"; // Import Firebase config
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc, getDocs, updateDoc } from "firebase/firestore";

const ApplicationDashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [formData, setFormData] = useState({
    type: "Event Organization",
    description: "",
    applicant: "",
  });
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      const querySnapshot = await getDocs(collection(db, "applications"));
      const appList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setApplications(appList);
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserRole(userSnap.data().role); // Ensure role is stored in Firestore
        }
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "applications"), { ...formData, status: "Pending" });
    setFormData({ type: "Event Organization", description: "", applicant: "" });

    // Refresh applications after submission
    const querySnapshot = await getDocs(collection(db, "applications"));
    setApplications(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleApproval = async (id, status) => {
    if (userRole === "HOD") {
      const applicationRef = doc(db, "applications", id);
      await updateDoc(applicationRef, { status });

      // Refresh applications after approval
      const querySnapshot = await getDocs(collection(db, "applications"));
      setApplications(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Submit an Application</h2>
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded shadow-lg">
        <select name="type" value={formData.type} onChange={handleChange} className="p-2 border rounded w-full mb-2">
          <option>Event Organization</option>
          <option>Budget Approval</option>
          <option>Sponsorship</option>
        </select>
        <input
          type="text"
          name="applicant"
          placeholder="Your Name"
          value={formData.applicant}
          onChange={handleChange}
          className="p-2 border rounded w-full mb-2"
        />
        <textarea
          name="description"
          placeholder="Application Details"
          value={formData.description}
          onChange={handleChange}
          className="p-2 border rounded w-full mb-2"
        ></textarea>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Submit</button>
      </form>
      
      <h2 className="text-2xl font-bold mb-4">Application Status</h2>
      <div className="border rounded shadow-lg p-4">
        {applications.map((app) => (
          <div key={app.id} className="p-2 border-b">
            <p><strong>Type:</strong> {app.type}</p>
            <p><strong>Applicant:</strong> {app.applicant}</p>
            <p><strong>Description:</strong> {app.description}</p>
            <p><strong>Status:</strong> {app.status}</p>
            
            {userRole === "HOD" && (
              <div className="mt-2">
                <button
                  onClick={() => handleApproval(app.id, "Approved")}
                  className="bg-green-500 text-white p-1 rounded mr-2"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(app.id, "Rejected")}
                  className="bg-red-500 text-white p-1 rounded"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationDashboard;
