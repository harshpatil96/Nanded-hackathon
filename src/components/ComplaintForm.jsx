import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { Filter } from "bad-words";
import { AlertCircle, CheckCircle, Send, Image as ImageIcon, X, Trash2 } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ComplaintForm = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [userRole, setUserRole] = useState("");
  const [resolvingComplaintId, setResolvingComplaintId] = useState(null);
  const [resolutionText, setResolutionText] = useState("");
  const auth = getAuth();
  const filter = new Filter();

  // Fetch complaints from Firestore
  useEffect(() => {
    const q = query(collection(db, "complaints"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const complaintsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComplaints(complaintsData);
    });

    return () => unsubscribe();
  }, []);

  // Fetch user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImage(reader.result);
        setImagePreview(reader.result);
      };
    }
  };

  // Handle complaint submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to submit a complaint.");
        return;
      }

      if (filter.isProfane(complaintText)) {
        alert("Your complaint contains inappropriate content. Please modify it.");
        return;
      }

      await addDoc(collection(db, "complaints"), {
        text: complaintText,
        timestamp: serverTimestamp(),
        status: "Pending",
        imageUrl: image || "",
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userEmail: user.email,
        anonymous: true,
      });

      setComplaintText("");
      setImage(null);
      setImagePreview("");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resolving a complaint
  const handleResolve = async (id, resolutionText) => {
    try {
      await updateDoc(doc(db, "complaints", id), {
        status: "Resolved",
        resolution: resolutionText,
        resolvedBy: auth.currentUser.displayName || "Admin",
        resolvedAt: serverTimestamp(),
      });
      setResolvingComplaintId(null);
      setResolutionText("");
    } catch (error) {
      console.error("Error updating complaint:", error);
    }
  };

  // Handle deleting a complaint
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "complaints", id));
    } catch (error) {
      console.error("Error deleting complaint:", error);
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const complaintVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  // Resolution input component
  const ResolutionInput = ({ complaintId, onResolve, onCancel, resolutionText, setResolutionText }) => {
    const textareaRef = useRef(null); // Create a ref for the textarea

    // Focus the textarea when the component mounts
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, []);

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <input
          ref={textareaRef}
          value={resolutionText}
          onChange={(e) => setResolutionText(e.target.value)}
          placeholder="Describe the actions taken to resolve the complaint..."
          className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
          rows={4}
          style={{
            fontSize: "16px",
            lineHeight: "1.5",
            textAlign: "left", // Ensure text aligns to the left
            direction: "ltr", // Ensure left-to-right text direction
          }}
          required
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              onResolve(complaintId, resolutionText);
              setResolutionText("");
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Submit Resolution</span>
          </button>
          <button
            onClick={() => {
              onCancel();
              setResolutionText("");
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    );
  };

  // Add PropTypes validation for ResolutionInput
  ResolutionInput.propTypes = {
    complaintId: PropTypes.string.isRequired,
    onResolve: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    resolutionText: PropTypes.string.isRequired,
    setResolutionText: PropTypes.func.isRequired,
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden"
      >
        <div className="p-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isFormOpen ? <X className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            {isFormOpen ? "Close Form" : "Submit New Complaint"}
          </motion.button>

          <AnimatePresence>
            {isFormOpen && (
              <motion.div
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mt-6"
              >
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Submit a Complaint</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={complaintText}
                        onChange={(e) => setComplaintText(e.target.value)}
                        placeholder="Describe your complaint in detail..."
                        className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                        rows={4}
                        required
                      />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: complaintText.length > 0 ? 1 : 0 }}
                        className="absolute bottom-2 right-2 text-sm text-gray-500"
                      >
                        {complaintText.length} characters
                      </motion.div>
                    </div>

                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-300"
                      >
                        <ImageIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600">Upload Image (Optional)</span>
                      </label>
                    </div>

                    <AnimatePresence>
                      {imagePreview && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="relative"
                        >
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImage(null);
                              setImagePreview("");
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-end gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Submit Complaint</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Complaints</h2>
            <div className="space-y-4">
              <AnimatePresence>
                {complaints.map((complaint, index) => (
                  <motion.div
                    key={complaint.id}
                    variants={complaintVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-800 leading-relaxed">{complaint.text}</p>
                        {complaint.imageUrl && (
                          <motion.img
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            src={complaint.imageUrl}
                            alt="Complaint"
                            className="mt-4 w-full max-h-48 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {complaint.status === "Pending" ? (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        <span className={`font-medium ${
                          complaint.status === "Pending" ? "text-yellow-500" : "text-green-500"
                        }`}>
                          {complaint.status}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        {complaint.timestamp?.toDate().toLocaleString()}
                      </span>
                    </div>

                    {complaint.status === "Resolved" && (
                      <div className="mt-4 bg-green-50 p-4 rounded-lg">
                        <p className="text-green-800 font-semibold">Resolved by: {complaint.resolvedBy}</p>
                        <p className="text-green-800">{complaint.resolution}</p>
                        <p className="text-green-800 text-sm">
                          Resolved at: {complaint.resolvedAt?.toDate().toLocaleString()}
                        </p>
                      </div>
                    )}

                    {(userRole === "admin" || userRole === "faculty" || userRole === "hod") && (
                      <div className="mt-4 flex gap-2">
                        {complaint.status === "Pending" && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setResolvingComplaintId(complaint.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Resolve</span>
                          </motion.button>
                        )}
                        {resolvingComplaintId === complaint.id && (
                          <ResolutionInput
                            complaintId={complaint.id}
                            onResolve={handleResolve}
                            onCancel={() => setResolvingComplaintId(null)}
                            resolutionText={resolutionText}
                            setResolutionText={setResolutionText}
                          />
                        )}
                        {userRole === "admin" && complaints.status === "Resolved" && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDelete(complaint.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </motion.button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {complaints.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-gray-500"
                >
                  No complaints submitted yet.
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ComplaintForm;