import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, doc, deleteDoc, addDoc } from "firebase/firestore";

const AdminExpenseApproval = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch pending expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "expenses"));
        const expensesList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setExpenses(expensesList);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  // Approve expense
  const handleApprove = async (expense) => {
    try {
      await addDoc(collection(db, "budgets"), {
        title: expense.title,
        allocated: expense.amount, // Fix: Store as allocated
        spent: 0, // Default to 0
        imageBase64: expense.imageBase64,
        timestamp: new Date(),
        status: "Approved",
      });
  
      await deleteDoc(doc(db, "expenses", expense.id));
      setExpenses(expenses.filter((item) => item.id !== expense.id));
      setMessage("Expense approved and added to budget!");
    } catch (error) {
      console.error("Approval error:", error);
      setMessage("Failed to approve expense.");
    }
  };
  

  // Reject expense
  const handleReject = async (expenseId) => {
    try {
      await deleteDoc(doc(db, "expenses", expenseId));
      setExpenses(expenses.filter((item) => item.id !== expenseId));
      setMessage("Expense rejected and removed.");
    } catch (error) {
      console.error("Rejection error:", error);
      setMessage("Failed to reject expense.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Admin Expense Approval</h3>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {loading ? (
        <p>Loading expenses...</p>
      ) : expenses.length === 0 ? (
        <p>No pending expenses.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="p-4 border rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold">{expense.title}</h4>
              <p className="text-gray-600">Amount: ₹{expense.amount}</p>
              {expense.imageBase64 && (
                <img
                  src={expense.imageBase64}
                  alt="Expense Proof"
                  className="w-full h-40 object-cover mt-2 rounded-lg"
                />
              )}
              <div className="flex justify-between mt-4">
                <button onClick={() => handleApprove(expense)} className="px-4 py-2 bg-green-500 text-white rounded-lg">Approve</button>
                <button onClick={() => handleReject(expense.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminExpenseApproval;
