import React from "react";
import { useInventory } from "../components/InventoryContext.jsx";

const InventoryList = () => {
  const { items } = useInventory();

  return (
    <div>
      <h2>Sports Equipment</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {items.map(item => (
          <div key={item.id} style={{ border: "1px solid #ddd", padding: 20, margin: 10 }}>
            <img src={item.imageUrl} alt={item.name} width="150" height="150" />
            <h3>{item.name}</h3>
            <p>{item.isAvailable ? "Available" : `Lent to ${item.lentTo}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryList;
