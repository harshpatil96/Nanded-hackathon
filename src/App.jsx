import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase/firebaseConfig"; // Firebase config
import Login from "./components/Login";
import SidebarStudent from "./pages/student/SidebarStudent";
import SidebarAdmin from "./pages/admin/SidebarAdmin";
import StudentInfo from "./pages/StudentInfo";
import ElectionList from "./pages/Electionlist";
import ElectionDetails from "./pages/ElectionDetails";


// Placeholder components for other pages
function HomePage() {
  return <h1 className="text-3xl font-bold text-center mt-10">Welcome to Home Page</h1>;
}

function SettingsPage() {
  return <h1 className="text-3xl font-bold text-center mt-10">Settings Page</h1>;
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

          {/* Main content changes dynamically */}
          <div className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/dashboard/home" element={<HomePage />} />
              <Route path="/dashboard/student-info" element={<StudentInfo />} />
              <Route path="/dashboard/election-list" element={<ElectionList />} />
              <Route path="/election/:electionId" element={<ElectionDetails />} />
              
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="/" element={<Navigate to="/dashboard/home" />} />
            </Routes>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;