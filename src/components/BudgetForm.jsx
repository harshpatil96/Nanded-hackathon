import React, { useState } from "react";
import { db } from "../firebase/firebaseConfig.js";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

const BudgetForm = ({ existingBudget, onClose = () => {} }) => {
  const [department, setDepartment] = useState(existingBudget?.department || "");
  const [allocated, setAllocated] = useState(existingBudget?.allocated || "");
  const [spent, setSpent] = useState(existingBudget?.spent || "");
  const [proofs, setProofs] = useState(existingBudget?.proofs || "");
  const isEditing = !!existingBudget;

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const budgetData = {
      department,
      allocated: Number(allocated),
      spent: Number(spent),
      proofs,
    };

    try {
      if (isEditing) {
        // Update existing budget
        await updateDoc(doc(db, "budgets", existingBudget.id), budgetData);
        alert("Budget updated successfully!");
      } else {
        // Add new budget
        await addDoc(collection(db, "budgets"), budgetData);
        alert("New budget added successfully!");
      }
      onClose(); // Close modal or reset form
    } catch (error) {
      console.error("Error saving budget:", error);
      alert("Failed to save budget.");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">
        {isEditing ? "Edit Budget" : "Add Budget"}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-gray-700 font-medium">Department / Event Name:</label>
        <input
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <label className="text-gray-700 font-medium">Allocated Budget (₹):</label>
        <input
          type="number"
          value={allocated}
          onChange={(e) => setAllocated(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <label className="text-gray-700 font-medium">Spent Amount (₹):</label>
        <input
          type="number"
          value={spent}
          onChange={(e) => setSpent(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <label className="text-gray-700 font-medium">Proofs (Receipt URLs):</label>
        <input
          type="text"
          value={proofs}
          onChange={(e) => setProofs(e.target.value)}
          placeholder="Enter image/document URL"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <button type="submit" className="w-full py-2 mt-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          {isEditing ? "Update" : "Add"} Budget
        </button>
        <button type="button" className="w-full py-2 mt-3 font-semibold text-white bg-gray-400 rounded-lg hover:bg-gray-500" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default BudgetForm;
