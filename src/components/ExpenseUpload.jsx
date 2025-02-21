import React, { useState } from "react";
import { uploadExpenseProof } from "../firebase/expenseServices";

const ExpenseUpload = () => {
  const [file, setFile] = useState(null);
  const [expenseData, setExpenseData] = useState({
    title: "",
    amount: 0,
  });

  const handleChange = (e) => {
    setExpenseData({ ...expenseData, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file!");

    try {
      const url = await uploadExpenseProof(file, expenseData);
      alert(`Proof uploaded successfully: ${url}`);
    } catch (error) {
      alert("Upload failed. Please check console for details.");
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">Upload Expense Proof</h2>

      <input
        type="text"
        name="title"
        placeholder="Expense Title"
        onChange={handleChange}
        className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="number"
        name="amount"
        placeholder="Amount Spent (₹)"
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
        className="w-full py-2 mt-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Upload Proof
      </button>
    </div>
  );
};

export default ExpenseUpload;
