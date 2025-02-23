import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInventory } from "../components/InventoryContext.jsx";
import AddEquipment from "./AddEquipment.jsx";

const InventoryList = () => {
  let { items } = useInventory(); // Ensuring useInventory is not undefined

  useEffect(() => {
    console.log("Items in InventoryList:", items); // Debugging
  }, [items]);

  if (!items) return <p className="text-center text-gray-600">Loading inventory...</p>; // Ensure items is not undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Sports Equipment</h2>
        <AnimatePresence>
          {items.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-600"
            >
              No Items Found
            </motion.p>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="p-6">
                    {item.imageUrl ? (
                      <motion.img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg mb-4">
                        <p className="text-gray-500">No Image Available</p>
                      </div>
                    )}

                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
                    <p
                      className={`text-sm font-medium ${item.isAvailable ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {item.isAvailable ? "Available" : `Lent to ${item.lentTo || "Unknown"}`}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <AddEquipment />
      </motion.div>
    </div>
  );
};

export default InventoryList;