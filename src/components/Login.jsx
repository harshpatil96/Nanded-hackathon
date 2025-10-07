import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Demo credentials for each role
  const demoCredentials = [
    { role: "Student", email: "student@demo.com", password: "student123", color: "bg-blue-100 text-blue-800" },
    { role: "Doctor", email: "doctor@demo.com", password: "doctor123", color: "bg-green-100 text-green-800" },
    { role: "Admin", email: "admin@demo.com", password: "admin123", color: "bg-red-100 text-red-800" },
    { role: "Faculty", email: "faculty@demo.com", password: "faculty123", color: "bg-purple-100 text-purple-800" },
    { role: "HOD", email: "hod@demo.com", password: "hod123", color: "bg-orange-100 text-orange-800" }
  ];

  const handleDemoLogin = (credential) => {
    setEmail(credential.email);
    setPassword(credential.password);
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(`Logged in as: ${userData.role}`);

        // The App.jsx will handle routing based on authentication state
        console.log(`Successfully logged in as: ${userData.role}`);
        // No manual redirect needed - App.jsx handles this automatically
      } else {
        console.error("User data not found in Firestore!");
        setError("User data not found!");
      }
    } catch (error) {
      console.error("Login failed:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
      >
        <div className="p-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold text-center text-gray-800 mb-6"
          >
            Access your Dashboard!
          </motion.h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-gray-600 font-medium mb-2">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your email"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <label className="block text-gray-600 font-medium mb-2">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
              />
            </motion.div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                "Login"
              )}
            </motion.button>
          </form>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="bg-gray-50 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Demo Credentials</h3>
          <div className="space-y-3">
            {demoCredentials.map((credential, index) => (
              <motion.button
                key={credential.role}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDemoLogin(credential)}
                className={`w-full p-3 rounded-lg border-2 border-transparent hover:border-gray-300 transition-all duration-300 ${credential.color} cursor-pointer`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{credential.role}</span>
                  <span className="text-sm opacity-75">
                    {credential.email} / {credential.password}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            Click on any credential above to auto-fill the login form
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;