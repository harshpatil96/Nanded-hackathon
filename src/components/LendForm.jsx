import React, { useState } from "react";
import { useInventory } from "../context/InventoryContext";

const LendForm = ({ item }) => {
  const { lendItem } = useInventory();
  const [user, setUser] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");

  const handleLend = async () => {
    await lendItem(item.id, user, timeIn, timeOut);
    alert(`${item.name} lent to ${user}`);
  };

  return (
    <div>
      <h3>Lend {item.name}</h3>
      <input type="text" placeholder="User Name" value={user} onChange={(e) => setUser(e.target.value)} />
      <input type="datetime-local" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} />
      <input type="datetime-local" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} />
      <button onClick={handleLend} disabled={!item.isAvailable}>
        {item.isAvailable ? "Lend Item" : "Already Lent"}
      </button>
    </div>
  );
};

export default LendForm;
