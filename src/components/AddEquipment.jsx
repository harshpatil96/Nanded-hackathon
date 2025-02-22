import React, { useState } from "react";
import { db, collection } from "../firebase";
import { addDoc } from "firebase/firestore";

const AddEquipment = () => {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "sportsEquipment"), {
      name,
      imageUrl,
      isAvailable: true,
      lentTo: "",
      timeIn: "",
      timeOut: ""
    });
    setName("");
    setImageUrl("");
    alert("Item Added!");
  };

  return (
    <div>
      <h2>Add Equipment</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Equipment Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
        <button type="submit">Add Equipment</button>
      </form>
    </div>
  );
};

export default AddEquipment;
