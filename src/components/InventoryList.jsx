import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig.js";
import { collection, onSnapshot, updateDoc, doc, addDoc, query, where, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [lentItems, setLentItems] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const authInstance = getAuth();
    const user = authInstance.currentUser;
    if (user) {
      setUserEmail(user.email);
    }
  }, []);

  // Real-time listener for inventory
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "sports"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for lent equipment
  useEffect(() => {
    const q = query(collection(db, "lentEquipment"), where("returned", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLentItems(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    return () => unsubscribe();
  }, []);

  // Real-time check for returning items
  useEffect(() => {
    const checkReturnTimes = async () => {
      const now = new Date().toISOString(); // Current time in ISO format

      // Find items that need to be returned
      const itemsToReturn = lentItems.filter(item => item.timeTo <= now);

      for (const item of itemsToReturn) {
        await handleReturn(item);
      }
    };

    // Check every minute
    const interval = setInterval(checkReturnTimes, 60000);
    return () => clearInterval(interval);
  }, [lentItems]);

  const handleLend = async () => {
    if (!selectedItem || !quantity || !timeFrom || !timeTo) {
      alert("Please fill in all fields");
      return;
    }

    const qty = parseInt(quantity);
    if (qty <= 0 || qty > selectedItem.count) {
      alert("Invalid quantity");
      return;
    }

    try {
      // Update inventory count
      await updateDoc(doc(db, "sports", selectedItem.id), {
        count: selectedItem.count - qty
      });

      // Add lent record
      await addDoc(collection(db, "lentEquipment"), {
        userEmail,
        equipment: selectedItem.equipment,
        equipmentId: selectedItem.id,
        quantity: qty,
        timeFrom,
        timeTo,
        returned: false,
        lentDate: new Date().toISOString()
      });

      // Close modal and reset form
      setIsModalOpen(false);
      setSelectedItem(null);
      setQuantity("");
      setTimeFrom("");
      setTimeTo("");
    } catch (error) {
      console.error("Error lending item:", error);
      alert("Failed to lend item");
    }
  };

  const handleReturn = async (lentItem) => {
    try {
      // Update inventory count
      const itemRef = doc(db, "sports", lentItem.equipmentId);
      const item = items.find(i => i.id === lentItem.equipmentId);
      if (item) {
        await updateDoc(itemRef, {
          count: item.count + lentItem.quantity
        });
      }

      // Remove lent record
      await deleteDoc(doc(db, "lentEquipment", lentItem.id));
    } catch (error) {
      console.error("Error returning item:", error);
      alert("Failed to return item");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Inventory Grid */}
        <div>
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
            Sports Equipment Inventory
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 p-4">
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  {item.img ? (
                    <img src={item.img} alt={item.equipment} className="w-full h-full object-cover" />
                  ) : (
                    <p className="text-gray-500">No Image</p>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.equipment}</h3>
                <p className="text-sm text-gray-700">Available: {item.count || 0}</p>
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setIsModalOpen(true);
                  }}
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  Lend Equipment
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Currently Lent Equipment */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Currently Lent Equipment</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lent To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Until</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lentItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.equipment}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.userEmail}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(item.timeFrom).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(item.timeTo).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md">
              <h3 className="text-xl font-bold mb-4">
                Lend {selectedItem?.equipment}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    min="1"
                    max={selectedItem?.count}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">From</label>
                  <input
                    type="datetime-local"
                    value={timeFrom}
                    onChange={(e) => setTimeFrom(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">To</label>
                  <input
                    type="datetime-local"
                    value={timeTo}
                    onChange={(e) => setTimeTo(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedItem(null);
                      setQuantity("");
                      setTimeFrom("");
                      setTimeTo("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLend}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;