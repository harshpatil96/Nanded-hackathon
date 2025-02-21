import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase/firebaseConfig"; // Import Firebase config
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";



const containsProfanity = (text) => {
  return filter.isProfane(text);
};

const ComplaintForm = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Fetch complaints from Firestore in real-time
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

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Upload image to Firebase Storage and return URL
  const uploadImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `complaints/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let imageUrl = "";
    
    
    try {
      // Upload image if selected
      if (image) {
        imageUrl = await uploadImage(image);
      }

      // Add complaint to Firestore
      await addDoc(collection(db, "complaints"), {
        text: complaintText,
        timestamp: serverTimestamp(), // Fix timestamp issue
        status: "Pending",
        imageUrl,
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

            {/* Image Upload */}
            <div className="mt-4">
              <label className="block font-medium mb-2">Upload Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-lg file:text-sm file:bg-white file:hover:bg-gray-200"
              />
            </div>

            {/* Image Preview */}
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

      {/* Display Complaints */}
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
