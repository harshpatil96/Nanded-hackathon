import React, { useEffect, useState } from "react";
import { getBudgets, deleteBudget } from "../firebase/budgetServices";

const BudgetTable = () => {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    const data = await getBudgets();
    setBudgets(data);
  };

  const handleDelete = async (id) => {
    await deleteBudget(id);
    fetchBudgets();
  };

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">College Budgets</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-3 px-4 border">Title</th>
              <th className="py-3 px-4 border">Allocated (₹)</th>
              <th className="py-3 px-4 border">Spent (₹)</th>
              <th className="py-3 px-4 border">Balance (₹)</th>
              <th className="py-3 px-4 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {budgets.length > 0 ? (
              budgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-gray-100 text-center">
                  <td className="py-3 px-4 border">{budget.title}</td>
                  <td className="py-3 px-4 border font-medium">₹{budget.allocated}</td>
                  <td className="py-3 px-4 border font-medium text-red-600">₹{budget.spent}</td>
                  <td className="py-3 px-4 border font-medium text-green-600">
                    ₹{budget.allocated - budget.spent}
                  </td>
                  <td className="py-3 px-4 border">
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded transition-all"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 text-gray-500 text-center">
                  No budget records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetTable;
