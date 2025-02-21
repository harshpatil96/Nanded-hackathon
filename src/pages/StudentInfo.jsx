import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
const storage = getStorage();

function StudentInfo() {
  const [student, setStudent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false); // For confirmation modal

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Current user email:", user.email);
        
        const userRef = doc(db, "users", user.email.toLowerCase()); // Ensure lowercase
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          console.log("User data from Firestore:", userSnap.data());
          setStudent(userSnap.data());
        } else {
          console.log("User not found in Firestore. Check Firestore users collection.");
        }
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !student) return;

    setUploading(true);

    try {
      const storageRef = ref(storage, `profilePictures/${student.email}`);
      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", student.email), {
        profilePicture: downloadURL,
      });

      setStudent((prev) => ({ ...prev, profilePicture: downloadURL }));
    } catch (error) {
      console.error("Error uploading image:", error);
    }

    setUploading(false);
  };

  const handleRemoveProfilePicture = async () => {
    if (!student || !student.profilePicture) return;

    setUploading(true);

    try {
      const storageRef = ref(storage, `profilePictures/${student.email}`);
      await deleteObject(storageRef);

      await updateDoc(doc(db, "users", student.email), {
        profilePicture: null,
      });

      setStudent((prev) => ({ ...prev, profilePicture: null }));
    } catch (error) {
      console.error("Error removing profile picture:", error);
    }

    setUploading(false);
    setShowModal(false); // Close modal
  };

  if (!student) {
    return <p className="text-center text-gray-600 mt-6">Loading student information...</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Student Information</h2>

      {/* Profile Picture */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <img
            src={student.profilePicture || "/default-avatar.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover shadow-md"
          />
          <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition">
            📷
            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
          </label>
        </div>
        {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}

        {/* Remove Profile Picture Button */}
        {student.profilePicture && (
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Remove Profile Picture
          </button>
        )}
      </div>

      {/* Student Info */}
      <div className="mt-6 space-y-4 text-lg">
        <p>
          <span className="font-semibold text-gray-700">Name:</span> {student.displayName}
        </p>
        <p>
          <span className="font-semibold text-gray-700">Email:</span> {student.email}
        </p>
        <p>
          <span className="font-semibold text-gray-700">Department:</span> {student.department}
        </p>
        <p>
          <span className="font-semibold text-gray-700">Year of Study:</span> {student.yos}
        </p>
        <p>
          <span className="font-semibold text-gray-700">Date of Birth:</span> {student.dob}
        </p>
        <p>
          <span className="font-semibold text-gray-700">Parent Email:</span> {student.parent_email}
        </p>
        <p>
          <span className="font-semibold text-gray-700">Contact:</span> {student.contact}
        </p>
      </div>

      {/* Confirmation Modal for Removing Profile Picture */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800">Remove Profile Picture?</h3>
            <p className="text-gray-600 mt-2">Are you sure you want to delete your profile picture?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={handleRemoveProfilePicture}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentInfo;
