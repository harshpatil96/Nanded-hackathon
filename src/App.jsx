import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebaseConfig"; // Firebase config
import Login from "./login/Login";
import SidebarLayout from "./components/SidebarLayout"; // Sidebar
import StudentInfo from "./pages/StudentInfo";

// Placeholder components for other pages
function HomePage() {
  return <h1 className="text-3xl font-bold text-center mt-10">Welcome to Home Page</h1>;
}

function SettingsPage() {
  return <h1 className="text-3xl font-bold text-center mt-10">Settings Page</h1>;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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
          {/* Sidebar remains fixed */}
          <SidebarLayout />

          {/* Main content changes dynamically */}
          <div className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/dashboard/home" element={<HomePage />} />
              <Route path="/dashboard/student-info" element={<StudentInfo />} />
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
