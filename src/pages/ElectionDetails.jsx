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
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Election Details */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                <h1 className="text-4xl font-bold text-blue-800 mb-2">{election?.name}</h1>
                <p className="text-lg text-gray-700 mb-1">Role: {election?.role}</p>
                <p className="text-lg text-gray-700 mb-1">Voting Date: {election?.votingDate}</p>
                <p className="text-lg text-gray-700">
                    Voting Time: {election?.votingTime?.start} - {election?.votingTime?.end}
                </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mb-6">
                <button
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
                    onClick={() => setShowForm(true)}
                >
                    Apply Now
                </button>

                <button
                    className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md transition-transform transform hover:scale-105 ${
                        userVote ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={userVote !== null}
                    onClick={() => alert("Redirecting to voting section...")}
                >
                    {userVote ? "Voted" : "Vote"}
                </button>
            </div>

            {/* Application Form */}
            {showForm && (
                <form onSubmit={handleApplyNow} className="bg-white p-6 rounded-lg shadow-lg mb-6 animate-fade-in">
                    <h2 className="text-2xl font-bold text-blue-800 mb-4">Candidate Application Form</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="name" placeholder="Full Name" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleInputChange} />
                        <input type="text" name="rollNumber" placeholder="Roll Number / Student ID" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleInputChange} />
                        <input type="email" name="email" placeholder="College Email ID" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleInputChange} />
                        <input type="text" name="mobile" placeholder="Mobile Number" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleInputChange} />
                        <input type="text" name="courseYear" placeholder="Course & Year" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleInputChange} />
                        <input type="text" name="branch" placeholder="Branch/Department" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleInputChange} />
                        <input type="text" name="cgpa" placeholder="Current CGPA/Percentage" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleInputChange} />
                        <input type="file" name="profilePhoto" accept="image/*" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleFileChange} />
                    </div>
                    <textarea name="whyApply" placeholder="Why do you want to apply?" required className="w-full p-3 border rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleInputChange} />
                    <textarea name="goals" placeholder="Your goals if elected?" required className="w-full p-3 border rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleInputChange} />
                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg mt-4 shadow-md transition-transform transform hover:scale-105">
                        Submit
                    </button>
                </form>
            )}

         

            {/* Candidates Section */}
            <h2 className="text-3xl font-bold text-blue-800 mb-6">Candidates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates.map(candidate => (
                    <div key={candidate.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in">
                        <div className="flex items-center space-x-4 mb-4">
                            {candidate.profilePhotoURL && (
                                <img src={candidate.profilePhotoURL} alt={candidate.name} className="w-16 h-16 rounded-full object-cover" />
                            )}
                            <h3 className="text-2xl font-bold text-blue-800">{candidate.name}</h3>
                        </div>
                        <p className="text-gray-700">{candidate.whyApply}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ElectionDetails;