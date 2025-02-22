import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import { useNavigate, Outlet, NavLink } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Home,
  User,
  Vote,
  Calendar,
  DollarSign,
  MessageSquare,
  Building2,
  AlertTriangle,
  FileCheck,
  Settings,
  LogOut
} from "lucide-react";

function SidebarHod() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(true);

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

  const sidebarVariants = {
    open: { width: "256px" },
    closed: { width: "80px" }
  };

  const navItems = [
    { to: "/dashboard/home", icon: <Home size={20} />, label: "Home" },
    { to: "/dashboard/CandidateApplication", icon: <Vote size={20} />, label: "Elections" },
    { to: "/dashboard/budget-track", icon: <DollarSign size={20} />, label: "Budget Tracking" },
    { to: "/dashboard/complaints", icon: <MessageSquare size={20} />, label: "Complaints" },
    { to: "/dashboard/CampusPlacesReq", icon: <Building2 size={20} />, label: "Campus Places Booking" },
    { to: "/dashboard/ApplicationApproval", icon: <FileCheck size={20} />, label: "Application Approval" },
   
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <motion.div
        className="h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col"
        variants={sidebarVariants}
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between mb-6">
            <motion.h2
              className="text-2xl font-bold"
              animate={{ opacity: isOpen ? 1 : 0 }}
            >
              Dashboard
            </motion.h2>
          </div>

          <motion.div
            className="mb-6 p-4 bg-blue-800 rounded-lg"
            animate={{ opacity: isOpen ? 1 : 0 }}
          >
            <p className="text-sm">
              <span className="block font-semibold text-blue-300">{name}</span>
              <span className="text-gray-300">{role}</span>
            </p>
          </motion.div>

          <div className="space-y-2">
            {navItems.map((item, index) => (
              <NavLink
                key={`${item.to}-${index}`}  // Unique key
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-all transform hover:scale-105 ${isActive ? "bg-blue-700 text-white" : "hover:bg-blue-800"
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <motion.span
                  animate={{ opacity: isOpen ? 1 : 0 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 w-full bg-red-600 hover:bg-red-700 rounded-lg transition-all transform hover:scale-105"
          >
            <LogOut size={20} className="mr-2" />
            <motion.span animate={{ opacity: isOpen ? 1 : 0 }}>
              Logout
            </motion.span>
          </button>
        </div>
      </motion.div>

      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default SidebarHod;
