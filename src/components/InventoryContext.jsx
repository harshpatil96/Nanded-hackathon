import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig.js";
import { collection, getDocs, addDoc } from "firebase/firestore";

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const equipmentCollection = collection(db, "sportsEquipment");

  // Function to fetch inventory from Firestore
  const fetchItems = async () => {
    const querySnapshot = await getDocs(equipmentCollection);
    setItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // Function to add default items if collection is empty
  const addDefaultItems = async () => {
    const querySnapshot = await getDocs(equipmentCollection);
    
    if (querySnapshot.empty) { // Check if Firestore collection is empty
      const defaultItems = [
        { name: "Football", imageUrl: "https://example.com/football.jpg", isAvailable: true, lentTo: "", timeIn: "", timeOut: "" },
        { name: "Basketball", imageUrl: "https://example.com/basketball.jpg", isAvailable: true, lentTo: "", timeIn: "", timeOut: "" },
        { name: "Tennis Racket", imageUrl: "https://example.com/tennis-racket.jpg", isAvailable: true, lentTo: "", timeIn: "", timeOut: "" }
      ];

      for (const item of defaultItems) {
        await addDoc(equipmentCollection, item);
      }
      console.log("Default equipment added.");
    } else {
      console.log("Equipment already exists.");
    }
  };

  useEffect(() => {
    addDefaultItems(); // Run only once on mount
    fetchItems();
  }, []);

  return (
    <InventoryContext.Provider value={{ items }}>
      {children}
    </InventoryContext.Provider>
  );
};
