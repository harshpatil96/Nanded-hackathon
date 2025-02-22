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

        {/* Sidebar Links with Scroll */}
        <div className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/dashboard/home"
                className={({ isActive }) =>
                  `block p-3 rounded-lg cursor-pointer transition ${
                    isActive ? "bg-blue-700" : "hover:bg-blue-700"
                  }`
                }
              >
                Home
              </NavLink>
            </li>
         
          
            <li
            onClick={() => navigate("/dashboard/CandidateApplication")}
            className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition"
          >
            Apply for Elections
          </li>


          <li
            onClick={() => navigate("/dashboard/StudentAppointment")}
            className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition"
          >
              Schedule Doctor Appointment
          </li>
        
        
            <li
              onClick={() => navigate("/dashboard/budget-track")}
              className="p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition"
            >
              Budget Tracking
            </li>
            <li>
              <NavLink
                to="/dashboard/student-info"
                className={({ isActive }) =>
                  `block p-3 rounded-lg cursor-pointer transition ${
                    isActive ? "bg-blue-700" : "hover:bg-blue-700"
                  }`
                }
              >
                Student Info
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/election-list"
                className={({ isActive }) =>
                  `block p-3 rounded-lg cursor-pointer transition ${
                    isActive ? "bg-blue-700" : "hover:bg-blue-700"
                  }`
                }
              >
                Elections
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/budget-track"
                className={({ isActive }) =>
                  `block p-3 rounded-lg cursor-pointer transition ${
                    isActive ? "bg-blue-700" : "hover:bg-blue-700"
                  }`
                }
              >
                Budget Tracking
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/complaints"
                className={({ isActive }) =>
                  `block p-3 rounded-lg cursor-pointer transition ${
                    isActive ? "bg-blue-700" : "hover:bg-blue-700"
                  }`
                }
              >
                Complaints Posting
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/settings"
                className={({ isActive }) =>
                  `block p-3 rounded-lg cursor-pointer transition ${
                    isActive ? "bg-blue-700" : "hover:bg-blue-700"
                  }`
                }
              >
                Settings
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/campusPlaces"
                className={({ isActive }) =>
                  `block p-3 rounded-lg cursor-pointer transition ${
                    isActive ? "bg-blue-700" : "hover:bg-blue-700"
                  }`
                }
              >
                Campus Places Booking
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/CheatingRecStd"
                className={({ isActive }) =>
                  `block p-3 rounded-lg cursor-pointer transition ${
                    isActive ? "bg-blue-700" : "hover:bg-blue-700"
                  }`
                }
              >
                Cheating Records
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Logout Button */}
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="w-full p-3 rounded-lg cursor-pointer bg-red-600 hover:bg-red-800 transition text-center"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content (This will change dynamically) */}
      <div className="flex-1 p-6 overflow-y-auto h-screen">
        <Outlet />
      </div>
    </div>
  );
}

export default SidebarStudent;
