import React, { useEffect, useState } from "react";
import { getBudgets, deleteBudget } from "../firebase/budgetServices";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase/firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

const BudgetTable = () => {
  const [budgets, setBudgets] = useState([]);
  const [role, setRole] = useState(""); // Fix: Ensure correct state name

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    const fetchUserRole = async (userId) => {
      if (!userId) return;
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setRole(userDoc.data().role); // Fix: Properly setting the role
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserRole(user.uid);
      } else {
        setRole(""); // Reset role if no user is logged in
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const fetchBudgets = async () => {
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      fetchBudgets();
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
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
              {(role === "admin" || role === "faculty" || role === "hod") && (
              <th className="py-3 px-4 border">Action</th>
            )}
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
                  {(role === "admin" || role === "hod") && (
                  <td className="py-3 px-4 border">
                    {/* Fix: Only show delete button if user is admin, faculty, or HOD */}
                   
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded transition-all"
                      >
                        Delete
                      </button>
                   
                  </td>
                   )}
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
