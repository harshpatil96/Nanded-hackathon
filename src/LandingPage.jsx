import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Calendar,
  MessageSquare,
  ArrowRight,
  Bell,          
  Shield,        
  Lock,          
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Student Election System",
      description: "Online platform for student council elections with secure voting and live result tracking."
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Automated Health & Leave Notifications",
      description: "Automatic email alerts for health reports and campus leave tracking for parents."
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Campus Facility Booking",
      description: "Book campus facilities like auditoriums and courts with real-time availability and approvals."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Academic Integrity System",
      description: "Public record of academic violations to maintain transparency and accountability."
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Anonymous Complaint System",
      description: "Submit anonymous complaints with moderation and transparency for fair resolution."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Restricted Access",
      description: "Accessible only via college email IDs to ensure authenticity and security."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="w-full py-4 px-6 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">College ERP</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLoginClick}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 flex items-center space-x-2"
          >
            <span>Login</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold text-gray-900 mb-6"
          >
            Welcome to Your College Management System
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto"
          >
            A comprehensive solution for managing academic activities, student information, 
            and institutional operations all in one place.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLoginClick}
            className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-500 text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 active:scale-95 group"
          >
            <span className="relative z-10">Get Started</span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-lg"></span>
            <span className="absolute inset-0 border-2 border-white/20 rounded-lg group-hover:border-white/40 transition-all duration-500"></span>
            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/30 blur-sm group-hover:w-8 group-hover:h-8 group-hover:blur-md transition-all duration-500"></span>
          </motion.button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            Everything You Need
          </motion.h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 border border-gray-100"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  {React.cloneElement(feature.icon, { className: "w-6 h-6 text-blue-600" })}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-6 h-6 text-white" />
              <span className="text-xl font-bold text-white">College ERP</span>
            </div>
            <p className="text-sm">
              Your comprehensive college management solution
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={handleLoginClick} className="hover:text-white transition">
                  Student Login
                </button>
              </li>
              <li>
                <button onClick={handleLoginClick} className="hover:text-white transition">
                  Faculty Login
                </button>
              </li>
              <li>
                <button onClick={handleLoginClick} className="hover:text-white transition">
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>Email: support@collegeerp.com</li>
              <li>Phone: (123) 456-7890</li>
              <li>Address: Your College Address</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center">
          <p>&copy; {new Date().getFullYear()} College ERP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;