import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();

function StudentInfo() {
  const [student, setStudent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false); // For confirmation modal

  // Fetch student info from Firestore
  useEffect(() => {
    const fetchStudentInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid); // Use UID as the document ID
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setStudent(userSnap.data()); // Set student data including profilePicture
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchStudentInfo();
  }, []);

  // Handle profile picture upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !student) {
      console.error("No file selected or student data not loaded.");
      return;
    }
  
    setUploading(true);
  
    try {
      console.log("Uploading file:", file);
  
      // Use UID as the file name in Storage
      const storageRef = ref(storage, `profilePictures/${student.uid}`);
      console.log("Storage reference:", storageRef);
  
      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, file);
      console.log("File uploaded successfully.");
  
      // Get the download URL of the uploaded file
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Download URL:", downloadURL);
  
      // Update Firestore with the new profilePicture URL
      await updateDoc(doc(db, "users", student.uid), {
        profilePicture: downloadURL,
      });
      console.log("Firestore updated successfully.");
  
      // Update local state to reflect the new profile picture
      setStudent((prev) => ({ ...prev, profilePicture: downloadURL }));
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  
    setUploading(false);
  };

  // Handle profile picture removal
  const handleRemoveProfilePicture = async () => {
    if (!student || !student.profilePicture) return;

    setUploading(true);

    try {
      // Use UID as the file name in Storage
      const storageRef = ref(storage, `profilePictures/${student.uid}`);
      await deleteObject(storageRef); // Delete the file from Firebase Storage

      // Update Firestore to remove the profilePicture URL
      await updateDoc(doc(db, "users", student.uid), {
        profilePicture: "",
      });

      // Update local state to remove the profile picture
      setStudent((prev) => ({ ...prev, profilePicture: "" }));
    } catch (error) {
      console.error("Error removing profile picture:", error);
    }

    setUploading(false);
    setShowModal(false); // Close the confirmation modal
  };

  // Loading state
  if (!student) {
    return <p className="text-center text-gray-600 mt-6">Loading student information...</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Student Information</h2>

      {/* Profile Picture Section */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <img
            src={student.profilePicture || "/default-avatar.png"} // Use default avatar if no profile picture
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover shadow-md"
          />
        </div>
      </div>

      {/* Upload Profile Picture Section */}
      <div className="mt-6 flex flex-col items-center">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Profile Picture
        </label>
        <input
          type="file"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          onChange={handleImageUpload}
          accept="image/*"
        />
        {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
      </div>

      {/* Student Info Section */}
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