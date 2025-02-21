import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function StudentInfo() {
  const [student, setStudent] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch student info from Firestore
  useEffect(() => {
    const fetchStudentInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setStudent(userSnap.data());
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
      // Convert image to Base64
      const base64 = await convertToBase64(file);

      // Store in Firestore
      await updateDoc(doc(db, "users", student.uid), {
        profilePicture: base64,
      });

      // Update state
      setStudent((prev) => ({ ...prev, profilePicture: base64 }));
      console.log("Profile picture updated successfully in Firestore.");
    } catch (error) {
      console.error("Error uploading image:", error);
    }

    setUploading(false);
  };

  // Handle profile picture removal
  const handleRemoveProfilePicture = async () => {
    if (!student) return;

    try {
      await updateDoc(doc(db, "users", student.uid), {
        profilePicture: "",
      });
      setStudent((prev) => ({ ...prev, profilePicture: "" }));
      console.log("Profile picture removed successfully.");
    } catch (error) {
      console.error("Error removing profile picture:", error);
    }
  };

  // Convert image to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  if (!student) {
    return <p className="text-center text-gray-600 mt-6">Loading student information...</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Student Information</h2>

      {/* Profile Picture Section */}
      <div className="flex flex-col items-center">
        <img
          src={student.profilePicture || "/default-avatar.png"}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover shadow-md"
        />
      </div>

      {/* Upload and Remove Section */}
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
        {student.profilePicture && (
          <button
            onClick={handleRemoveProfilePicture}
            className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600"
          >
            Remove Profile Picture
          </button>
        )}
      </div>

      {/* Student Info */}
      <div className="mt-6 space-y-4 text-lg">
        <p><span className="font-semibold text-gray-700">Name:</span> {student.displayName}</p>
        <p><span className="font-semibold text-gray-700">Email:</span> {student.email}</p>
        <p><span className="font-semibold text-gray-700">Department:</span> {student.department}</p>
        <p><span className="font-semibold text-gray-700">Year of Study:</span> {student.yos}</p>
        <p><span className="font-semibold text-gray-700">Date of Birth:</span> {student.dob}</p>
        <p><span className="font-semibold text-gray-700">Parent Email:</span> {student.parent_email}</p>
        <p><span className="font-semibold text-gray-700">Contact:</span> {student.contact}</p>
      </div>
    </div>
  );
}

export default StudentInfo;
