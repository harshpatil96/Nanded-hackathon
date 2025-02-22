import { db, storage } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

const expenseCollectionRef = collection(db, "expenses");

// Upload proof and save data in Firestore
export const uploadExpenseProof = async (file, expenseData) => {
  try {
    const storageRef = ref(storage, `proofs/${encodeURIComponent(file.name)}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Save to Firestore
    await addDoc(expenseCollectionRef, { ...expenseData, proofURL: downloadURL });

    return downloadURL;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
