import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import { useNavigate, Outlet, NavLink } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

function SidebarStudent() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setRole(userSnap.data().role || "Unknown");
          setName(userSnap.data().displayName || "Unknown");
        }
      }
    };

    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>

        {/* User Info */}
        <p className="text-sm text-gray-200 border-l-4 border-blue-400 pl-3 py-2 rounded-md mb-4">
          <span className="font-semibold text-blue-300 tracking-wide">Hello, {name}</span> ({role})
        </p>

        {/* Sidebar Links */}
        <ul className="space-y-4">
          <li>
            <NavLink
              to="/dashboard/home"
              className={({ isActive }) =>
                `block p-3 rounded-lg cursor-pointer transition ${isActive ? "bg-blue-700" : "hover:bg-blue-700"
                }`
              }
            >
              Home
            </NavLink>
          </li>
          {/* Student Info - Only visible to "student" role */}
         
            <li
              onClick={() => navigate("/dashboard/student-info")}
              className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition"
            >
              Student Info
            </li>
         
          
            <li
              onClick={() => navigate("/dashboard/election-list")}
              className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition"
            >
              Elections
            </li>
        
        
            <li
              onClick={() => navigate("/dashboard/budget-track")}
              className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition"
            >
              Budget Tracking
            </li>
        
            <li
              onClick={() => navigate("/dashboard/complaints")}
              className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition"
            >
              Complaints Posting
            </li>
        

          {/* Settings - Only visible to "admin" role */}
         
            <li
              onClick={() => navigate("/dashboard/settings")}
              className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition"
            >
              Settings
            </li>
       
        
          <li
            onClick={() => navigate("/dashboard/student-info")}
            className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition"
          >
            Student Info
          </li>
        

        {/* Settings - Only visible to "admin" role */}
        
          <li
            onClick={() => navigate("/dashboard/campusPlaces")}
            className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition"
          >
            Campus Places Booking
          </li>

          <li
            onClick={() => navigate("/dashboard/CheatingRecStd")}
            className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition"
          >
            Cheating Records
          </li>

          <li
            onClick={() => navigate("/dashboard/CandidateApplication")}
            className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition"
          >
            Apply for Elections
          </li>
        
          <li
            onClick={handleLogout}
            className="p-3 rounded-lg cursor-pointer bg-red-600 hover:bg-red-800 transition text-center"
          >
            Logout
          </li>
        </ul>
      </div>

      {/* Main Content (This will change dynamically) */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default SidebarStudent;
