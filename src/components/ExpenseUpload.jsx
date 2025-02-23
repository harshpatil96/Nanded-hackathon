import { useState } from "react";
import { db } from "../firebase/firebaseConfig"; // Import Firestore
import { collection, addDoc } from "firebase/firestore"; // Import Firestore functions

const ExpenseUpload = () => {
  const [file, setFile] = useState(null);
  const [expenseData, setExpenseData] = useState({
    title: "",
    amount: "",
    imageBase64: "", // Store base64 image
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setExpenseData({ ...expenseData, [e.target.name]: e.target.value });
  };

  // Handle file selection and convert to Base64
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => {
        setExpenseData((prev) => ({ ...prev, imageBase64: reader.result }));
      };
      setFile(selectedFile);
    }
  };

  // Handle form submission
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file!");
      return;
    }
    if (!expenseData.title || !expenseData.amount) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Save the expense data (including Base64 image) to Firestore
      const docRef = await addDoc(collection(db, "expenses"), {
        title: expenseData.title,
        amount: expenseData.amount,
        imageBase64: expenseData.imageBase64, // Store Base64 image
        timestamp: new Date(),
      });

      console.log("Expense proof uploaded with ID:", docRef.id);
      alert("Expense proof uploaded successfully!");

      // Reset form
      setExpenseData({ title: "", amount: 0, imageBase64: "" });
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      setError("Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
        Upload Expense Proof
      </h2>

      {/* Expense Title */}
      <input
        type="text"
        name="title"
        placeholder="Expense Title"
        value={expenseData.title}
        onChange={handleChange}
        className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      {/* Amount Spent */}
      <input
        type="number"
        name="amount"
        placeholder="Amount Spent (₹)"
        value={expenseData.amount}
        onChange={handleChange}
        className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      {/* File Input */}
      <input
        type="file"
        onChange={handleFileChange}
        className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg file:bg-blue-600 file:text-white file:py-2 file:px-4 file:rounded-md file:border-0 file:cursor-pointer hover:file:bg-blue-700"
      />

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm mb-3 text-center">{error}</div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={isLoading}
        className="w-full py-2 mt-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
      >
        {isLoading ? "Uploading..." : "Upload Proof"}
      </button>
    </div>
  );
};

export default ExpenseUpload;
