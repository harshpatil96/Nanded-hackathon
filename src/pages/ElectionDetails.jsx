import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth, storage } from "../firebase/firebaseConfig.js"; // Import Firebase config
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // For profile photo upload

const ElectionDetails = () => {
    const { electionId } = useParams();
    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [userVote, setUserVote] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        rollNumber: "",
        email: "",
        mobile: "",
        courseYear: "",
        branch: "",
        cgpa: "",
        profilePhoto: null,
        whyApply: "",
        goals: "",
    });

    const user = auth.currentUser;

    useEffect(() => {
        if (!electionId) return;

        const fetchElectionDetails = async () => {
            try {
                const electionDoc = await getDoc(doc(db, "elections", electionId));
                if (electionDoc.exists()) {
                    setElection({ id: electionDoc.id, ...electionDoc.data() });
                }

                const q = query(collection(db, "candidates"), where("electionId", "==", electionId));
                const candidatesSnapshot = await getDocs(q);
                setCandidates(candidatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                if (user) {
                    const userVoteDoc = await getDoc(doc(db, "votes", user.uid));
                    if (userVoteDoc.exists() && userVoteDoc.data()[electionId]) {
                        setUserVote(userVoteDoc.data()[electionId]);
                    }
                }
            } catch (error) {
                console.error("Error fetching election details:", error);
            }
        };

        fetchElectionDetails();
    }, [electionId, user]);

    // Handle Input Change
    const handleInputChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
    };

    // Handle File Upload Change
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFormData((prevData) => ({
                ...prevData,
                profilePhoto: e.target.files[0],
            }));
        }
    };

    // Handle Form Submission
    const handleApplyNow = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please log in to apply.");
            return;
        }

        try {
            let profilePhotoURL = "";
            if (formData.profilePhoto) {
                const storageRef = ref(storage, `profile_photos/${user.uid}/${formData.profilePhoto.name}`);
                await uploadBytes(storageRef, formData.profilePhoto);
                profilePhotoURL = await getDownloadURL(storageRef);
            }

            const candidateData = {
                name: formData.name,
                rollNumber: formData.rollNumber,
                email: formData.email,
                mobile: formData.mobile,
                courseYear: formData.courseYear,
                branch: formData.branch,
                cgpa: formData.cgpa,
                profilePhotoURL,
                whyApply: formData.whyApply,
                goals: formData.goals,
                electionId: electionId,
                userId: user.uid,
                votes: [],
            };

            await addDoc(collection(db, "candidates"), candidateData);
            alert("Application submitted successfully!");
            setShowForm(false); 

            // Refresh Candidate List
            setCandidates([...candidates, candidateData]);
        } catch (error) {
            console.error("Error applying as candidate:", error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold">{election?.name}</h1>
            <p className="text-lg text-gray-600">Role: {election?.role}</p>
            <p className="text-lg text-gray-600">Voting Date: {election?.votingDate}</p>
            <p className="text-lg text-gray-600">
                Voting Time: {election?.votingTime?.start} - {election?.votingTime?.end}
            </p>

            <div className="mt-4 flex gap-4">
                <button 
                    className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
                    onClick={() => setShowForm(true)}
                >
                    Apply Now
                </button>

                <button 
                    className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    disabled={userVote !== null}
                    onClick={() => alert("Redirecting to voting section...")}
                >
                    {userVote ? "Voted" : "Vote"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleApplyNow} className="mt-6 p-4 border rounded shadow-md">
                    <h2 className="text-xl font-bold mb-4">Candidate Application Form</h2>
                    <input type="text" name="name" placeholder="Full Name" required className="w-full p-2 border mb-2" onChange={handleInputChange} />
                    <input type="text" name="rollNumber" placeholder="Roll Number / Student ID" required className="w-full p-2 border mb-2" onChange={handleInputChange} />
                    <input type="email" name="email" placeholder="College Email ID" required className="w-full p-2 border mb-2" onChange={handleInputChange} />
                    <input type="text" name="mobile" placeholder="Mobile Number" required className="w-full p-2 border mb-2" onChange={handleInputChange} />
                    <input type="text" name="courseYear" placeholder="Course & Year" required className="w-full p-2 border mb-2" onChange={handleInputChange} />
                    <input type="text" name="branch" placeholder="Branch/Department" className="w-full p-2 border mb-2" onChange={handleInputChange} />
                    <input type="text" name="cgpa" placeholder="Current CGPA/Percentage" required className="w-full p-2 border mb-2" onChange={handleInputChange} />
                    <input type="file" name="profilePhoto" accept="image/*" required className="w-full p-2 border mb-2" onChange={handleFileChange} />
                    <textarea name="whyApply" placeholder="Why do you want to apply?" required className="w-full p-2 border mb-2" onChange={handleInputChange} />
                    <textarea name="goals" placeholder="Your goals if elected?" required className="w-full p-2 border mb-2" onChange={handleInputChange} />
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">Submit</button>
                </form>
            )}

            <h2 className="text-2xl font-semibold mt-6">Candidates</h2>
            <div className="mt-4">
                {candidates.map(candidate => (
                    <div key={candidate.id} className="border p-4 rounded-lg shadow-md mb-4">
                        <h3 className="text-xl font-bold">{candidate.name}</h3>
                        <p>{candidate.whyApply}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ElectionDetails;
