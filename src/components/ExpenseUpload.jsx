import React, { useState } from "react";
import { uploadExpenseProof } from "../firebase/expenseServices";

const ExpenseUpload = () => {
  const [file, setFile] = useState(null);
  const [expenseData, setExpenseData] = useState({
    title: "",
    amount: "",
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setExpenseData({ ...expenseData, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file!");
    if (!expenseData.title || !expenseData.amount) {
      return alert("Please fill in all fields!");
    }

    setUploading(true);
    try {
      const url = await uploadExpenseProof(file, expenseData);
      alert("Proof uploaded successfully!");
      setExpenseData({ title: "", amount: "" });
      setFile(null);
    } catch (error) {
      alert("Upload failed. Check console for details.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
        Upload Expense Proof
      </h2>

      <input
        type="text"
        name="title"
        placeholder="Expense Title"
        value={expenseData.title}
        onChange={handleChange}
        className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="number"
        name="amount"
        placeholder="Amount Spent (₹)"
        value={expenseData.amount}
        onChange={handleChange}
        className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg file:bg-blue-600 file:text-white file:py-2 file:px-4 file:rounded-md file:border-0 file:cursor-pointer hover:file:bg-blue-700"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className={`w-full py-2 mt-3 font-semibold text-white rounded-lg ${
          uploading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {uploading ? "Uploading..." : "Upload Proof"}
      </button>
    </div>
  );
};

export default ExpenseUpload;
