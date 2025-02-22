import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig.js";
import { collection } from "firebase/firestore";

import { getDocs, addDoc, updateDoc, doc } from "firebase/firestore";

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Fetch items from Firestore
  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, "sportsEquipment"));
      setItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchItems();
  }, []);

  // Lend an item
  const lendItem = async (itemId, user, timeIn, timeOut) => {
    const itemRef = doc(db, "sportsEquipment", itemId);
    await updateDoc(itemRef, {
      lentTo: user,
      timeIn,
      timeOut,
      isAvailable: false,
    });
  };

  return (
    <InventoryContext.Provider value={{ items, lendItem }}>
      {children}
    </InventoryContext.Provider>
  );
};
