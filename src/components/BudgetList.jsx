import React from "react";
import { Link } from "react-router-dom";

const BudgetList = ({ budgets }) => {
  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Department / Event Budgets</h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-2 px-4 border">Department</th>
              <th className="py-2 px-4 border">Allocated (₹)</th>
              <th className="py-2 px-4 border">Spent (₹)</th>
              <th className="py-2 px-4 border">Balance (₹)</th>
              <th className="py-2 px-4 border">Proofs</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((budget) => (
              <tr key={budget.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border text-center">{budget.department}</td>
                <td className="py-2 px-4 border text-center font-medium">₹{budget.allocated}</td>
                <td className="py-2 px-4 border text-center font-medium text-red-600">₹{budget.spent}</td>
                <td className="py-2 px-4 border text-center font-medium text-green-600">
                  ₹{budget.allocated - budget.spent}
                </td>
                <td className="py-2 px-4 border text-center">
                  <Link
                    to={`/budget/${budget.id}`}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    📜 View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetList;
