import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase/firebaseConfig"; // Firebase config
import Login from "./components/Login";
import SidebarStudent from "./pages/student/SidebarStudent";
import SidebarAdmin from "./pages/admin/SidebarAdmin";
import StudentInfo from "./pages/student/StudentInfo";
import CampusPlaces from "./pages/student/CampusPlaces";
import CampusPlacesReq from "./pages/hod/CampusPlacesReq";
import SidebarHod from "./pages/hod/SidebarHod";
import CheatingRecordsForm from "./pages/faculty/CheatingRecordsForm";
import SidebarFac from "./pages/faculty/SidebarFac";
import CheatingRecStd from "./pages/student/CheatingRecStd";
import ContestElections from "./pages/admin/ContestElections";
import CandidateApplication from "./pages/student/CandidateApplication";


// Placeholder components for other pages
function HomePage() {
  return <h1 className="text-3xl font-bold text-center mt-10">Welcome to Home Page</h1>;
}


function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // Add role state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role); // Set the user's role
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading...</p>;

  return (
    <Router>
      {/* If not logged in, show only the Login page */}
      {!user ? (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        // If logged in, show sidebar + dynamic content
        <div className="flex h-screen bg-gray-100">
          {/* Conditionally render the sidebar based on role */}
          {role === "student" && <SidebarStudent />}
          {role === "admin" && <SidebarAdmin />}
          {role === "HOD" && <SidebarHod />}
          {role === "faculty" && <SidebarFac />}

          {/* Main content changes dynamically */}
          <div className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/dashboard/home" element={<HomePage />} />
              <Route path="/dashboard/student-info" element={<StudentInfo />} />
              <Route path="/dashboard/campusPlaces" element={<CampusPlaces />} />
              <Route path="/dashboard/CampusPlacesReq" element={<CampusPlacesReq />} />
              <Route path="/dashboard/Cheating" element={<CheatingRecordsForm />} />
              <Route path="/dashboard/CheatingRecStd" element={<CheatingRecStd />} />
              <Route path="/dashboard/ContestElections" element={<ContestElections />} />
              <Route path="/dashboard/CandidateApplication" element={<CandidateApplication />} />
              <Route path="/" element={<Navigate to="/dashboard/home" />} />
            </Routes>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;