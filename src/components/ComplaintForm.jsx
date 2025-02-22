import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig"; // Import Firebase config
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { Filter } from "bad-words";


import { getAuth, onAuthStateChanged } from "firebase/auth";

const ComplaintForm = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [userRole, setUserRole] = useState("");
  const auth = getAuth();
  const filter = new Filter();
  // console.log(filter.list);
  useEffect(() => {
    const q = query(collection(db, "complaints"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const complaintsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComplaints(complaintsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role); // Fetch and set user role
        }
      }
    });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImage(reader.result);
        setImagePreview(reader.result);
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to submit a complaint.");
        return;
      }
  
      if (filter.isProfane(complaintText)) {
        alert("Your complaint contains inappropriate content. Please modify it.");
        return;
      }
  
      await addDoc(collection(db, "complaints"), {
        text: complaintText,
        timestamp: serverTimestamp(),
        status: "Pending",
        imageUrl: image || "",
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userEmail: user.email,
        anonymous: true, // Mark as anonymous
      });
  
      alert("Complaint submitted successfully!");
      setComplaintText("");
      setImage(null);
      setImagePreview("");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleResolve = async (id) => {
    try {
      await updateDoc(doc(db, "complaints", id), { status: "Resolved" });
      alert("Complaint marked as resolved.");
    } catch (error) {
      console.error("Error updating complaint:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "complaints", id));
      alert("Complaint deleted successfully.");
    } catch (error) {
      console.error("Error deleting complaint:", error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <button
        onClick={() => setIsFormOpen(!isFormOpen)}
        className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
      >
        {isFormOpen ? "Hide Complaint Form" : "Submit Complaint"}
      </button>

      {isFormOpen && (
        <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-100">
          <h2 className="text-xl font-semibold mb-3">Submit a Complaint</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="Enter your complaint..."
              className="w-full p-3 border border-gray-300 rounded-md resize-y"
              rows={4}
              required
            />

            <div className="mt-4">
              <label className="block font-medium mb-2">Upload Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-lg file:text-sm file:bg-white file:hover:bg-gray-200"
              />
            </div>

            {imagePreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">Image Preview:</p>
                <img src={imagePreview} alt="Selected" className="mt-2 w-full max-h-48 object-cover rounded-md border" />
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}

      <h2 className="mt-6 text-xl font-semibold">Submitted Complaints</h2>
      <div className="mt-4 space-y-4">
        {complaints.length > 0 ? (
          complaints.map((complaint) => (
            <div key={complaint.id} className="p-4 border rounded-lg shadow bg-gray-50">
              <p>{complaint.text}</p>
              {complaint.imageUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Attached Image:</p>
                  <img src={complaint.imageUrl} alt="Complaint" className="mt-2 w-full max-h-48 object-cover rounded-md border" />
                </div>
              )}
              <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                <span>Status: <span className="font-medium">{complaint.status}</span></span>
                <span>{complaint.timestamp?.toDate().toLocaleString()}</span>
              </div>

              {(userRole === "admin" || userRole === "faculty" || userRole === "hod") && complaint.status === "Pending" && (
                <button
                  onClick={() => handleResolve(complaint.id)}
                  className="mt-3 px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Mark as Resolved
                </button>
              )}

              {userRole === "admin" && complaint.status === "Resolved" && (
                <button
                  onClick={() => handleDelete(complaint.id)}
                  className="mt-3 ml-2 px-4 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No complaints submitted yet.</p>
        )}
      </div>
    </div>
  );
};

export default ComplaintForm;
