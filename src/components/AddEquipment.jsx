// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { db, storage } from "../firebase/firebaseConfig.js";
// import { collection, addDoc } from "firebase/firestore";
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// const AddEquipment = () => {
//   const [name, setName] = useState("");
//   const [image, setImage] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleFileChange = (e) => {
//     if (e.target.files[0]) {
//       setImage(e.target.files[0]);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!image) {
//       alert("Please select an image.");
//       return;
//     }
//     setIsSubmitting(true);

//     try {
//       // Upload image to Firebase Storage
//       const storageRef = ref(storage, `sportsEquipment/${image.name}`);
//       const uploadTask = uploadBytesResumable(storageRef, image);

//       uploadTask.on(
//         "state_changed",
//         null,
//         (error) => {
//           console.error("Upload failed:", error);
//           alert("Image upload failed. Try again.");
//           setIsSubmitting(false);
//         },
//         async () => {
//           const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

//           // Save item data to Firestore
//           await addDoc(collection(db, "sportsEquipment"), {
//             name,
//             imageUrl: downloadURL,
//             isAvailable: true,
//             lentTo: "",
//             timeIn: "",
//             timeOut: "",
//           });

//           setName("");
//           setImage(null);
//           alert("Item Added Successfully!");
//           setIsSubmitting(false);
//         }
//       );
//     } catch (error) {
//       console.error("Error adding equipment:", error);
//       alert("Failed to add item. Try again.");
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
//       <motion.div
//         initial={{ opacity: 0, y: -50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
//       >
//         <div className="p-8">
//           <motion.h2
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2, duration: 0.5 }}
//             className="text-3xl font-bold text-center text-gray-800 mb-6"
//           >
//             Add New Equipment
//           </motion.h2>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-gray-600 font-medium mb-2">Equipment Name:</label>
//               <input
//                 type="text"
//                 placeholder="Enter equipment name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//                 className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//               />
//             </div>
//             <div>
//               <label className="block text-gray-600 font-medium mb-2">Upload Image:</label>
//               <input
//                 type="file"
//                 onChange={handleFileChange}
//                 accept="image/*"
//                 required
//                 className="w-full px-4 py-3 border border-gray-200 rounded-lg"
//               />
//             </div>
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               type="submit"
//               disabled={isSubmitting}
//               className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center"
//             >
//               {isSubmitting ? "Uploading..." : "Add Equipment"}
//             </motion.button>
//           </form>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default AddEquipment;
