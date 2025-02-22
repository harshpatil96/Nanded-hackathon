import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Image as ImageIcon, Trash2 } from "lucide-react";

const CheatingRecordsList = ({ records, userRole, onDeleteRecord }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageURLs, setImageURLs] = useState({});

  useEffect(() => {
    const urls = {};

    records.forEach((record) => {
      if (typeof record.photo === "string" && record.photo.startsWith("blob:")) {
        urls[record.id] = record.photo;
      } else {
        urls[record.id] = record.photo; // Already a valid URL
      }
    });

    setImageURLs(urls);
  }, [records]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const imageModalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 tracking-tight">Cheating Records</h1>
            <p className="text-gray-600 mt-2">Manage and view cheating records</p>
          </div>
          <div className="bg-white p-3 rounded-full shadow-md">
            <ImageIcon size={24} className="text-blue-600" />
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full bg-white shadow-md rounded-lg overflow-hidden"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Photo</th>
                <th className="p-3">Description</th>
                <th className="p-3">Department</th>
                <th className="p-3">Year</th>
                <th className="p-3">Date</th>
                {userRole === "faculty" && <th className="p-3">Actions</th>} {/* Show Actions column only for faculty */}
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((record, index) => (
                  <motion.tr
                    key={record.id}
                    className="border-b hover:bg-gray-50 transition"
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                  >
                    <td className="p-3">{record.name}</td>
                    <td className="p-3">
                      {imageURLs[record.id] ? (
                        <motion.img
                          src={imageURLs[record.id]}
                          alt="Proof"
                          className="h-16 w-16 object-cover rounded cursor-pointer hover:scale-110 transition"
                          onClick={() => setSelectedImage(imageURLs[record.id])}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        />
                      ) : (
                        <span className="text-gray-500">Image not available</span>
                      )}
                    </td>
                    <td className="p-3">{record.description}</td>
                    <td className="p-3">{record.department}</td>
                    <td className="p-3">{record.year}</td>
                    <td className="p-3">{record.date}</td>
                    {userRole === "faculty" && ( // Show delete button only for faculty
                      <td className="p-3">
                        <button
                          className="text-red-500 hover:text-red-700 transition"
                          onClick={() => onDeleteRecord(record.id)}
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    )}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={userRole === "faculty" ? 7 : 6} className="p-3 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>

        {/* Image Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative p-4 bg-white rounded-lg shadow-lg"
                variants={imageModalVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <button
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  onClick={() => setSelectedImage(null)}
                >
                  <X size={20} />
                </button>
                <img
                  src={selectedImage}
                  alt="Enlarged proof"
                  className="max-w-full max-h-[80vh] rounded"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

CheatingRecordsList.propTypes = {
  records: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      photo: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      department: PropTypes.string.isRequired,
      year: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
    })
  ).isRequired,
  userRole: PropTypes.string.isRequired, // Validate userRole prop
  onDeleteRecord: PropTypes.func.isRequired, // Validate onDeleteRecord prop
};

export default CheatingRecordsList;