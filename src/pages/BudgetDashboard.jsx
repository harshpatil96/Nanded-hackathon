import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";
import BudgetList from "../components/BudgetList.jsx";
import BudgetTable from "../components/BudgetTable.jsx";
import ExpenseUpload from "../components/ExpenseUpload.jsx";
import BudgetForm from "../components/BudgetForm.jsx";

const Dashboard = () => {
  const [budgets, setBudgets] = useState([]);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  
  // ✅ Added states for handling budget form
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchBudgets = async () => {
      const querySnapshot = await getDocs(collection(db, "budgets"));
      let budgetData = [];
      let allocated = 0;
      let spent = 0;

      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        budgetData.push(data);
        allocated += data.allocated;
        spent += data.spent;
      });

      setBudgets(budgetData);
      setTotalAllocated(allocated);
      setTotalSpent(spent);
    };

    fetchBudgets();
  }, []);

  // ✅ Function to handle budget edit
  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setShowForm(true);
  };

  // ✅ Function to close budget form
  const handleCloseForm = () => {
    setSelectedBudget(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <h2 className="text-4xl font-bold text-center text-blue-700 mb-6">
        📊 College Budget Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">💰 Total Allocated</h3>
          <p className="text-2xl font-bold">₹{totalAllocated}</p>
        </div>
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">💸 Total Spent</h3>
          <p className="text-2xl font-bold">₹{totalSpent}</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">🔢 Balance</h3>
          <p className="text-2xl font-bold">₹{totalAllocated - totalSpent}</p>
        </div>
      </div>

      {/* Budget List */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Department Budgets</h3>
        <BudgetList budgets={budgets} onEdit={handleEdit} />
      </div>

      {/* Budget Table */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Budget Records</h3>
        <BudgetTable />
      </div>

      {/* Expense Upload & Budget Form */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Upload Expense Proof</h3>
          <ExpenseUpload />
        </div>
        
        {/* ✅ Conditional rendering for BudgetForm */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Add/Edit Budget</h3>
          {showForm ? (
            <BudgetForm existingBudget={selectedBudget} onClose={handleCloseForm} />
          ) : (
            <button 
              className="w-full py-2 mt-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              onClick={() => setShowForm(true)}
            >
              Add New Budget
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
