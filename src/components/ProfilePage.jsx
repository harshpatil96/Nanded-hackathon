import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc, updateDoc, getDocs, collection, query, orderBy, limit } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { 
  User, 
  Mail, 
  Building2, 
  GraduationCap, 
  Calendar, 
  Users, 
  Phone,
  Upload,
  Trash2,
  Loader2,
  Shield
} from "lucide-react";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData({
              ...userDoc.data(),
              email: user.email,
              uid: user.uid
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUpdates = async () => {
      const updatesRef = collection(db, "updates");
      const updatesQuery = query(updatesRef, orderBy("timestamp", "desc"), limit(5));
      const updatesSnap = await getDocs(updatesQuery);
      const updatesList = updatesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUpdates(updatesList);
    };

    fetchUpdates();
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !userData) {
      console.error("No file selected or user data not loaded.");
      return;
    }

    setUploading(true);

    try {
      const base64 = await convertToBase64(file);
      await updateDoc(doc(db, "users", userData.uid), {
        profilePicture: base64,
      });
      setUserData((prev) => ({ ...prev, profilePicture: base64 }));
      console.log("Profile picture updated successfully in Firestore.");
    } catch (error) {
      console.error("Error uploading image:", error);
    }

    setUploading(false);
  };

  const handleRemoveProfilePicture = async () => {
    if (!userData) return;

    try {
      await updateDoc(doc(db, "users", userData.uid), {
        profilePicture: "",
      });
      setUserData((prev) => ({ ...prev, profilePicture: "" }));
      console.log("Profile picture removed successfully.");
    } catch (error) {
      console.error("Error removing profile picture:", error);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  if (!userData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 10 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={40} className="text-blue-600" />
        </motion.div>
      </div>
    );
  }

  const getRoleDisplayName = (role) => {
    const roleMap = {
      student: "Student",
      admin: "Administrator", 
      faculty: "Faculty",
      doctor: "Doctor",
      hod: "Head of Department"
    };
    return roleMap[role] || role;
  };

  const infoItems = [
    { icon: User, label: "Name", value: userData.displayName },
    { icon: Mail, label: "Email", value: userData.email },
    { icon: Building2, label: "Department", value: userData.department },
    { icon: Shield, label: "Role", value: getRoleDisplayName(userData.role) },
    { icon: Calendar, label: "Member Since", value: userData.createdAt ? userData.createdAt.toDate().toLocaleDateString() : "N/A" },
    { icon: Users, label: "Account Type", value: userData.isDemoUser ? "Demo Account" : "Active User" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h2 className="text-3xl font-bold text-center">User Profile</h2>
          </div>

          <div className="p-8">
            {/* Profile Picture Section */}
            <motion.div 
              className="flex flex-col items-center -mt-20 mb-8"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <img
                  src={userData.profilePicture || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                />
                <AnimatePresence>
                  {uploading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
                    >
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Upload Controls */}
              <div className="mt-6 flex flex-col items-center gap-4">
                <label className="relative cursor-pointer">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-blue-50 text-blue-700 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-100 transition-colors"
                  >
                    <Upload size={20} />
                    <span>Upload New Picture</span>
                  </motion.div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </label>

                {userData.profilePicture && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRemoveProfilePicture}
                    className="text-red-600 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={20} />
                    Remove Picture
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* User Info Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="show"
            >
              {infoItems.map((item, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0 }
                  }}
                  className="bg-gray-50 p-4 rounded-xl flex items-center gap-4"
                >
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="text-lg font-medium text-gray-900">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Updates Section */}
            <AnimatePresence>
              {updates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-12 bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl"
                >
                  <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    <span className="text-2xl">📢</span> Important Updates
                  </h3>
                  <motion.ul
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                      }
                    }}
                    initial="hidden"
                    animate="show"
                    className="mt-4 space-y-2"
                  >
                    {updates.map(update => (
                      <motion.li
                        key={update.id}
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          show: { opacity: 1, x: 0 }
                        }}
                        className="text-amber-800"
                      >
                        {update.message}
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
