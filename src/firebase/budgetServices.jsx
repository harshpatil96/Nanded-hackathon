// src/firebase/budgetServices.js
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const budgetCollectionRef = collection(db, "budgets");

// Add a new budget
export const addBudget = async (budget) => {
  try {
    await addDoc(budgetCollectionRef, budget);
    console.log("Budget Added");
  } catch (error) {
    console.error("Error adding budget:", error);
  }
};

// Get all budgets
export const getBudgets = async () => {
  try {
    const snapshot = await getDocs(budgetCollectionRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching budgets:", error);
  }
};

// Update budget
export const updateBudget = async (id, updatedBudget) => {
  try {
    const budgetDoc = doc(db, "budgets", id);
    await updateDoc(budgetDoc, updatedBudget);
    console.log("Budget Updated");
  } catch (error) {
    console.error("Error updating budget:", error);
  }
};

// Delete budget
export const deleteBudget = async (id) => {
  try {
    const budgetDoc = doc(db, "budgets", id);
    await deleteDoc(budgetDoc);
    console.log("Budget Deleted");
  } catch (error) {
    console.error("Error deleting budget:", error);
  }
};
